import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Logo from '../ui/Logo'

function NavLink({ to, children, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="relative text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200"
      style={{
        color: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.4)',
        background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.75)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
    >
      {children}
      {active && (
        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: '#F5C842' }} />
      )}
    </Link>
  )
}

function UserMenu({ user, profile, onSignOut }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const isPro = profile?.tier === 'pro'

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = (profile?.username || user?.email || '?')[0].toUpperCase()
  const avatarUrl = profile?.avatar_url

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-all"
        style={{ border: '1px solid rgba(255,255,255,0.10)', background: open ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)' }}
      >
        <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'linear-gradient(135deg, rgba(245,200,66,0.3), rgba(245,200,66,0.15))', border: '1px solid rgba(245,200,66,0.2)', color: '#F5C842' }}>
          {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : initials}
        </div>
        <span className="text-sm max-w-[120px] truncate hidden sm:block" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {profile?.username ? `@${profile.username}` : user?.email}
        </span>
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 rounded-xl z-50 overflow-hidden scale-in" style={{ background: '#13131A', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', maxWidth: 'calc(100vw - 24px)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center text-sm font-bold shrink-0" style={{ background: 'linear-gradient(135deg, rgba(245,200,66,0.25), rgba(245,200,66,0.10))', border: '1px solid rgba(245,200,66,0.2)', color: '#F5C842' }}>
                {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : initials}
              </div>
              <div className="min-w-0">
                {profile?.username && <p className="text-sm font-semibold truncate" style={{ color: 'rgba(255,255,255,0.9)' }}>@{profile.username}</p>}
                <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{user?.email}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full" style={isPro ? { background: 'rgba(245,200,66,0.12)', color: '#F5C842', border: '1px solid rgba(245,200,66,0.2)' } : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {isPro ? '⚡ Pro Plan' : 'Free Plan'}
            </span>
          </div>

          <div className="py-1.5">
            {[
              { to: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
              { to: '/optimize', label: 'Scan Resume', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
              { to: '/library', label: 'My Library', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
              { to: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
            ].map(item => (
              <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.55)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
                {item.label}
              </Link>
            ))}
            {!isPro && (
              <button
                onClick={() => { setOpen(false); navigate('/pricing') }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-semibold transition-colors text-left"
                style={{ color: '#F5C842' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,200,66,0.07)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Upgrade to Pro
              </button>
            )}
          </div>

          <div className="py-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <button onClick={() => { setOpen(false); onSignOut() }} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors text-left"
              style={{ color: 'rgba(255,255,255,0.3)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,68,68,0.07)'; e.currentTarget.style.color = 'rgba(255,68,68,0.8)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const MOBILE_NAV_LINKS = {
  authenticated: [
    { to: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { to: '/optimize', label: 'Scan Resume', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { to: '/library', label: 'My Library', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
    { to: '/features', label: 'Features', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  ],
  public: [
    { to: '/features', label: 'Features', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
    { to: '/pricing', label: 'Pricing', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { to: '/auth', label: 'Log In', icon: 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1' },
  ],
}

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isPro = profile?.tier === 'pro'
  const initials = (profile?.username || user?.email || '?')[0].toUpperCase()
  const avatarUrl = profile?.avatar_url

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(10,10,15,0.97)' : 'rgba(10,10,15,0.85)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
        boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          to={user ? '/dashboard' : '/'}
          onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <Logo size={32} />
          <span className="font-bold text-lg tracking-tight transition-colors" style={{ color: 'rgba(255,255,255,0.95)' }}>
            ShortListr
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {user ? (
            <>
              <NavLink to="/dashboard" active={pathname === '/dashboard'}>Dashboard</NavLink>
              <NavLink to="/optimize" active={pathname === '/optimize'}>Optimizer</NavLink>
              <NavLink to="/library" active={pathname === '/library'}>Library</NavLink>
              <NavLink to="/features" active={pathname === '/features'}>Features</NavLink>
              {profile?.tier !== 'pro' && <NavLink to="/pricing" active={pathname === '/pricing'}>Pricing</NavLink>}
            </>
          ) : (
            <>
              <NavLink to="/features" active={pathname === '/features'}>Features</NavLink>
              <NavLink to="/pricing" active={pathname === '/pricing'}>Pricing</NavLink>
              <NavLink to="/auth" active={pathname === '/auth'}>Login</NavLink>
            </>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <UserMenu user={user} profile={profile} onSignOut={handleSignOut} />
          ) : (
            <Link
              to="/auth?mode=signup"
              className="hidden sm:inline-flex text-sm font-bold px-4 py-2 rounded-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F', boxShadow: '0 4px 16px rgba(245,200,66,0.25)' }}
            >
              Start Free →
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-all"
            style={{
              color: mobileOpen ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)',
              background: mobileOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
            }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ─────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#0D0D14' }}>
          {user ? (
            <>
              {/* User card */}
              <div className="px-4 py-4 mx-3 mt-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(245,200,66,0.25), rgba(245,200,66,0.10))', border: '1px solid rgba(245,200,66,0.2)', color: '#F5C842' }}
                  >
                    {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    {profile?.username && (
                      <p className="text-sm font-semibold truncate" style={{ color: 'rgba(255,255,255,0.9)' }}>@{profile.username}</p>
                    )}
                    <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{user?.email}</p>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0"
                    style={isPro
                      ? { background: 'rgba(245,200,66,0.12)', color: '#F5C842', border: '1px solid rgba(245,200,66,0.2)' }
                      : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }
                    }
                  >
                    {isPro ? '⚡ Pro' : 'Free'}
                  </span>
                </div>
              </div>

              {/* Nav section */}
              <div className="px-3 pt-3 pb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest px-1 mb-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>Navigation</p>
                <div className="space-y-0.5">
                  {MOBILE_NAV_LINKS.authenticated.map(item => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{
                        color: pathname === item.to ? '#F5C842' : 'rgba(255,255,255,0.6)',
                        background: pathname === item.to ? 'rgba(245,200,66,0.08)' : 'transparent',
                      }}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                      <span className="flex-1">{item.label}</span>
                      {pathname === item.to && (
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                      )}
                    </Link>
                  ))}
                  {!isPro && (
                    <Link
                      to="/pricing"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{ color: pathname === '/pricing' ? '#F5C842' : 'rgba(255,255,255,0.6)', background: pathname === '/pricing' ? 'rgba(245,200,66,0.08)' : 'transparent' }}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pricing
                    </Link>
                  )}
                </div>
              </div>

              {/* Account section */}
              <div className="px-3 pt-2 pb-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '8px' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest px-1 mb-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>Account</p>
                <div className="space-y-0.5">
                  {!isPro && (
                    <Link
                      to="/pricing"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold mb-1"
                      style={{ background: 'rgba(245,200,66,0.09)', color: '#F5C842', border: '1px solid rgba(245,200,66,0.18)' }}
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                      Upgrade to Pro
                    </Link>
                  )}
                  <Link
                    to="/settings"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{ color: 'rgba(255,255,255,0.55)' }}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Settings
                  </Link>
                  <button
                    onClick={() => { setMobileOpen(false); handleSignOut() }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="px-3 py-3">
              {/* Public nav links */}
              <div className="space-y-0.5 mb-3">
                {MOBILE_NAV_LINKS.public.map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{
                      color: pathname === item.to ? '#F5C842' : 'rgba(255,255,255,0.65)',
                      background: pathname === item.to ? 'rgba(245,200,66,0.08)' : 'transparent',
                    }}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    {item.label}
                    {pathname === item.to && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-500" />}
                  </Link>
                ))}
              </div>

              {/* CTA */}
              <Link
                to="/auth?mode=signup"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold transition-all"
                style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F', boxShadow: '0 4px 20px rgba(245,200,66,0.3)' }}
              >
                Get Started Free
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
