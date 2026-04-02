import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (!stripeKey || !webhookSecret) {
      console.error('Stripe webhook not configured')
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })

    const body = await req.text()
    const sig = req.headers.get('stripe-signature') ?? ''

    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(JSON.stringify({ error: `Webhook signature error: ${err.message}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Helper: patch a user's profile
    const patchProfile = async (userId: string, fields: Record<string, unknown>) => {
      const res = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(fields),
      })
      if (!res.ok) {
        const text = await res.text()
        console.error(`Failed to patch profile for user ${userId}: ${text}`)
      }
    }

    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.payment_status !== 'paid') break

        const userId = session.client_reference_id
        const purchaseType = session.metadata?.purchase_type

        if (!userId) {
          console.error('checkout.session.completed: missing client_reference_id')
          break
        }

        if (purchaseType === 'salary_addon') {
          // One-time salary negotiation add-on
          await patchProfile(userId, { salary_negotiator_unlocked: true })
          console.log(`Unlocked salary negotiator for user ${userId}`)
        } else if (purchaseType === 'pro_lifetime') {
          // One-time lifetime Pro purchase — set tier AND mark as lifetime so
          // a future subscription cancellation doesn't downgrade them
          await patchProfile(userId, { tier: 'pro', is_lifetime_pro: true })
          console.log(`Granted lifetime Pro to user ${userId}`)
        } else {
          // pro_monthly or legacy sessions without metadata
          await patchProfile(userId, { tier: 'pro' })
          console.log(`Upgraded user ${userId} to Pro (monthly)`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        // Subscription cancelled and period ended — downgrade to free,
        // but only if the user is NOT a lifetime Pro member
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_uid
        if (!userId) break

        // Fetch current profile to check lifetime status
        const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=is_lifetime_pro`, {
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
          },
        })
        const profiles = await profileRes.json()
        const isLifetime = profiles?.[0]?.is_lifetime_pro === true

        if (!isLifetime) {
          await patchProfile(userId, { tier: 'free' })
          console.log(`Downgraded user ${userId} to free (subscription ended)`)
        } else {
          console.log(`Skipped downgrade for lifetime user ${userId}`)
        }
        break
      }

      default:
        break
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Webhook error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
