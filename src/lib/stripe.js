import { supabase } from './supabase'

/**
 * Initiates a Stripe Checkout session for the single $99/mo coach plan.
 */
export async function startCheckout(userId, userEmail) {
  const cancelUrl = window.location.href
  const { data, error } = await supabase.functions.invoke('stripe-checkout', {
    body: { userId, userEmail, cancelUrl },
  })

  if (error) throw new Error(error.message)
  if (data?.stripe_not_configured) {
    throw new Error('Pro upgrades are coming soon — check back shortly!')
  }
  if (data?.error) throw new Error(data.error)
  if (!data?.url) throw new Error('No checkout URL returned')

  window.location.href = data.url
}
