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
    const { userId, userEmail } = await req.json()
    if (!userId || !userEmail) throw new Error('userId and userEmail are required')

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
    const priceId = Deno.env.get('STRIPE_PRO_PRICE_ID') ?? ''

    // Return a clean flag when Stripe isn't configured yet (pre-launch)
    if (!stripeKey || !priceId) {
      return new Response(JSON.stringify({ stripe_not_configured: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const baseUrl = Deno.env.get('SITE_URL') ?? ''
    if (!baseUrl) {
      throw new Error('SITE_URL is not configured. Add it to Supabase Edge Function secrets.')
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

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      client_reference_id: userId,
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
