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

    // Read raw body for signature verification
    const body = await req.text()
    const sig = req.headers.get('stripe-signature') ?? ''

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(JSON.stringify({ error: `Webhook signature error: ${err.message}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const setTier = async (userId: string, tier: string) => {
      const res = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ tier }),
      })
      if (!res.ok) {
        const text = await res.text()
        console.error(`Failed to set tier=${tier} for user ${userId}: ${text}`)
      }
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        // User completed Stripe checkout — upgrade their profile to Pro
        const session = event.data.object as Stripe.Checkout.Session
        if (session.payment_status === 'paid' && session.client_reference_id) {
          await setTier(session.client_reference_id, 'pro')
          console.log(`Upgraded user ${session.client_reference_id} to pro`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        // Subscription has fully ended (fires when cancel_at_period_end period is over)
        // Downgrade the user back to free
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_uid
        if (userId) {
          await setTier(userId, 'free')
          console.log(`Downgraded user ${userId} to free (subscription ended)`)
        }
        break
      }

      default:
        // Other events (payment_intent.succeeded, etc.) — no action needed
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
