import { supabase } from './supabase'

/**
 * Initiates a Stripe Checkout session.
 * billing: 'monthly' (subscription $29/mo) | 'lifetime' (one-time $149)
 */
export async function startCheckout(userId, userEmail, billing = 'monthly') {
  const { data, error } = await supabase.functions.invoke('stripe-checkout', {
    body: { userId, userEmail, billing },
  })

  if (error) throw new Error(error.message)
  if (data?.stripe_not_configured) {
    throw new Error('Pro upgrades are coming soon — check back shortly!')
  }
  if (data?.error) throw new Error(data.error)
  if (!data?.url) throw new Error('No checkout URL returned')

  window.location.href = data.url
}
