import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, EyeOff, ArrowLeft, CheckCircle, Zap,
  Mail, Lock, BarChart3,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/ui/Logo'

const EASE_OUT = [0.23, 1, 0.32, 1]

// ─── Brand icons (inline SVG — brand colours required) ────────────────────────

const GoogleIcon = () => (
  <svg style={{ width: 18, height: 18, flexShrink: 0 }} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const GitHubIcon = () => (
  <svg style={{ width: 18, height: 18, flexShrink: 0 }} viewBox="0 0 24 24" fill="#0a0b0d">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
)

// ─── Password strength ────────────────────────────────────────────────────────

const PASSWORD_CHECKS = [
  { id: 'len',     label: 'At least 8 characters',        test: p => p.length >= 8 },
  { id: 'upper',   label: 'One uppercase letter',          test: p => /[A-Z]/.test(p) },
  { id: 'lower',   label: 'One lowercase letter',          test: p => /[a-z]/.test(p) },
  { id: 'number',  label: 'One number',                    test: p => /[0-9]/.test(p) },
  { id: 'special', label: 'One special character (!@#$…)', test: p => /[^A-Za-z0-9]/.test(p) },
]

function getStrength(password) {
  const passed = PASSWORD_CHECKS.filter(c => c.test(password)).length
  if (!password) return null
  if (passed <= 1) return { score: 1, label: 'Very weak',  color: '#dc2626' }
  if (passed === 2) return { score: 2, label: 'Weak',       color: '#f97316' }
  if (passed === 3) return { score: 3, label: 'Fair',       color: '#f59e0b' }
  if (passed === 4) return { score: 4, label: 'Good',       color: '#059669' }
  return               { score: 5, label: 'Strong',      color: '#059669' }
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
      <div className="flex gap-1 mb-2.5">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
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
        <span className="text-[10px]" style={{ color: '#94a3b8' }}>{strength.score}/5</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {PASSWORD_CHECKS.map(c => {
          const ok = c.test(password)
          return (
            <div key={c.id} className="flex items-center gap-1.5 text-[11px]" style={{ color: ok ? '#059669' : '#94a3b8' }}>
              <CheckCircle size={10} style={{ color: ok ? '#059669' : '#cbd5e1', flexShrink: 0 }} />
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
      {/* ATS Score card */}
      <motion.div
        animate={{ y: [0, -9, -4, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="rounded-2xl p-4"
        style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: '#94a3b8' }}>Client ATS Score</p>
            <p className="font-black text-2xl leading-none" style={{ color: '#059669' }}>94<span className="text-sm font-normal" style={{ color: '#94a3b8' }}>%</span></p>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#ecfdf5', border: '1px solid #86efac' }}>
            <CheckCircle size={18} style={{ color: '#059669' }} />
          </div>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
          <div className="h-full rounded-full" style={{ width: '94%', background: 'linear-gradient(90deg, #059669, #10b981)' }} />
        </div>
        <p className="text-[10px] mt-2" style={{ color: '#94a3b8' }}>Sarah K. · Product Manager · +41 pts</p>
      </motion.div>

      {/* AI Rewrite card */}
      <motion.div
        animate={{ y: [0, -7, -11, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        className="rounded-2xl p-3.5 ml-4"
        style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
      >
        <p className="text-[9px] uppercase tracking-wider mb-1.5" style={{ color: '#94a3b8' }}>AI Resume Rewrite</p>
        <p className="text-[11px] font-medium leading-relaxed" style={{ color: '#374151' }}>
          "Increased regional revenue by 34% YoY by restructuring a 12-person sales team and implementing a new CRM workflow."
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe' }}>+34% impact</span>
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: '#ecfdf5', color: '#166534', border: '1px solid #86efac' }}>ATS ready</span>
        </div>
      </motion.div>

      {/* Scorecard ready card */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
        className="rounded-2xl p-3.5 mr-4 flex items-center gap-3"
        style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <BarChart3 size={16} style={{ color: '#3b82f6' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold" style={{ color: '#0a0b0d' }}>Scorecard ready for James R.</p>
          <p className="text-[10px]" style={{ color: '#94a3b8' }}>ATS: 89 · +47 pts · 2 min ago</p>
        </div>
        <div className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ background: '#059669' }} />
      </motion.div>
    </div>
  )
}

// ─── Form field ───────────────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(10,11,13,0.6)' }}>
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
        background: focused ? 'rgba(59,130,246,0.04)' : 'rgba(0,0,0,0.02)',
        border: `1px solid ${focused ? 'rgba(59,130,246,0.4)' : 'rgba(0,0,0,0.09)'}`,
        boxShadow: focused ? '0 0 0 3px rgba(59,130,246,0.08)' : 'none',
      }}
    >
      {Icon && (
        <div className="absolute left-3.5 transition-colors duration-200" style={{ color: focused ? '#3b82f6' : 'rgba(10,11,13,0.3)' }}>
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
          color: '#0a0b0d',
          caretColor: '#3b82f6',
        }}
      />
      {suffix && <div className="absolute right-3.5">{suffix}</div>}
    </div>
  )
}

// ─── OAuth button ─────────────────────────────────────────────────────────────

function OAuthButton({ id, label, IconComponent, iconBg, hoverBg, hoverBorder, loading, onClick, disabled }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.13 }}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium disabled:opacity-50 transition-all duration-200"
      style={{
        background: 'rgba(0,0,0,0.02)',
        border: '1px solid rgba(0,0,0,0.09)',
        color: 'rgba(10,11,13,0.7)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = hoverBg
        e.currentTarget.style.borderColor = hoverBorder
        e.currentTarget.style.color = 'rgba(10,11,13,0.9)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(0,0,0,0.02)'
        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.09)'
        e.currentTarget.style.color = 'rgba(10,11,13,0.7)'
      }}
    >
      <span
        className="flex items-center justify-center rounded-lg shrink-0"
        style={{ width: 28, height: 28, background: iconBg, flexShrink: 0 }}
      >
        {loading ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            style={{ display: 'block', width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.1)', borderTopColor: 'rgba(0,0,0,0.5)' }}
          />
        ) : <IconComponent />}
      </span>
      <span className="flex-1 text-center">{label}</span>
    </motion.button>
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

  useEffect(() => {
    if (loading) return
    if (!user) return
    if (!profile) return // wait for the profile fetch so we don't guess and flash the wrong screen
    const needsOnboarding = !profile.onboarded && profile.tier !== 'pro'
    navigate(needsOnboarding ? '/welcome' : '/dashboard', { replace: true })
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#ffffff' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 rounded-full"
          style={{ border: '2px solid rgba(59,130,246,0.15)', borderTopColor: '#3b82f6' }}
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
    <div className="min-h-screen flex" style={{ background: '#ffffff' }}>

      {/* ── Left panel ──────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden">

        <div className="absolute inset-0" style={{ background: 'linear-gradient(140deg, #f0f9ff 0%, #e0f2fe 45%, #eff6ff 100%)' }} />
        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.08)_1px,transparent_0)] [background-size:28px_28px]" />

        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 480, height: 480, top: '15%', left: '10%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 65%)' }}
          animate={{ scale: [1, 1.08, 1], x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 360, height: 360, bottom: '20%', right: '5%', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 65%)' }}
          animate={{ scale: [1, 1.06, 1], x: [0, -20, 0], y: [0, 15, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />

        <Link to="/" className="relative flex items-center gap-2.5 w-fit z-10">
          <Logo size={32} />
          <span className="font-bold text-lg tracking-tight" style={{ color: '#0a0b0d' }}>ShortListr</span>
        </Link>

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
                style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#3b82f6' }} />
                {isSignup ? 'Join ShortListr' : 'Welcome back'}
              </div>
              <h2 className="text-4xl font-black leading-tight mb-4" style={{ color: '#0a0b0d' }}>
                {isSignup ? (
                  <>Your practice,<br /><span style={{ color: '#3b82f6' }}>organized from day one</span></>
                ) : (
                  <>Good to see<br /><span style={{ color: '#3b82f6' }}>you again</span></>
                )}
              </h2>
              <p className="text-base max-w-xs" style={{ color: '#475569', lineHeight: 1.6 }}>
                {isSignup
                  ? 'One workspace for all your clients\' resumes, ATS scores, and progress. No more Google Drive chaos.'
                  : 'Your client workspaces are waiting. Pick up where you left off.'}
              </p>
            </motion.div>
          </AnimatePresence>

          <FloatingCards />

          <div className="relative flex items-center gap-8 mt-2">
            {[
              { value: '50+',  label: 'Coaches onboarded' },
              { value: '6',    label: 'AI-powered tools' },
              { value: '90s',  label: 'Avg. scan time' },
            ].map((s, i) => (
              <div key={s.label} className="relative">
                {i > 0 && <div className="absolute -left-4 top-1 bottom-1 w-px" style={{ background: 'rgba(0,0,0,0.08)' }} />}
                <p className="font-black text-xl" style={{ color: '#0a0b0d' }}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-6" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
          <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
            All output is AI-generated. Review everything before submitting. Results are not guaranteed.
          </p>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col relative overflow-hidden" style={{ background: '#fafbfc' }}>

        {/* Ambient glows */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-2">
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <Logo size={28} />
            <span className="font-bold" style={{ color: '#0a0b0d' }}>ShortListr</span>
          </Link>
          <div className="hidden lg:block" />
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: '#94a3b8' }}
            onMouseEnter={e => e.currentTarget.style.color = '#475569'}
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
          >
            <ArrowLeft size={15} />
            Back to home
          </Link>
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-8">

          {/* Card */}
          <div
            className="w-full max-w-[420px] rounded-3xl p-8"
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
            }}
          >

            {/* Mode toggle */}
            <div
              className="relative flex p-1 mb-8 rounded-2xl"
              style={{ background: '#f1f5f9', border: '1px solid #e5e7eb' }}
            >
              <motion.div
                className="absolute top-1 bottom-1 rounded-xl"
                style={{ width: 'calc(50% - 4px)', background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                animate={{ x: isSignup ? 'calc(100% + 8px)' : 0 }}
                transition={{ duration: 0.38, ease: [0.34, 1.56, 0.64, 1] }}
              />
              {['Sign In', 'Sign Up'].map((label, i) => (
                <button
                  key={label}
                  onClick={() => (i === 0 ? isSignup : !isSignup) && switchMode()}
                  className="relative flex-1 py-2.5 rounded-xl text-sm font-semibold z-10 transition-colors duration-200"
                  style={{ color: (i === 0 ? !isSignup : isSignup) ? '#0a0b0d' : '#94a3b8' }}
                >
                  {label}
                </button>
              ))}
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
                  <h1 className="text-2xl font-black mb-1.5" style={{ color: '#0a0b0d' }}>
                    {isSignup ? 'Create your account' : 'Welcome back'}
                  </h1>
                  <p className="text-sm" style={{ color: '#64748b' }}>
                    {isSignup ? 'Start managing your clients in one workspace. Free to try.' : 'Sign in to continue to your dashboard.'}
                  </p>
                </motion.div>

                {/* Social buttons */}
                <motion.div variants={staggerItem} className="space-y-2.5 mb-6">
                  <OAuthButton
                    id="google"
                    label="Continue with Google"
                    IconComponent={GoogleIcon}
                    iconBg="white"
                    hoverBg="rgba(66,133,244,0.06)"
                    hoverBorder="rgba(66,133,244,0.25)"
                    loading={socialLoading === 'google'}
                    disabled={!!socialLoading}
                    onClick={() => handleSocial('google')}
                  />
                  <OAuthButton
                    id="github"
                    label="Continue with GitHub"
                    IconComponent={GitHubIcon}
                    iconBg="rgba(0,0,0,0.04)"
                    hoverBg="rgba(0,0,0,0.04)"
                    hoverBorder="rgba(0,0,0,0.15)"
                    loading={socialLoading === 'github'}
                    disabled={!!socialLoading}
                    onClick={() => handleSocial('github')}
                  />
                </motion.div>

                {/* Divider */}
                <motion.div variants={staggerItem} className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px" style={{ background: '#e5e7eb' }} />
                  <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>or continue with email</span>
                  <div className="flex-1 h-px" style={{ background: '#e5e7eb' }} />
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
                            style={{ color: '#94a3b8', lineHeight: 0 }}
                            onMouseEnter={e => e.currentTarget.style.color = '#475569'}
                            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
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
                          ? { background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }
                          : { background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe' }}
                      >
                        {message.text}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <motion.div variants={staggerItem} className="pt-1">
                    <motion.button
                      type="submit"
                      disabled={formLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 btn-shimmer"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: '#ffffff',
                        boxShadow: '0 4px 24px rgba(59,130,246,0.28)',
                      }}
                    >
                      {formLoading ? (
                        <>
                          <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                            style={{ display: 'block', width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#ffffff' }} />
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
                  <motion.p variants={staggerItem} className="text-center text-xs mt-5 leading-relaxed" style={{ color: '#94a3b8' }}>
                    By signing up you agree to our{' '}
                    <Link to="/terms" style={{ color: '#3b82f6' }} className="hover:underline">Terms</Link>{' '}and{' '}
                    <Link to="/privacy" style={{ color: '#3b82f6' }} className="hover:underline">Privacy Policy</Link>.
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
