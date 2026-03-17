import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { startCheckout } from '../lib/stripe'

const freeFeatures = ['3 resume optimizations / month', 'ATS keyword analysis', 'Basic bullet suggestions', 'Version history (last 3)']
const proFeatures = ['Unlimited optimizations', 'Full ATS keyword matching', 'AI bullet rewriting', 'Cover letter generation', 'Unlimited version history', 'Priority support']

const faqs = [
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel your Pro subscription at any time from your account settings. You keep access through the end of your billing period.' },
  { q: 'What counts as one optimization?', a: 'Each time you submit a resume + job description pair for AI analysis, that counts as one optimization.' },
  { q: 'Is my resume data private?', a: 'Your resumes are stored securely and are never shared with third parties or used to train AI models.' },
]

export default function Pricing() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const isPro = profile?.tier === 'pro'
  const [loading, setLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState(null)

  useEffect(() => {
    if (isPro) navigate('/dashboard', { replace: true })
  }, [isPro, navigate])

  const handleProCTA = async () => {
    if (!user) {
      // Visitor — send to signup
      navigate('/auth?mode=signup')
      return
    }
    if (isPro) {
      // Already Pro — send to dashboard
      navigate('/dashboard')
      return
    }
    // Logged-in free user — start Stripe Checkout
    setLoading(true)
    setCheckoutError(null)
    try {
      await startCheckout(user.id, user.email)
      // startCheckout redirects the browser — nothing runs after this on success
    } catch (err) {
      setCheckoutError('Could not start checkout. Please try again.')
      setLoading(false)
    }
  }

  const getFreeCTA = () => {
    if (!user) return { label: 'Get Started Free', action: () => navigate('/auth?mode=signup') }
    return { label: 'Go to Dashboard', action: () => navigate('/dashboard') }
  }

  const getProCTA = () => {
    if (isPro) return 'You\'re on Pro ✓'
    if (!user) return 'Start Pro — $10/mo'
    return 'Upgrade to Pro — $10/mo'
  }

  const freeCTA = getFreeCTA()

  return (
    <Layout>
      <div className="bg-white dark:bg-navy-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              Simple pricing, no surprises
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xl max-w-xl mx-auto">
              Start for free. Upgrade to Pro when you're ready for the full toolkit.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-20">

            {/* Free tier */}
            <div className="rounded-2xl p-8 border flex flex-col bg-slate-50 dark:bg-navy-800 border-slate-200 dark:border-white/10">
              <div className="mb-6">
                <h2 className="text-slate-900 dark:text-white font-bold text-2xl mb-1">Free</h2>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-bold text-slate-900 dark:text-white">$0</span>
                  <span className="text-slate-400 text-sm">/forever</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Great for occasional job seekers.</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-slate-600 dark:text-slate-300 text-sm">
                    <span className="text-electric-500 mt-0.5 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              {/* Free CTA — navigates to signup or dashboard depending on auth state */}
              <Button variant="secondary" className="w-full" size="lg" onClick={freeCTA.action}>
                {freeCTA.label}
              </Button>
            </div>

            {/* Pro tier */}
            <div className="rounded-2xl p-8 border flex flex-col bg-gradient-to-b from-electric-500/10 to-violet-500/5 border-electric-500/40 ring-1 ring-electric-500/20">
              <span className="text-xs font-semibold text-electric-500 dark:text-electric-400 uppercase tracking-wider mb-4">Most Popular</span>
              <div className="mb-6">
                <h2 className="text-slate-900 dark:text-white font-bold text-2xl mb-1">Pro</h2>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-bold text-slate-900 dark:text-white">$10</span>
                  <span className="text-slate-400 text-sm">/per month</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">For active job seekers who want every edge.</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-slate-600 dark:text-slate-300 text-sm">
                    <span className="text-electric-500 mt-0.5 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              {checkoutError && (
                <p className="text-red-500 dark:text-red-400 text-xs text-center mb-3">{checkoutError}</p>
              )}
              {/* Pro CTA — starts Stripe Checkout for logged-in users, signup for visitors */}
              <Button
                variant="primary"
                className="w-full"
                size="lg"
                onClick={handleProCTA}
                disabled={loading || isPro}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Redirecting…
                  </span>
                ) : getProCTA()}
              </Button>
            </div>

          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
              Frequently asked questions
            </h2>
            <div className="space-y-5">
              {faqs.map((faq) => (
                <div key={faq.q} className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
                  <h3 className="text-slate-900 dark:text-white font-semibold mb-2">{faq.q}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
