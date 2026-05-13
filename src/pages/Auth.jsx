import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, EyeOff, ArrowLeft, CheckCircle, Zap,
  Mail, Lock, Chrome, Github,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/ui/Logo'

const EASE_OUT = [0.23, 1, 0.32, 1]

// ─── Google / GitHub SVG icons (kept as-is — brand colours required) ─────────

const GoogleIcon = () => (
  <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const GitHubIcon = () => (
  <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
)

// ─── Password strength ────────────────────────────────────────────────────────

const PASSWORD_CHECKS = [
  { id: 'len',     label: 'At least 8 characters',       test: p => p.length >= 8 },
  { id: 'upper',   label: 'One uppercase letter',         test: p => /[A-Z]/.test(p) },
  { id: 'lower',   label: 'One lowercase letter',         test: p => /[a-z]/.test(p) },
  { id: 'number',  label: 'One number',                   test: p => /[0-9]/.test(p) },
  { id: 'special', label: 'One special character (!@#$…)', test: p => /[^A-Za-z0-9]/.test(p) },
]

function getStrength(password) {
  const passed = PASSWORD_CHECKS.filter(c => c.test(password)).length
  if (!password) return null
  if (passed <= 1) return { score: 1, label: 'Very weak',  color: '#FF4444' }
  if (passed === 2) return { score: 2, label: 'Weak',       color: '#F97316' }
  if (passed === 3) return { score: 3, label: 'Fair',       color: '#F59E0B' }
  if (passed === 4) return { score: 4, label: 'Good',       color: '#00FF88' }
  return               { score: 5, label: 'Strong',      color: '#00FF88' }
}

function PasswordStrength({ password }) {
  const strength = getStrength(password)
  if (!password) return null
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
      className="mt-3 overflow-hidden"
    >
      {/* Segmented bar */}
      <div className="flex gap-1 mb-2.5">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: strength.score >= i ? '100%' : '0%' }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              style={{ background: strength.color }}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold" style={{ color: strength.color }}>{strength.label}</span>
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{strength.score}/5</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {PASSWORD_CHECKS.map(c => {
          const ok = c.test(password)
          return (
            <div key={c.id} className="flex items-center gap-1.5 text-[11px]" style={{ color: ok ? '#00FF88' : 'rgba(255,255,255,0.3)' }}>
              <CheckCircle size={10} style={{ color: ok ? '#00FF88' : 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
              {c.label}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Left panel floating demo cards ──────────────────────────────────────────

function FloatingCards() {
  return (
    <div className="w-full max-w-sm mx-auto mt-8 mb-6 space-y-3">
      <motion.div
        animate={{ y: [0, -9, -4, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="rounded-2xl p-4"
        style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>ATS Match Score</p>
            <p className="font-black text-2xl leading-none" style={{ color: '#00FF88' }}>94<span className="text-sm font-normal" style={{ color: 'rgba(255,255,255,0.4)' }}>%</span></p>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,255,136,0.12)', border: '1px solid rgba(0,255,136,0.25)' }}>
            <CheckCircle size={18} style={{ color: '#00FF88' }} />
          </div>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full" style={{ width: '94%', background: 'linear-gradient(90deg, #00FF88, #10b981)' }} />
        </div>
        <p className="text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Marketing Manager · Apex Corp</p>
      </motion.div>

      <motion.div
        animate={{ y: [0, -7, -11, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        className="rounded-2xl p-3.5 ml-4"
        style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
      >
        <p className="text-[9px] uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>AI Bullet Rewrite</p>
        <p className="text-[11px] font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
          "Increased regional revenue by 34% YoY by restructuring a 12-person sales team and implementing a new CRM workflow."
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(245,200,66,0.12)', color: '#F5C842', border: '1px solid rgba(245,200,66,0.25)' }}>+34% impact</span>
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(0,255,136,0.1)', color: '#00FF88', border: '1px solid rgba(0,255,136,0.2)' }}>ATS ready</span>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
        className="rounded-2xl p-3.5 mr-4 flex items-center gap-3"
        style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(245,200,66,0.12)', border: '1px solid rgba(245,200,66,0.25)' }}>
          <Mail size={16} style={{ color: '#F5C842' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white">Interview request received</p>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Horizon Brands · 2 min ago</p>
        </div>
        <div className="w-2 h-2 bg-green-400 rounded-full shrink-0 animate-pulse" />
      </motion.div>
    </div>
  )
}

// ─── Form field ───────────────────────────────────────────────────────────────

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function Input({ icon: Icon, suffix, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div
      className="relative flex items-center rounded-xl transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${focused ? 'rgba(245,200,66,0.45)' : 'rgba(255,255,255,0.09)'}`,
        boxShadow: focused ? '0 0 0 3px rgba(245,200,66,0.08)' : 'none',
      }}
    >
      {Icon && (
        <div className="absolute left-3.5" style={{ color: focused ? '#F5C842' : 'rgba(255,255,255,0.25)', transition: 'color 0.2s' }}>
          <Icon size={15} />
        </div>
      )}
      <input
        {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e) }}
        onBlur={e => { setFocused(false); props.onBlur?.(e) }}
        className="w-full bg-transparent py-3 text-sm outline-none"
        style={{
          paddingLeft: Icon ? '2.5rem' : '1rem',
          paddingRight: suffix ? '2.75rem' : '1rem',
          color: 'rgba(255,255,255,0.9)',
          caretColor: '#F5C842',
        }}
      />
      {suffix && <div className="absolute right-3.5">{suffix}</div>}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Auth() {
  const [searchParams]   = useSearchParams()
  const initialMode      = searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  const [displayMode, setDisplayMode] = useState(initialMode)
  const [phase, setPhase]             = useState('idle')
  const [animKey, setAnimKey]         = useState(0)

  const [email,         setEmail]         = useState('')
  const [password,      setPassword]      = useState('')
  const [showPassword,  setShowPassword]  = useState(false)
  const [message,       setMessage]       = useState(null)
  const [formLoading,   setFormLoading]   = useState(false)
  const [socialLoading, setSocialLoading] = useState(null)

  const { signIn, signUp, signInWithProvider, user, profile, loading } = useAuth()
  const navigate = useNavigate()

  // ── Auth redirect ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return
    if (!user) return
    const ageMs       = Date.now() - new Date(user.created_at).getTime()
    const isNew       = ageMs < 5 * 60 * 1000
    const hasOnboarded = localStorage.getItem(`sl_onboarded_${user.id}`)
    navigate(isNew && !hasOnboarded ? '/welcome' : '/dashboard', { replace: true })
  }, [user, profile, loading, navigate])

  const switchMode = () => {
    if (phase !== 'idle') return
    setPhase('out')
    setMessage(null)
    setTimeout(() => {
      setDisplayMode(m => m === 'signin' ? 'signup' : 'signin')
      setAnimKey(k => k + 1)
      setPhase('in')
      setTimeout(() => setPhase('idle'), 600)
    }, 220)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)
    setFormLoading(true)
    try {
      if (displayMode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
      } else {
        const strength = getStrength(password)
        if (!strength || strength.score < 3) throw new Error('Please choose a stronger password before continuing.')
        const { data, error } = await signUp(email, password)
        if (error) throw error
        if (!data.session) setMessage({ type: 'info', text: 'Account created! Check your email for the confirmation link.' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setFormLoading(false)
    }
  }

  const handleSocial = async (providerId) => {
    setSocialLoading(providerId)
    const { error } = await signInWithProvider(providerId)
    if (error) { setMessage({ type: 'error', text: error.message }); setSocialLoading(null) }
  }

  // ── Loading state while Supabase resolves session ─────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0F' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 rounded-full"
          style={{ border: '2px solid rgba(245,200,66,0.15)', borderTopColor: '#F5C842' }}
        />
      </div>
    )
  }

  const isSignup = displayMode === 'signup'

  const formVariants = {
    out: { opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' } },
    in:  { opacity: 1, y:   0, transition: { duration: 0.3, ease: EASE_OUT } },
  }

  const staggerContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.055, delayChildren: phase === 'in' ? 0.05 : 0 } },
  }
  const staggerItem = {
    hidden: { opacity: 0, y: 14 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_OUT } },
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0A0A0F' }}>

      {/* ── Left panel ──────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden">

        {/* Animated background */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(140deg, #08060F 0%, #0F0A20 45%, #080810 100%)' }} />
        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_0)] [background-size:28px_28px]" />

        {/* Gold glow */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 480, height: 480, top: '15%', left: '10%', background: 'radial-gradient(circle, rgba(245,200,66,0.07) 0%, transparent 65%)' }}
          animate={{ scale: [1, 1.08, 1], x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 360, height: 360, bottom: '20%', right: '5%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)' }}
          animate={{ scale: [1, 1.06, 1], x: [0, -20, 0], y: [0, 15, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Logo */}
        <Link to="/" className="relative flex items-center gap-2.5 w-fit z-10">
          <Logo size={32} />
          <span className="text-white font-bold text-lg tracking-tight">ShortListr</span>
        </Link>

        {/* Center content */}
        <div className="relative flex-1 flex flex-col justify-center -mt-8 z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignup ? 'signup' : 'signin'}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
            >
              <div
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-5"
                style={isSignup
                  ? { background: 'rgba(139,92,246,0.12)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.25)' }
                  : { background: 'rgba(245,200,66,0.1)', color: '#F5C842', border: '1px solid rgba(245,200,66,0.2)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: isSignup ? '#A78BFA' : '#F5C842' }} />
                {isSignup ? 'Join ShortListr' : 'Welcome back'}
              </div>
              <h2 className="text-4xl font-black text-white leading-tight mb-4">
                {isSignup ? (
                  <>Your resume,<br /><span style={{ color: '#F5C842' }}>optimized in 60s</span></>
                ) : (
                  <>Good to see<br /><span style={{ color: '#F5C842' }}>you again</span></>
                )}
              </h2>
              <p className="text-base max-w-xs" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                {isSignup
                  ? 'Paste your resume and a job description. AI analyzes the gap and rewrites your content for that specific role.'
                  : 'Your saved resume versions are waiting. Continue optimizing for new roles.'}
              </p>
            </motion.div>
          </AnimatePresence>

          <FloatingCards />

          {/* Stats */}
          <div className="relative flex items-center gap-8 mt-2">
            {[
              { value: '12K+', label: 'Resumes analyzed' },
              { value: '6',    label: 'AI-powered tools' },
              { value: '90s',  label: 'Avg. optimization' },
            ].map((s, i) => (
              <div key={s.label} className="relative">
                {i > 0 && <div className="absolute -left-4 top-1 bottom-1 w-px" style={{ background: 'rgba(255,255,255,0.1)' }} />}
                <p className="text-white font-black text-xl">{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="relative z-10 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
            All output is AI-generated. Review everything before submitting. Results are not guaranteed.
          </p>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col" style={{ background: '#0D0D14' }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <Logo size={28} />
            <span className="font-bold text-white">ShortListr</span>
          </Link>
          <div className="hidden lg:block" />
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
          >
            <ArrowLeft size={15} />
            Back to home
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[400px]">

            {/* Mode toggle */}
            <div
              className="relative flex p-1 mb-8 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <motion.div
                className="absolute top-1 bottom-1 rounded-xl"
                style={{ width: 'calc(50% - 4px)', background: '#13131A', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
                animate={{ x: isSignup ? 'calc(100% + 8px)' : 0 }}
                transition={{ duration: 0.38, ease: [0.34, 1.56, 0.64, 1] }}
              />
              <button
                onClick={() => isSignup && switchMode()}
                className="relative flex-1 py-2.5 rounded-xl text-sm font-semibold z-10 transition-colors duration-200"
                style={{ color: !isSignup ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)' }}
              >
                Sign In
              </button>
              <button
                onClick={() => !isSignup && switchMode()}
                className="relative flex-1 py-2.5 rounded-xl text-sm font-semibold z-10 transition-colors duration-200"
                style={{ color: isSignup ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)' }}
              >
                Sign Up
              </button>
            </div>

            {/* Animated form */}
            <motion.div
              key={displayMode + '-outer'}
              variants={formVariants}
              animate={phase === 'out' ? 'out' : 'in'}
              initial="in"
            >
              <motion.div
                key={animKey}
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                {/* Heading */}
                <motion.div variants={staggerItem} className="mb-7">
                  <h1 className="text-2xl font-black text-white mb-1">
                    {isSignup ? 'Create your account' : 'Welcome back'}
                  </h1>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {isSignup ? 'Start optimizing your resume today.' : 'Sign in to continue to your dashboard.'}
                  </p>
                </motion.div>

                {/* Social buttons */}
                <motion.div variants={staggerItem} className="space-y-2.5 mb-6">
                  {[
                    { id: 'google', label: 'Continue with Google', Icon: GoogleIcon },
                    { id: 'github', label: 'Continue with GitHub', Icon: GitHubIcon },
                  ].map(({ id, label, Icon }) => (
                    <motion.button
                      key={id}
                      onClick={() => handleSocial(id)}
                      disabled={!!socialLoading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.13 }}
                      className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.7)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                    >
                      {socialLoading === id ? (
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 rounded-full" style={{ border: '2px solid rgba(255,255,255,0.15)', borderTopColor: 'rgba(255,255,255,0.7)' }} />
                      ) : <Icon />}
                      {label}
                    </motion.button>
                  ))}
                </motion.div>

                {/* Divider */}
                <motion.div variants={staggerItem} className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>or with email</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                </motion.div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <motion.div variants={staggerItem}>
                    <Field label="Email address">
                      <Input
                        icon={Mail}
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </Field>
                  </motion.div>

                  <motion.div variants={staggerItem}>
                    <Field label="Password">
                      <Input
                        icon={Lock}
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete={isSignup ? 'new-password' : 'current-password'}
                        suffix={
                          <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            style={{ color: 'rgba(255,255,255,0.3)', lineHeight: 0 }}
                            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                          >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        }
                      />
                      {isSignup && <PasswordStrength password={password} />}
                    </Field>
                  </motion.div>

                  {/* Message */}
                  <AnimatePresence>
                    {message && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="text-sm rounded-xl px-4 py-3"
                        style={message.type === 'error'
                          ? { background: 'rgba(255,68,68,0.1)', color: '#FF6B6B', border: '1px solid rgba(255,68,68,0.2)' }
                          : { background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}
                      >
                        {message.text}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <motion.div variants={staggerItem}>
                    <motion.button
                      type="submit"
                      disabled={formLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 btn-shimmer mt-1"
                      style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F', boxShadow: '0 4px 20px rgba(245,200,66,0.25)' }}
                    >
                      {formLoading ? (
                        <>
                          <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 rounded-full" style={{ border: '2px solid rgba(10,10,15,0.3)', borderTopColor: '#0A0A0F' }} />
                          Please wait…
                        </>
                      ) : (
                        <>
                          <Zap size={15} />
                          {isSignup ? 'Create Account' : 'Sign In'}
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </form>

                {isSignup && (
                  <motion.p variants={staggerItem} className="text-center text-xs mt-5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    By signing up you agree to our{' '}
                    <Link to="/terms" style={{ color: '#F5C842' }} className="hover:underline">Terms</Link>{' '}and{' '}
                    <Link to="/privacy" style={{ color: '#F5C842' }} className="hover:underline">Privacy Policy</Link>.
                  </motion.p>
                )}
              </motion.div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  )
}
