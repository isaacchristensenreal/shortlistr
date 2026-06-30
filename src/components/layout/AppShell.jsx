import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Logo from '../ui/Logo'

const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/optimize',
    label: 'Scan Resume',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    to: '/library',
    label: 'My Library',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  {
    to: '/linkedin-optimizer',
    label: 'LinkedIn',
    badge: 'Pro',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="1.75" fill="none" />
      </svg>
    ),
  },
  {
    to: '/salary-negotiator',
    label: 'Salary Tool',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

const BOTTOM_TABS = [
  { to: '/dashboard', label: 'Home', icon: NAV_ITEMS[0].icon },
  { to: '/optimize', label: 'Scan', icon: NAV_ITEMS[1].icon },
  { to: '/library', label: 'Library', icon: NAV_ITEMS[2].icon },
  { to: '/salary-negotiator', label: 'Salary', icon: NAV_ITEMS[4].icon },
  { to: '/settings', label: 'Account', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )},
]

function SidebarItem({ item, active }) {
  return (
    <Link
      to={item.to}
      className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all group relative ${
        active
          ? 'bg-gold-500/10 text-gold-500'
          : 'text-white/50 hover:text-white/80 hover:bg-white/5'
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gold-500 rounded-r-full" />
      )}
      <span className={active ? 'text-gold-500' : 'text-white/40 group-hover:text-white/60 transition-colors'}>
        {item.icon}
      </span>
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-gold-500/15 text-gold-500 border border-gold-500/20">
          {item.badge}
        </span>
      )}
    </Link>
  )
}

export default function AppShell({ children }) {
  const { user, profile, signOut } = useAuth()
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)
  const currentTab = new URLSearchParams(search).get('tab')
  const isPro = profile?.tier === 'pro'
  const firstName = profile?.username || user?.email?.split('@')[0] || ''
  const initials = (profile?.username || user?.email || '?')[0].toUpperCase()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.06, rootMargin: '0px 0px -40px 0px' }
    )
    const timer = setTimeout(() => {
      document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach(el => observer.observe(el))
    }, 60)
    return () => { clearTimeout(timer); observer.disconnect() }
  }, [pathname])

  // Close sheet on route change
  useEffect(() => { setSheetOpen(false) }, [pathname])

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (sheetOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sheetOpen])

  const isActive = (item) => {
    const itemPath = item.to.split('?')[0]
    const itemTab = new URLSearchParams(item.to.split('?')[1] ?? '').get('tab')
    if (itemTab) {
      return pathname === itemPath && currentTab === itemTab
    }
    if (item.matchPath) return pathname === item.matchPath && !currentTab
    return pathname === itemPath
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const PAGE_TITLES = {
    '/dashboard': 'Dashboard',
    '/optimize': 'Scan Resume',
    '/library': 'My Library',
    '/linkedin-optimizer': 'LinkedIn',
    '/salary-negotiator': 'Salary Tool',
    '/settings': 'Settings',
  }
  const pageTitle = PAGE_TITLES[pathname] || 'ShortListr'

  return (
    <div className="app-shell">

      {/* ── Mobile Header ─────────────────────────────────────────── */}
      <header className="app-mobile-header">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <Logo size={26} />
          <span className="font-bold text-white text-base tracking-tight group-hover:text-gold-500 transition-colors">
            {pageTitle}
          </span>
        </Link>
        {user && (
          <button
            onClick={() => setSheetOpen(true)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl transition-all"
            style={{ border: '1px solid rgba(10,11,13,0.10)', background: 'rgba(10,11,13,0.03)' }}
            aria-label="Account options"
          >
            <div
              className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)', color: '#3b82f6' }}
            >
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                : initials}
            </div>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="rgba(10,11,13,0.40)" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </header>

      {/* ── Left Sidebar (desktop) ─────────────────────────────────── */}
      <aside className="app-sidebar flex flex-col">
        <div className="px-5 py-5 border-b border-white/5">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <Logo size={32} />
            <span className="text-white font-bold text-lg tracking-tight group-hover:text-gold-500 transition-colors">
              ShortListr
            </span>
          </Link>
        </div>

        {user && (
          <div className="px-4 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-500/30 to-gold-600/20 border border-gold-500/20 flex items-center justify-center text-gold-500 text-sm font-bold shrink-0">
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-xl" />
                  : initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-semibold truncate">
                  {profile?.username ? `@${profile.username}` : firstName}
                </p>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isPro
                    ? 'bg-gold-500/15 text-gold-500 border border-gold-500/20'
                    : 'bg-white/8 text-white/40 border border-white/10'
                }`}>
                  {isPro ? '⚡ Pro' : 'Free'}
                </span>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 py-3 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <SidebarItem key={item.to} item={item} active={isActive(item)} />
          ))}
        </nav>

        <div className="border-t border-white/5 py-3 space-y-0.5">
          {!isPro && (
            <Link
              to="/pricing"
              className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-semibold text-gold-500 bg-gold-500/8 hover:bg-gold-500/15 transition-all border border-gold-500/15"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              Upgrade to Pro
            </Link>
          )}
          <Link
            to="/settings"
            className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all ${
              pathname === '/settings'
                ? 'bg-gold-500/10 text-gold-500'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium text-white/30 hover:text-crimson-400 hover:bg-crimson-400/5 transition-all w-full text-left"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main key={pathname} className="app-content page-enter">
        {children}
      </main>

      {/* ── Bottom Tab Bar (mobile) ───────────────────────────────────── */}
      <nav className="app-bottom-bar items-center justify-around px-1">
        {BOTTOM_TABS.map(tab => {
          const tabParam = new URLSearchParams(tab.to.split('?')[1] ?? '').get('tab')
          const active = tabParam
            ? pathname === tab.to.split('?')[0] && currentTab === tabParam
            : tab.matchPath
            ? pathname === tab.matchPath && !currentTab
            : pathname === tab.to.split('?')[0]
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl min-w-[52px] transition-all ${
                active ? 'text-gold-500' : 'text-white/35 hover:text-white/65'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-gold-500/12' : ''}`}>
                {tab.icon}
              </div>
              <span className="text-[9px] font-bold tracking-wide uppercase">{tab.label}</span>
              {active && <span className="w-1 h-1 rounded-full bg-gold-500 mt-0.5" />}
            </Link>
          )
        })}
      </nav>

      {/* ── Mobile Account Sheet ──────────────────────────────────────── */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" onClick={() => setSheetOpen(false)}>
          <div className="absolute inset-0" style={{ background: 'rgba(10,11,13,0.30)', backdropFilter: 'blur(4px)' }} />
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl overflow-hidden slide-up-sheet"
            style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderBottom: 'none' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-9 h-1 rounded-full" style={{ background: 'rgba(10,11,13,0.12)' }} />
            </div>

            {/* User info */}
            <div className="px-5 pb-4 pt-1" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center text-base font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.06))', border: '1px solid rgba(59,130,246,0.2)', color: '#3b82f6' }}
                >
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    : initials}
                </div>
                <div className="min-w-0 flex-1">
                  {profile?.username && (
                    <p className="text-white font-semibold text-sm truncate">@{profile.username}</p>
                  )}
                  <p className="text-xs truncate" style={{ color: 'rgba(10,11,13,0.42)' }}>{user?.email}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                  isPro
                    ? 'bg-gold-500/15 text-gold-500 border border-gold-500/20'
                    : 'bg-white/8 text-white/40 border border-white/10'
                }`}>
                  {isPro ? '⚡ Pro' : 'Free Plan'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-3 py-3 space-y-1">
              {!isPro && (
                <Link
                  to="/pricing"
                  onClick={() => setSheetOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'rgba(59,130,246,0.09)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.18)' }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  Upgrade to Pro
                </Link>
              )}
              <Link
                to="/settings"
                onClick={() => setSheetOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all"
                style={{ color: 'rgba(10,11,13,0.58)' }}
                onTouchStart={e => e.currentTarget.style.background = 'rgba(10,11,13,0.04)'}
                onTouchEnd={e => e.currentTarget.style.background = ''}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Settings & Profile
              </Link>
              <button
                onClick={() => { setSheetOpen(false); handleSignOut() }}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all w-full text-left"
                style={{ color: 'rgba(10,11,13,0.38)' }}
                onTouchStart={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.07)'; e.currentTarget.style.color = 'rgba(220,38,38,0.80)' }}
                onTouchEnd={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(10,11,13,0.38)' }}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>

            {/* Safe area spacer */}
            <div className="min-h-[max(16px,env(safe-area-inset-bottom))]" />
          </div>
        </div>
      )}
    </div>
  )
}
