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
    const { userId, userEmail, billing, mode, cancelUrl } = await req.json()
    if (!userId || !userEmail) throw new Error('userId and userEmail are required')

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
    const baseUrl = Deno.env.get('SITE_URL') ?? ''

    if (!stripeKey) {
      return new Response(JSON.stringify({ stripe_not_configured: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })

    // Create or retrieve a Stripe customer tied to this user
    let customerId: string | undefined
    const existing = await stripe.customers.search({
      query: `metadata['supabase_uid']:'${userId}'`,
      limit: 1,
    })
    if (existing.data.length > 0) {
      customerId = existing.data[0].id
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { supabase_uid: userId },
      })
      customerId = customer.id
    }

    // ── Salary add-on (one-time $4.99) ─────────────────────────────────────
    if (mode === 'salary_addon') {
      const priceId = Deno.env.get('STRIPE_SALARY_PRICE_ID') ?? ''
      if (!priceId) throw new Error('STRIPE_SALARY_PRICE_ID is not configured')

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${baseUrl}/salary-negotiator?unlocked=1`,
        cancel_url: cancelUrl || `${baseUrl}/salary-negotiator`,
        client_reference_id: userId,
        metadata: { purchase_type: 'salary_addon', supabase_uid: userId },
      })

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── Pro Lifetime (one-time $149) ────────────────────────────────────────
    if (billing === 'lifetime') {
      const priceId = Deno.env.get('STRIPE_PRO_LIFETIME_PRICE_ID') ?? ''
      if (!priceId) throw new Error('STRIPE_PRO_LIFETIME_PRICE_ID is not configured')
      if (!baseUrl) throw new Error('SITE_URL is not configured')

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${baseUrl}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${baseUrl}/pricing`,
        client_reference_id: userId,
        metadata: { purchase_type: 'pro_lifetime', supabase_uid: userId },
      })

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── Pro Monthly (subscription $10/mo) ───────────────────────────────────
    const priceId = Deno.env.get('STRIPE_PRO_PRICE_ID') ?? ''
    if (!priceId) {
      return new Response(JSON.stringify({ stripe_not_configured: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!baseUrl) throw new Error('SITE_URL is not configured')

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${baseUrl}/pricing`,
      client_reference_id: userId,
      metadata: { purchase_type: 'pro_monthly', supabase_uid: userId },
      subscription_data: {
        metadata: { supabase_uid: userId },
      },
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
