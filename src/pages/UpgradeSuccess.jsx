import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

export default function UpgradeSuccess() {
  const { refreshProfile } = useAuth()

  useEffect(() => {
    // Poll profile until tier becomes 'pro' — Stripe webhook may take a few seconds
    let attempts = 0
    const poll = async () => {
      await refreshProfile()
      attempts++
      if (attempts < 6) setTimeout(poll, 2000) // retry up to 6 times over 12s
    }
    poll()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Layout>
      <div className="bg-white dark:bg-navy-900 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">

          {/* Success icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-electric-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-electric-500/30">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            You're on Pro ⚡
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed mb-8">
            Your upgrade was successful. You now have unlimited resume optimizations, AI bullet rewriting, cover letter generation, and full version history.
          </p>

          <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-2xl p-5 mb-8 text-left">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">What's included in Pro</p>
            <ul className="space-y-2">
              {[
                'Unlimited resume optimizations',
                'Full ATS keyword matching',
                'AI-powered bullet rewriting',
                'Cover letter generation',
                'Unlimited version history',
                'Priority support',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                  <span className="text-electric-500 shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Go to dashboard — the primary next step after upgrading */}
          <Link to="/dashboard">
            <Button size="lg" className="w-full mb-3">Go to Dashboard</Button>
          </Link>

          {/* Or jump straight into optimizing */}
          <Link to="/optimize">
            <Button variant="secondary" size="lg" className="w-full">
              Start Optimizing Now
            </Button>
          </Link>

        </div>
      </div>
    </Layout>
  )
}
