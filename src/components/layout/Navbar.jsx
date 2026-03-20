import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import Logo from '../ui/Logo'

function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5" />
      <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  )
}

function NavLink({ to, children, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
        active
          ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10'
          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
      }`}
    >
      {children}
      {active && (
        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-electric-500 rounded-full" />
      )}
    </Link>
  )
}

function UserMenu({ user, profile, onSignOut }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const isPro = profile?.tier === 'pro'

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-electric-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {initials}
        </div>
        <span className="text-sm text-slate-700 dark:text-slate-300 max-w-[120px] truncate hidden sm:block">
          {user?.email}
        </span>
        <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-black/30 z-50 overflow-hidden"
          style={{ animation: 'staggerIn 0.2s cubic-bezier(0.22,1,0.36,1) both' }}>
          <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10">
            <p className="text-xs text-slate-400 mb-0.5">Signed in as</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{user?.email}</p>
            <span className={`inline-flex items-center gap-1 mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
              isPro
                ? 'bg-electric-500/10 text-electric-600 dark:text-electric-400'
                : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'
            }`}>
              {isPro ? '⚡ Pro Plan' : 'Free Plan'}
            </span>
          </div>

          <div className="py-1.5">
            <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              Dashboard
            </Link>
            <Link to="/optimize" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
              Optimize Resume
            </Link>
            <Link to="/library" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              My Library
            </Link>
            <Link to="/settings" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" /></svg>
              Settings
            </Link>
            {!isPro && (
              <Link to="/pricing" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-electric-600 dark:text-electric-400 hover:bg-electric-500/5 transition-colors font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Upgrade to Pro
              </Link>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-white/10 py-1.5">
            <button onClick={() => { setOpen(false); onSignOut() }} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="bg-white/95 dark:bg-navy-900/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          to={user ? '/dashboard' : '/'}
          onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
          className="flex items-center gap-2.5 shrink-0"
        >
          <Logo size={34} />
          <span className="text-slate-900 dark:text-white font-bold text-lg tracking-tight">ShortListr</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {user ? (
            <>
              <NavLink to="/dashboard" active={pathname === '/dashboard'}>Dashboard</NavLink>
              <NavLink to="/optimize" active={pathname === '/optimize'}>Optimize</NavLink>
              <NavLink to="/library" active={pathname === '/library'}>Library</NavLink>
              <NavLink to="/features" active={pathname === '/features'}>Features</NavLink>
              {profile?.tier !== 'pro' && <NavLink to="/pricing" active={pathname === '/pricing'}>Pricing</NavLink>}
            </>
          ) : (
            <>
              <NavLink to="/features" active={pathname === '/features'}>Features</NavLink>
              <NavLink to="/pricing" active={pathname === '/pricing'}>Pricing</NavLink>
            </>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          {user ? (
            <UserMenu user={user} profile={profile} onSignOut={handleSignOut} />
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden sm:block text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors px-3 py-2 font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/auth?mode=signup"
                className="bg-gradient-to-r from-electric-500 to-blue-600 hover:from-electric-400 hover:to-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-electric-500/25"
              >
                Get Started
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 px-4 py-3 space-y-1">
          {user ? (
            <>
              <NavLink to="/dashboard" active={pathname === '/dashboard'} onClick={() => setMobileOpen(false)}>Dashboard</NavLink>
              <NavLink to="/optimize" active={pathname === '/optimize'} onClick={() => setMobileOpen(false)}>Optimize</NavLink>
              <NavLink to="/library" active={pathname === '/library'} onClick={() => setMobileOpen(false)}>Library</NavLink>
              <NavLink to="/features" active={pathname === '/features'} onClick={() => setMobileOpen(false)}>Features</NavLink>
              {profile?.tier !== 'pro' && <NavLink to="/pricing" active={pathname === '/pricing'} onClick={() => setMobileOpen(false)}>Pricing</NavLink>}
            </>
          ) : (
            <>
              <NavLink to="/features" active={pathname === '/features'} onClick={() => setMobileOpen(false)}>Features</NavLink>
              <NavLink to="/pricing" active={pathname === '/pricing'} onClick={() => setMobileOpen(false)}>Pricing</NavLink>
              <NavLink to="/auth" active={pathname === '/auth'} onClick={() => setMobileOpen(false)}>Sign In</NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
