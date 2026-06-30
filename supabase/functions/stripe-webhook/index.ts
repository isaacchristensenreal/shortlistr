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

    // Patch a row by id in a given table via service role (bypasses RLS).
    const patchRow = async (table: string, userId: string, fields: Record<string, unknown>) => {
      const res = await fetch(`${supabaseUrl}/rest/v1/${table}?id=eq.${userId}`, {
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
        console.error(`Failed to patch ${table} for user ${userId}: ${text}`)
      }
    }

    // B2B pivot: a single $99/mo plan. `profiles.tier` stays the source of
    // truth the rest of the app already gates on (AuthContext, Optimizer,
    // etc. — left untouched here); `coaches.plan` is kept in sync alongside
    // it since coaches is now the canonical paying-account record.
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.payment_status !== 'paid') break

        const userId = session.client_reference_id
        if (!userId) {
          console.error('checkout.session.completed: missing client_reference_id')
          break
        }

        await patchRow('profiles', userId, { tier: 'pro' })
        await patchRow('coaches', userId, { plan: 'active' })
        console.log(`Activated coach plan for user ${userId}`)
        break
      }

      case 'customer.subscription.deleted': {
        // Subscription cancelled and period ended — downgrade.
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_uid
        if (!userId) break

        await patchRow('profiles', userId, { tier: 'free' })
        await patchRow('coaches', userId, { plan: 'canceled' })
        console.log(`Deactivated coach plan for user ${userId} (subscription ended)`)
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
