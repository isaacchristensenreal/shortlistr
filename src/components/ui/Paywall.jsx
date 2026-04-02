import { useState } from 'react'
import Button from './Button'
import { useAuth } from '../../context/AuthContext'
import { startCheckout } from '../../lib/stripe'

const features = [
  'Unlimited resume optimizations',
  'Full ATS keyword matching',
  'AI-powered bullet rewriting',
  'Cover letter generation',
  'Unlimited version history',
  'Priority support',
]

export default function Paywall({ onDismiss }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleUpgrade = async () => {
    // Start Stripe Checkout session → redirects to Stripe's hosted page
    setLoading(true)
    setError(null)
    try {
      await startCheckout(user?.id, user?.email)
      // startCheckout redirects the browser — nothing runs after this on success
    } catch (err) {
      setError('Could not start checkout. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white/70 dark:bg-navy-900/80 backdrop-blur-sm" />

      <div className="relative w-full max-w-lg bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Dismiss — goes back to dashboard without upgrading */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
          aria-label="Close"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Gradient top bar */}
        <div className="h-1 bg-gradient-to-r from-electric-500 to-violet-500" />

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-electric-500/10 border border-electric-500/30 text-electric-600 dark:text-electric-400 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
              ⚡ Upgrade to Pro
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Get the most out of ShortListr
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              You're on the Free plan — 3 optimizations per month. Upgrade to Pro for unlimited access to every feature.
            </p>
          </div>

          <div className="bg-gradient-to-r from-electric-500/10 to-violet-500/10 border border-electric-500/30 rounded-xl p-5 mb-6 flex items-center justify-between">
            <div>
              <p className="text-slate-900 dark:text-white font-bold text-lg">Pro Plan</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Everything, unlimited.</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">$29</span>
              <span className="text-slate-400 text-sm"> /month</span>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-2 mb-8">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-slate-600 dark:text-slate-300 text-sm">
                <span className="text-electric-500 mt-0.5 shrink-0">✓</span>
                {f}
              </li>
            ))}
          </ul>

          {error && (
            <p className="text-red-500 dark:text-red-400 text-xs text-center mb-3">{error}</p>
          )}

          {/* Upgrade button — initiates Stripe Checkout, not a router link */}
          <Button
            size="lg"
            className="w-full mb-3"
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Redirecting to checkout…
              </span>
            ) : (
              'Upgrade to Pro — $29/mo'
            )}
          </Button>

          {/* Continue with free — dismisses modal and stays on dashboard */}
          <button
            onClick={onDismiss}
            disabled={loading}
            className="w-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm transition-colors py-2 disabled:opacity-50"
          >
            Continue with Free plan
          </button>
        </div>
      </div>
    </div>
  )
}
