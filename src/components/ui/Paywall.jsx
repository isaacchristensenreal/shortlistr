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
  const [loading, setLoading] = useState(null) // 'monthly' | 'lifetime' | null
  const [error, setError] = useState(null)

  const handleUpgrade = async (billing) => {
    setLoading(billing)
    setError(null)
    try {
      await startCheckout(user?.id, user?.email, billing)
    } catch (err) {
      setError('Could not start checkout. Please try again.')
      setLoading(null)
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
              Upgrade to Pro for unlimited access to every feature — ATS analysis, cover letters, rejection reasons, and more.
            </p>
          </div>

          <ul className="grid grid-cols-2 gap-2 mb-6">
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

          {/* Two pricing options */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Monthly */}
            <button
              onClick={() => handleUpgrade('monthly')}
              disabled={!!loading}
              className="flex flex-col items-center py-3.5 px-3 rounded-xl border border-electric-500/50 hover:bg-electric-500/5 transition-colors disabled:opacity-50"
            >
              {loading === 'monthly' ? (
                <span className="w-4 h-4 border-2 border-electric-500/40 border-t-electric-500 rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-lg font-black text-slate-900 dark:text-white">$10<span className="text-sm font-semibold text-slate-400">/mo</span></span>
                  <span className="text-xs text-electric-600 dark:text-electric-400 font-semibold mt-0.5">Monthly</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Cancel anytime</span>
                </>
              )}
            </button>

            {/* Lifetime */}
            <button
              onClick={() => handleUpgrade('lifetime')}
              disabled={!!loading}
              className="flex flex-col items-center py-3.5 px-3 rounded-xl bg-gradient-to-b from-electric-500/15 to-violet-500/10 border-2 border-electric-500/50 transition-colors disabled:opacity-50 relative overflow-hidden"
            >
              <span className="absolute top-0 right-0 text-[9px] font-black uppercase px-1.5 py-0.5 bg-gradient-to-r from-electric-500 to-violet-500 text-white rounded-bl-lg">Best</span>
              {loading === 'lifetime' ? (
                <span className="w-4 h-4 border-2 border-electric-500/40 border-t-electric-500 rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-lg font-black text-slate-900 dark:text-white">$149<span className="text-sm font-semibold text-slate-400"> once</span></span>
                  <span className="text-xs text-electric-600 dark:text-electric-400 font-semibold mt-0.5">Lifetime</span>
                  <span className="text-[10px] text-green-600 dark:text-green-400 mt-0.5 font-semibold">Save 57%</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
