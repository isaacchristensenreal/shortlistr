import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

function Section({ title, description, children }) {
  return (
    <div className="rounded-2xl p-5 sm:p-6" style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}>
      <div className="mb-5">
        <h2 className="text-white font-semibold text-base">{title}</h2>
        {description && <p className="text-white/40 text-sm mt-0.5">{description}</p>}
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

  const [username, setUsername] = useState('')
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState(null)
  const [profileSuccess, setProfileSuccess] = useState(false)

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
    <AppShell>
      <div className="min-h-screen" style={{ background: '#fafbfc' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

          <div className="mb-8" data-reveal>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Settings</h1>
            <p className="text-white/40 text-sm">Manage your profile, account, and subscription.</p>
          </div>

          <div className="space-y-4">

            {/* ── Profile ─────────────────────────────────────────── */}
            <div data-reveal data-delay="1">
              <Section title="Profile" description="Customize how you appear across the app.">
                <div className="flex items-start gap-5 mb-6 pb-6" style={{ borderBottom: '1px solid rgba(10,11,13,0.07)' }}>
                  <div className="relative shrink-0">
                    <div
                      className="w-[72px] h-[72px] rounded-2xl overflow-hidden flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(59,130,246,0.12))', border: '1px solid rgba(59,130,246,0.2)' }}
                    >
                      {avatarSrc ? (
                        <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold" style={{ color: '#3b82f6' }}>{initials}</span>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                      style={{ background: '#e5e7eb', border: '1px solid rgba(10,11,13,0.15)' }}
                      title="Change photo"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="rgba(10,11,13,0.7)" strokeWidth="2">
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
                    <p className="text-sm font-semibold text-white/80 mb-0.5">Profile photo</p>
                    <p className="text-xs text-white/35 mb-2">JPG, PNG or GIF · Max 2MB</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold transition-colors"
                      style={{ color: '#3b82f6' }}
                    >
                      {avatarSrc ? 'Change photo' : 'Upload photo'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(10,11,13,0.3)' }}>
                    Username
                  </label>
                  <div className="flex gap-2.5">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm select-none" style={{ color: 'rgba(10,11,13,0.3)' }}>@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder="your_username"
                        maxLength={30}
                        className="w-full rounded-xl pl-7 pr-3 py-2.5 text-sm transition-all outline-none"
                        style={{
                          background: 'rgba(10,11,13,0.04)',
                          border: '1px solid rgba(10,11,13,0.10)',
                          color: 'rgba(10,11,13,0.85)',
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'}
                        onBlur={e => e.currentTarget.style.borderColor = 'rgba(10,11,13,0.10)'}
                      />
                    </div>
                    <button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 shrink-0"
                      style={{ background: '#3b82f6', color: '#ffffff' }}
                    >
                      {savingProfile ? (
                        <span className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          Saving
                        </span>
                      ) : 'Save'}
                    </button>
                  </div>
                  {profileError && <p className="text-crimson-400 text-xs mt-2">{profileError}</p>}
                  {profileSuccess && <p className="text-neon-400 text-xs mt-2">Profile updated successfully!</p>}
                  <p className="text-xs mt-2" style={{ color: 'rgba(10,11,13,0.3)' }}>
                    Letters, numbers, and underscores only.
                  </p>
                </div>
              </Section>
            </div>

            {/* ── Account Info ───────────────────────────────────── */}
            <div data-reveal data-delay="2">
              <Section title="Account" description="Your account details.">
                <div className="space-y-0">
                  <div className="flex items-center justify-between py-3.5" style={{ borderBottom: '1px solid rgba(10,11,13,0.07)' }}>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(10,11,13,0.25)' }}>Email</p>
                      <p className="text-sm font-medium text-white/80">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3.5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(10,11,13,0.25)' }}>Plan</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white/80">{isPro ? 'Pro' : 'Free'}</p>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isPro
                            ? cancelDone
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                              : 'bg-gold-500/12 text-gold-500 border border-gold-500/20'
                            : 'bg-black/8 text-white/35 border border-black/10'
                        }`}>
                          {isPro ? (cancelDone ? 'Cancelling' : 'Active') : 'Free'}
                        </span>
                      </div>
                    </div>
                    {(!isPro || cancelDone) && (
                      <Link
                        to="/pricing"
                        className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                        style={{ background: 'rgba(59,130,246,0.09)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}
                      >
                        Upgrade to Pro
                      </Link>
                    )}
                  </div>
                </div>
              </Section>
            </div>

            {/* ── Subscription ──────────────────────────────────── */}
            {isPro && !cancelDone && (
              <div data-reveal data-delay="3">
                <Section title="Subscription" description="Manage your Pro subscription.">
                  <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                    <div>
                      <p className="text-sm font-medium text-white/80">Pro Plan — $10/month</p>
                      <p className="text-xs text-white/35 mt-0.5">Unlimited optimizations, cover letter generation, full library access.</p>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
                      {cancelError && <p className="text-crimson-400 text-xs max-w-[200px]">{cancelError}</p>}
                      <button
                        onClick={handleCancelSubscription}
                        disabled={cancelling}
                        className="text-sm font-medium transition-all px-3 py-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ color: 'rgba(10,11,13,0.35)' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'rgba(220,38,38,0.8)'; e.currentTarget.style.background = 'rgba(220,38,38,0.08)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(10,11,13,0.35)'; e.currentTarget.style.background = 'transparent' }}
                      >
                        {cancelling ? (
                          <span className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(10,11,13,0.2)', borderTopColor: 'rgba(10,11,13,0.6)' }} />
                            Cancelling…
                          </span>
                        ) : 'Downgrade to Free'}
                      </button>
                    </div>
                  </div>
                </Section>
              </div>
            )}

            {cancelDone && (
              <div data-reveal className="rounded-2xl p-4 sm:p-5" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <p className="text-amber-400 text-sm font-medium mb-0.5">Subscription cancelled.</p>
                <p className="text-white/45 text-sm">
                  {cancelAt
                    ? `You'll keep Pro access until ${new Date(cancelAt * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. No further charges.`
                    : 'Your plan has been downgraded to free.'}
                </p>
              </div>
            )}

            {/* ── Danger Zone ───────────────────────────────────── */}
            <div data-reveal data-delay="4">
              <Section title="Danger Zone" description="Permanent actions that cannot be undone.">
                <div className="rounded-xl p-4" style={{ background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.2)' }}>
                  <p className="text-sm font-semibold text-crimson-400 mb-1">Delete Account</p>
                  <p className="text-xs text-crimson-400/60 mb-4">
                    This permanently deletes your account, all saved resumes, and cancels any active subscription. This cannot be undone.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-white/40 mb-1.5">
                        Type <span className="font-mono font-bold text-crimson-400">DELETE</span> to confirm
                      </p>
                      <input
                        type="text"
                        value={deleteConfirm}
                        onChange={e => setDeleteConfirm(e.target.value)}
                        placeholder="DELETE"
                        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
                        style={{
                          background: 'rgba(10,11,13,0.04)',
                          border: '1px solid rgba(220,38,38,0.25)',
                          color: 'rgba(10,11,13,0.8)',
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = 'rgba(220,38,38,0.5)'}
                        onBlur={e => e.currentTarget.style.borderColor = 'rgba(220,38,38,0.25)'}
                      />
                    </div>
                    {deleteError && <p className="text-crimson-400 text-xs">{deleteError}</p>}
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirm !== 'DELETE' || deleting}
                      className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: '#dc2626', color: '#fff' }}
                    >
                      {deleting ? 'Deleting…' : 'Permanently delete my account'}
                    </button>
                  </div>
                </div>
              </Section>
            </div>

          </div>
        </div>
      </div>
    </AppShell>
  )
}
