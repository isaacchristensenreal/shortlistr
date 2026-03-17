import { supabase } from './supabase'

/**
 * Initiates a Stripe Checkout session for the Pro plan.
 * Calls the Supabase Edge Function which creates the session server-side,
 * then redirects the browser to Stripe's hosted checkout page.
 *
 * On success: Stripe redirects to /upgrade/success
 * On cancel:  Stripe redirects to /pricing
 */
export async function startCheckout(userId, userEmail) {
  const { data, error } = await supabase.functions.invoke('stripe-checkout', {
    body: { userId, userEmail },
  })

  if (error) throw new Error(error.message)
  if (data?.stripe_not_configured) {
    throw new Error('Pro upgrades are coming soon — check back shortly!')
  }
  if (data?.error) throw new Error(data.error)
  if (!data?.url) throw new Error('No checkout URL returned')

  // Redirect to Stripe's hosted checkout page (external URL — must use location, not router)
  window.location.href = data.url
}
