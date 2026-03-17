import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

function Section({ title, description, children }) {
  return (
    <div className="bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
      <div className="mb-5">
        <h2 className="text-slate-900 dark:text-white font-semibold text-base">{title}</h2>
        {description && <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export default function Settings() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const isPro = profile?.tier === 'pro'

  const [deleting, setDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteError, setDeleteError] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState(null)
  const [cancelDone, setCancelDone] = useState(false)
  const [cancelAt, setCancelAt] = useState(null) // unix timestamp from Stripe

  const handleCancelSubscription = async () => {
    setCancelling(true)
    setCancelError(null)
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { userId: user.id },
      })
      if (error) throw new Error(error.message)
      if (data?.error) throw new Error(data.error)
      if (data?.cancel_at) setCancelAt(data.cancel_at)
      setCancelDone(true)
    } catch (err) {
      setCancelError(err.message)
    } finally {
      setCancelling(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return
    setDeleting(true)
    setDeleteError(null)
    try {
      const { data, error } = await supabase.functions.invoke('delete-account', {
        body: { userId: user.id },
      })
      if (error) throw new Error(error.message)
      if (data?.error) throw new Error(data.error)
      await signOut()
      navigate('/')
    } catch (err) {
      setDeleteError(err.message)
      setDeleting(false)
    }
  }

  return (
    <Layout>
      <div className="bg-white dark:bg-navy-900 min-h-screen">
        <div className="max-w-2xl mx-auto px-6 py-12">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your account and subscription.</p>
          </div>

          <div className="space-y-5">

            {/* Account Info */}
            <Section title="Account" description="Your account details.">
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/10">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Email</p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Plan</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {isPro ? 'Pro' : 'Free'}
                      </p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isPro
                          ? cancelDone
                            ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : 'bg-electric-500/10 text-electric-600 dark:text-electric-400'
                          : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                      }`}>
                        {isPro ? (cancelDone ? 'Cancelling' : 'Active') : 'Free tier'}
                      </span>
                    </div>
                  </div>
                  {(!isPro || cancelDone) && (
                    <Link to="/pricing">
                      <Button size="sm">Upgrade to Pro</Button>
                    </Link>
                  )}
                </div>
              </div>
            </Section>

            {/* Subscription */}
            {isPro && !cancelDone && (
              <Section title="Subscription" description="Manage your Pro subscription.">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">Pro Plan — $10/month</p>
                    <p className="text-xs text-slate-400 mt-0.5">Unlimited optimizations, cover letter generation, full library access.</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {cancelError && <p className="text-red-500 dark:text-red-400 text-xs max-w-[180px] text-right">{cancelError}</p>}
                    <button
                      onClick={handleCancelSubscription}
                      disabled={cancelling}
                      className="text-sm text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancelling ? (
                        <span className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                          Cancelling…
                        </span>
                      ) : 'Downgrade to Free'}
                    </button>
                  </div>
                </div>
              </Section>
            )}

            {cancelDone && (
              <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
                <p className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-0.5">Subscription cancelled.</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {cancelAt
                    ? `You'll keep Pro access until ${new Date(cancelAt * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. No further charges.`
                    : 'Your plan has been downgraded to free.'}
                </p>
              </div>
            )}

            {/* Danger Zone */}
            <Section title="Danger Zone" description="Permanent actions that cannot be undone.">
              <div className="border border-red-200 dark:border-red-500/30 rounded-xl p-4 bg-red-50/50 dark:bg-red-500/5">
                <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">Delete Account</p>
                <p className="text-xs text-red-600/70 dark:text-red-400/70 mb-4">
                  This permanently deletes your account, all saved resumes, and cancels any active subscription. This cannot be undone.
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">Type <span className="font-mono font-bold text-red-500">DELETE</span> to confirm</p>
                    <input
                      type="text"
                      value={deleteConfirm}
                      onChange={e => setDeleteConfirm(e.target.value)}
                      placeholder="DELETE"
                      className="w-full bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:border-red-400 transition-colors"
                    />
                  </div>
                  {deleteError && <p className="text-red-500 text-xs">{deleteError}</p>}
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirm !== 'DELETE' || deleting}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    {deleting ? 'Deleting...' : 'Permanently delete my account'}
                  </button>
                </div>
              </div>
            </Section>

          </div>
        </div>
      </div>
    </Layout>
  )
}
