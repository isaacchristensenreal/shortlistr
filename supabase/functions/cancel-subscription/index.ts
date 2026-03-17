import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json()
    if (!userId) throw new Error('userId is required')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')

    // Track whether Stripe scheduled a period-end cancellation
    let subscriptionCancelledInStripe = false
    let cancelAt: number | null = null

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (stripeKey) {
      try {
        const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })
        const customers = await stripe.customers.search({
          query: `metadata['supabase_uid']:'${userId}'`,
          limit: 1,
        })
        if (customers.data.length > 0) {
          const customerId = customers.data[0].id
          const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'active',
            limit: 10,
          })
          for (const sub of subscriptions.data) {
            // Schedule cancellation at period end — user keeps access until then
            const updated = await stripe.subscriptions.update(sub.id, {
              cancel_at_period_end: true,
            })
            cancelAt = updated.cancel_at
            subscriptionCancelledInStripe = true
          }
        }
      } catch (err) {
        console.error('Stripe operation failed:', err)
        // Fall through to immediate downgrade below
      }
    }

    // Only downgrade profile immediately if Stripe wasn't involved.
    // If Stripe is handling the cancellation, the stripe-webhook function
    // will downgrade the profile when customer.subscription.deleted fires
    // at the end of the billing period.
    if (!subscriptionCancelledInStripe) {
      const updateRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ tier: 'free' }),
      })
      if (!updateRes.ok) {
        const body = await updateRes.text()
        throw new Error(`Profile downgrade failed: ${updateRes.status} — ${body}`)
      }
    }

    return new Response(JSON.stringify({ success: true, cancel_at: cancelAt }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
