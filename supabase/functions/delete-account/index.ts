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

    // Best-effort: cancel Stripe subscription and delete customer
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
            await stripe.subscriptions.cancel(sub.id)
          }
          await stripe.customers.del(customerId)
        }
      } catch (_) {
        // Stripe cleanup failed — continue anyway
      }
    }

    const headers = {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
      'Content-Type': 'application/json',
    }

    // Delete saved_resumes
    await fetch(`${supabaseUrl}/rest/v1/saved_resumes?user_id=eq.${userId}`, {
      method: 'DELETE',
      headers,
    })

    // Delete profile
    await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'DELETE',
      headers,
    })

    // Delete auth user via GoTrue admin API
    const deleteRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers,
    })

    if (!deleteRes.ok) {
      const body = await deleteRes.text()
      throw new Error(`Auth delete failed: ${deleteRes.status} — ${body}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
