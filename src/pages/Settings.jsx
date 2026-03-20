import { useState, useEffect, useRef } from 'react'
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
  const { user, profile, signOut, updateProfile } = useAuth()
  const navigate = useNavigate()
  const isPro = profile?.tier === 'pro'
  const fileInputRef = useRef(null)

  // Profile state
  const [username, setUsername] = useState('')
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState(null)
  const [profileSuccess, setProfileSuccess] = useState(false)

  // Sync username from profile when loaded
  useEffect(() => {
    if (profile?.username) setUsername(profile.username)
  }, [profile?.username])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setProfileError('Image must be under 2MB')
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setProfileError(null)
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    setProfileError(null)
    setProfileSuccess(false)
    try {
      const updates = {}

      // Upload new avatar if selected
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `${user.id}/avatar.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true })
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
        updates.avatar_url = publicUrl
      }

      // Update username if changed
      const trimmed = username.trim()
      if (trimmed !== (profile?.username ?? '')) {
        updates.username = trimmed || null
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await updateProfile(updates)
        if (error) throw new Error(error.message || JSON.stringify(error))
      }

      setProfileSuccess(true)
      setAvatarFile(null)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err) {
      setProfileError(err.message)
    } finally {
      setSavingProfile(false)
    }
  }

  // Account deletion state
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteError, setDeleteError] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState(null)
  const [cancelDone, setCancelDone] = useState(false)
  const [cancelAt, setCancelAt] = useState(null)

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

  const avatarSrc = avatarPreview || profile?.avatar_url
  const initials = (profile?.username || user?.email || '?')[0].toUpperCase()

  return (
    <Layout>
      <div className="bg-slate-50 dark:bg-navy-900/60 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your profile, account, and subscription.</p>
          </div>

          <div className="space-y-5">

            {/* ── Profile ────────────────────────────────────────────── */}
            <Section title="Profile" description="Customize how you appear across the app.">
              {/* Avatar */}
              <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100 dark:border-white/10">
                <div className="relative shrink-0">
                  <div className="w-18 h-18 w-[72px] h-[72px] rounded-2xl overflow-hidden bg-gradient-to-br from-electric-500 to-violet-500 flex items-center justify-center shadow-lg">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-2xl font-bold">{initials}</span>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white dark:bg-navy-700 border border-slate-200 dark:border-white/20 rounded-full flex items-center justify-center hover:bg-slate-50 dark:hover:bg-navy-600 transition-colors shadow-md"
                    title="Change photo"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-0.5">Profile photo</p>
                  <p className="text-xs text-slate-400 mb-2">JPG, PNG or GIF · Max 2MB</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold text-electric-600 dark:text-electric-400 hover:underline"
                  >
                    {avatarSrc ? 'Change photo' : 'Upload photo'}
                  </button>
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Username</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm select-none">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="your_username"
                      maxLength={30}
                      className="w-full bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl pl-7 pr-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-electric-500 focus:ring-2 focus:ring-electric-500/15 transition-all"
                    />
                  </div>
                  <Button size="sm" onClick={handleSaveProfile} disabled={savingProfile}>
                    {savingProfile ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving
                      </span>
                    ) : 'Save'}
                  </Button>
                </div>
                {profileError && <p className="text-red-500 text-xs mt-1.5">{profileError}</p>}
                {profileSuccess && <p className="text-green-600 dark:text-green-400 text-xs mt-1.5">Profile updated successfully!</p>}
                <p className="text-xs text-slate-400 mt-1.5">Letters, numbers, and underscores only. This is how you appear across the app.</p>
              </div>
            </Section>

            {/* ── Account Info ──────────────────────────────────────── */}
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

            {/* ── Subscription ──────────────────────────────────────── */}
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

            {/* ── Danger Zone ───────────────────────────────────────── */}
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
