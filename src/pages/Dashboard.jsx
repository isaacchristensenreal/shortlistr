import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Plus, ArrowRight, Sparkles } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const EASE_OUT = [0.23, 1, 0.32, 1]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: EASE_OUT } },
}

const STATUS_STYLE = {
  active:   { label: 'Active',   bg: 'rgba(0,255,136,0.1)',  border: 'rgba(0,255,136,0.2)',  color: '#00FF88' },
  placed:   { label: 'Placed',   bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)', color: '#818cf8' },
  inactive: { label: 'Inactive', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.active
  return (
    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      {s.label}
    </span>
  )
}

function ScoreBadge({ score }) {
  const color = score === null || score === undefined ? 'rgba(255,255,255,0.3)' : score >= 70 ? '#00FF88' : score >= 50 ? '#F59E0B' : '#FF4444'
  const bg = score === null || score === undefined ? 'rgba(255,255,255,0.05)' : `${color}12`
  const border = score === null || score === undefined ? 'rgba(255,255,255,0.1)' : `${color}28`
  return (
    <div className="w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0" style={{ background: bg, border: `1px solid ${border}` }}>
      <p className="text-sm font-black leading-none" style={{ color }}>{score ?? '—'}</p>
      <p className="text-[9px] font-semibold mt-0.5" style={{ color: score !== null && score !== undefined ? `${color}80` : 'rgba(255,255,255,0.25)' }}>ATS</p>
    </div>
  )
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [clients, setClients] = useState([])
  const [scoresByClient, setScoresByClient] = useState({})
  const [loading, setLoading] = useState(true)

  const firstName = profile?.username || user?.email?.split('@')[0] || ''

  useEffect(() => {
    if (!user) return
    let cancelled = false

    const load = async () => {
      const { data: clientRows, error } = await supabase
        .from('clients')
        .select('*')
        .eq('coach_id', user.id)
        .order('last_activity_at', { ascending: false })

      if (cancelled) return
      if (error || !clientRows?.length) {
        setClients(clientRows ?? [])
        setLoading(false)
        return
      }
      setClients(clientRows)

      const ids = clientRows.map(c => c.id)
      const { data: resumeRows } = await supabase
        .from('saved_resumes')
        .select('client_id, ats_score, created_at')
        .in('client_id', ids)
        .order('created_at', { ascending: false })

      if (cancelled) return
      const latestByClient = {}
      for (const r of resumeRows ?? []) {
        if (!(r.client_id in latestByClient)) latestByClient[r.client_id] = r.ats_score
      }
      setScoresByClient(latestByClient)
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [user])

  const formatDate = (ts) => ts ? new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

  if (!profile) {
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0F' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 rounded-full"
            style={{ border: '2px solid rgba(245,200,66,0.15)', borderTopColor: '#F5C842' }}
          />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

          {/* Header */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-8 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
                Welcome back{firstName ? `, ${firstName}` : ''}
              </h1>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {loading ? 'Loading your roster…' : `${clients.length} client${clients.length !== 1 ? 's' : ''} on your roster`}
              </p>
            </div>
            <Link
              to="/clients/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F', boxShadow: '0 4px 16px rgba(245,200,66,0.2)' }}
            >
              <Plus size={16} strokeWidth={2.5} />
              Add Client
            </Link>
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="rounded-2xl overflow-hidden border divide-y divide-white/5" style={{ background: '#13131A', borderColor: '#1E1E2E' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <div className="skeleton w-11 h-11 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 w-1/3 rounded" />
                    <div className="skeleton h-2.5 w-1/4 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && clients.length === 0 && (
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border" style={{ background: '#13131A', borderColor: '#1E1E2E' }}>
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-6" style={{ background: 'rgba(245,200,66,0.07)', border: '1px solid rgba(245,200,66,0.15)' }}>
                <Users size={28} style={{ color: 'rgba(245,200,66,0.5)' }} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Your roster is empty</h2>
              <p className="text-sm max-w-sm mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Add your first client to start optimizing their resume and tracking their job search.
              </p>
              <Link to="/clients/new" className="px-6 py-3 rounded-xl font-bold text-sm transition-all" style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F' }}>
                Add Your First Client
              </Link>
            </motion.div>
          )}

          {/* Client roster */}
          {!loading && clients.length > 0 && (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="rounded-2xl overflow-hidden border"
              style={{ background: '#13131A', borderColor: '#1E1E2E' }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <h2 className="text-white font-semibold text-sm">Clients</h2>
              </div>
              <div className="divide-y divide-white/5">
                {clients.map(c => (
                  <motion.div key={c.id} variants={staggerItem}>
                    <Link
                      to={`/clients/${c.id}`}
                      className="flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors group"
                    >
                      <ScoreBadge score={scoresByClient[c.id]} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>{c.name}</p>
                          <StatusBadge status={c.status} />
                        </div>
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {c.contact_email ? `${c.contact_email} · ` : ''}Last activity {formatDate(c.last_activity_at)}
                        </p>
                      </div>
                      <ArrowRight size={15} className="shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: 'rgba(255,255,255,0.15)' }} />
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-white/5">
                <Link to="/clients/new" className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold transition-opacity hover:opacity-70" style={{ color: '#F5C842' }}>
                  <Plus size={14} />
                  Add Client
                </Link>
              </div>
            </motion.div>
          )}

          {!loading && clients.length > 0 && clients.every(c => !(c.id in scoresByClient)) && (
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="mt-4 flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              <Sparkles size={13} />
              Run a scan from a client's workspace to see their ATS score here.
            </motion.div>
          )}

        </div>
      </div>
    </AppShell>
  )
}
