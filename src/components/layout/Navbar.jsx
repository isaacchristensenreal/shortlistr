import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Zap, BookOpen, Sparkles, DollarSign,
  LogIn, LogOut, Settings, ChevronDown, Menu, X, ArrowRight,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Logo from '../ui/Logo'

const EASE_OUT = [0.23, 1, 0.32, 1]

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
  const ref             = useRef(null)
  const navigate        = useNavigate()
  const isPro           = profile?.tier === 'pro'

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = (profile?.username || user?.email || '?')[0].toUpperCase()

  return (
    <div className="relative" ref={ref}>
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.12 }}
        className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl"
        style={{ border: '1px solid rgba(255,255,255,0.10)', background: open ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)' }}
      >
        <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'linear-gradient(135deg, rgba(245,200,66,0.3), rgba(245,200,66,0.15))', border: '1px solid rgba(245,200,66,0.2)', color: '#F5C842' }}>
          {profile?.avatar_url ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" /> : initials}
        </div>
        <span className="text-sm max-w-[120px] truncate hidden sm:block" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {profile?.username ? `@${profile.username}` : user?.email}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2, ease: EASE_OUT }}>
          <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.35)' }} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className="absolute right-0 top-full mt-2 w-60 rounded-xl z-50 overflow-hidden"
            style={{ background: '#13131A', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', maxWidth: 'calc(100vw - 24px)', transformOrigin: 'top right' }}
          >
            {/* User info */}
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center text-sm font-bold shrink-0" style={{ background: 'linear-gradient(135deg, rgba(245,200,66,0.25), rgba(245,200,66,0.10))', border: '1px solid rgba(245,200,66,0.2)', color: '#F5C842' }}>
                  {profile?.avatar_url ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" /> : initials}
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
                { to: '/dashboard', label: 'Dashboard',  Icon: LayoutDashboard },
                { to: '/optimize',  label: 'Scan Resume', Icon: Zap },
                { to: '/library',   label: 'My Library',  Icon: BookOpen },
                { to: '/settings',  label: 'Settings',    Icon: Settings },
              ].map(item => (
                <Link
                  key={item.to} to={item.to} onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: 'rgba(255,255,255,0.55)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
                >
                  <item.Icon size={15} />
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
                  <Zap size={15} />
                  Upgrade to Pro
                </button>
              )}
            </div>

            <div className="py-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button
                onClick={() => { setOpen(false); onSignOut() }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors text-left"
                style={{ color: 'rgba(255,255,255,0.3)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,68,68,0.07)'; e.currentTarget.style.color = 'rgba(255,68,68,0.8)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const MOBILE_NAV_LINKS = {
  authenticated: [
    { to: '/dashboard',          label: 'Dashboard',   Icon: LayoutDashboard },
    { to: '/optimize',           label: 'Scan Resume', Icon: Zap },
    { to: '/library',            label: 'My Library',  Icon: BookOpen },
    { to: '/features',           label: 'Features',    Icon: Sparkles },
  ],
  public: [
    { to: '/features', label: 'Features', Icon: Sparkles },
    { to: '/pricing',  label: 'Pricing',  Icon: DollarSign },
    { to: '/auth',     label: 'Log In',   Icon: LogIn },
  ],
}

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate                   = useNavigate()
  const { pathname }               = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled]    = useState(false)

  const isPro    = profile?.tier === 'pro'
  const initials = (profile?.username || user?.email || '?')[0].toUpperCase()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav
      className="sticky top-0 z-50 transition-all duration-300"
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
              <NavLink to="/optimize"  active={pathname === '/optimize'}>Optimizer</NavLink>
              <NavLink to="/library"   active={pathname === '/library'}>Library</NavLink>
              <NavLink to="/features"  active={pathname === '/features'}>Features</NavLink>
              {!isPro && <NavLink to="/pricing" active={pathname === '/pricing'}>Pricing</NavLink>}
            </>
          ) : (
            <>
              <NavLink to="/features" active={pathname === '/features'}>Features</NavLink>
              <NavLink to="/pricing"  active={pathname === '/pricing'}>Pricing</NavLink>
              <NavLink to="/auth"     active={pathname === '/auth'}>Login</NavLink>
            </>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <UserMenu user={user} profile={profile} onSignOut={handleSignOut} />
          ) : (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }} className="hidden sm:block">
              <Link
                to="/auth?mode=signup"
                className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl btn-shimmer"
                style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F', boxShadow: '0 4px 16px rgba(245,200,66,0.25)' }}
              >
                Start Free
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          )}

          {/* Mobile hamburger */}
          <motion.button
            onClick={() => setMobileOpen(o => !o)}
            whileTap={{ scale: 0.93 }}
            transition={{ duration: 0.12 }}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-all"
            style={{
              color: mobileOpen ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)',
              background: mobileOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
            }}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span key="close" initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <X size={20} />
                </motion.span>
              ) : (
                <motion.span key="open" initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <Menu size={20} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="md:hidden overflow-hidden"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#0D0D14' }}
          >
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } } }}
            >
              {user ? (
                <>
                  {/* User card */}
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: -8 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } }}
                    className="px-4 py-4 mx-3 mt-3 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center text-sm font-bold shrink-0" style={{ background: 'linear-gradient(135deg, rgba(245,200,66,0.25), rgba(245,200,66,0.10))', border: '1px solid rgba(245,200,66,0.2)', color: '#F5C842' }}>
                        {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        {profile?.username && <p className="text-sm font-semibold truncate" style={{ color: 'rgba(255,255,255,0.9)' }}>@{profile.username}</p>}
                        <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{user?.email}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0" style={isPro ? { background: 'rgba(245,200,66,0.12)', color: '#F5C842', border: '1px solid rgba(245,200,66,0.2)' } : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {isPro ? '⚡ Pro' : 'Free'}
                      </span>
                    </div>
                  </motion.div>

                  {/* Nav links */}
                  <div className="px-3 pt-3 pb-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest px-1 mb-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>Navigation</p>
                    <div className="space-y-0.5">
                      {MOBILE_NAV_LINKS.authenticated.map(item => (
                        <motion.div key={item.to} variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0, transition: { duration: 0.22 } } }}>
                          <Link
                            to={item.to}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                            style={{ color: pathname === item.to ? '#F5C842' : 'rgba(255,255,255,0.6)', background: pathname === item.to ? 'rgba(245,200,66,0.08)' : 'transparent' }}
                          >
                            <item.Icon size={16} className="shrink-0" />
                            <span className="flex-1">{item.label}</span>
                            {pathname === item.to && <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />}
                          </Link>
                        </motion.div>
                      ))}
                      {!isPro && (
                        <motion.div variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0, transition: { duration: 0.22 } } }}>
                          <Link to="/pricing" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all" style={{ color: pathname === '/pricing' ? '#F5C842' : 'rgba(255,255,255,0.6)', background: pathname === '/pricing' ? 'rgba(245,200,66,0.08)' : 'transparent' }}>
                            <DollarSign size={16} className="shrink-0" />
                            Pricing
                          </Link>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Account section */}
                  <div className="px-3 pt-2 pb-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 8 }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest px-1 mb-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>Account</p>
                    <div className="space-y-0.5">
                      {!isPro && (
                        <motion.div variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0, transition: { duration: 0.22 } } }}>
                          <Link to="/pricing" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold mb-1" style={{ background: 'rgba(245,200,66,0.09)', color: '#F5C842', border: '1px solid rgba(245,200,66,0.18)' }}>
                            <Zap size={16} className="shrink-0" />
                            Upgrade to Pro
                          </Link>
                        </motion.div>
                      )}
                      <Link to="/settings" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        <Settings size={16} className="shrink-0" />
                        Settings
                      </Link>
                      <button onClick={() => { setMobileOpen(false); handleSignOut() }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        <LogOut size={16} className="shrink-0" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <motion.div
                  variants={{ hidden: { opacity: 0, y: -8 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } }}
                  className="px-3 py-3"
                >
                  <div className="space-y-0.5 mb-3">
                    {MOBILE_NAV_LINKS.public.map(item => (
                      <Link
                        key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all"
                        style={{ color: pathname === item.to ? '#F5C842' : 'rgba(255,255,255,0.65)', background: pathname === item.to ? 'rgba(245,200,66,0.08)' : 'transparent' }}
                      >
                        <item.Icon size={16} className="shrink-0" />
                        {item.label}
                        {pathname === item.to && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-500" />}
                      </Link>
                    ))}
                  </div>
                  <Link
                    to="/auth?mode=signup"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold btn-shimmer"
                    style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F', boxShadow: '0 4px 20px rgba(245,200,66,0.3)' }}
                  >
                    Get Started Free
                    <ArrowRight size={16} />
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
