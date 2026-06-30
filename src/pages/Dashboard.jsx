import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Plus, ArrowRight, Sparkles, Trash2 } from 'lucide-react'
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
  active:   { label: 'Active',   bg: 'rgba(5,150,105,0.1)',  border: 'rgba(5,150,105,0.2)',  color: '#059669' },
  placed:   { label: 'Placed',   bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)', color: '#818cf8' },
  inactive: { label: 'Inactive', bg: 'rgba(10,11,13,0.05)', border: 'rgba(10,11,13,0.1)', color: 'rgba(10,11,13,0.4)' },
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
  const color = score === null || score === undefined ? 'rgba(10,11,13,0.3)' : score >= 70 ? '#059669' : score >= 50 ? '#F59E0B' : '#dc2626'
  const bg = score === null || score === undefined ? 'rgba(10,11,13,0.05)' : `${color}12`
  const border = score === null || score === undefined ? 'rgba(10,11,13,0.1)' : `${color}28`
  return (
    <div className="w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0" style={{ background: bg, border: `1px solid ${border}` }}>
      <p className="text-sm font-black leading-none" style={{ color }}>{score ?? '—'}</p>
      <p className="text-[9px] font-semibold mt-0.5" style={{ color: score !== null && score !== undefined ? `${color}80` : 'rgba(10,11,13,0.25)' }}>ATS</p>
    </div>
  )
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [scoresByClient, setScoresByClient] = useState({})
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

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

  const handleDelete = async (id) => {
    setDeletingId(id)
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (!error) setClients(prev => prev.filter(c => c.id !== id))
    setDeletingId(null)
  }

  if (!profile) {
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#fafbfc' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 rounded-full"
            style={{ border: '2px solid rgba(59,130,246,0.15)', borderTopColor: '#3b82f6' }}
          />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="min-h-screen" style={{ background: '#fafbfc' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

          {/* Header */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-8 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
                Welcome back{firstName ? `, ${firstName}` : ''}
              </h1>
              <p className="text-sm" style={{ color: 'rgba(10,11,13,0.35)' }}>
                {loading ? 'Loading your roster…' : `${clients.length} client${clients.length !== 1 ? 's' : ''} on your roster`}
              </p>
            </div>
            <Link
              to="/clients/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#ffffff', boxShadow: '0 4px 16px rgba(59,130,246,0.2)' }}
            >
              <Plus size={16} strokeWidth={2.5} />
              Add Client
            </Link>
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="rounded-2xl overflow-hidden border divide-y divide-black/5" style={{ background: '#ffffff', borderColor: '#e5e7eb' }}>
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
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border" style={{ background: '#ffffff', borderColor: '#e5e7eb' }}>
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-6" style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.15)' }}>
                <Users size={28} style={{ color: 'rgba(59,130,246,0.5)' }} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Your roster is empty</h2>
              <p className="text-sm max-w-sm mb-8 leading-relaxed" style={{ color: 'rgba(10,11,13,0.35)' }}>
                Add your first client to start optimizing their resume and tracking their job search.
              </p>
              <Link to="/clients/new" className="px-6 py-3 rounded-xl font-bold text-sm transition-all" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#ffffff' }}>
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
              style={{ background: '#ffffff', borderColor: '#e5e7eb' }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
                <h2 className="text-white font-semibold text-sm">Clients</h2>
              </div>
              <div className="divide-y divide-black/5">
                {clients.map(c => (
                  <motion.div
                    key={c.id}
                    variants={staggerItem}
                    onClick={() => navigate(`/clients/${c.id}`)}
                    className="flex items-center gap-3 p-4 hover:bg-black/[0.02] transition-colors group cursor-pointer"
                  >
                    <ScoreBadge score={scoresByClient[c.id]} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate" style={{ color: 'rgba(10,11,13,0.85)' }}>{c.name}</p>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(10,11,13,0.3)' }}>
                        {c.contact_email ? `${c.contact_email} · ` : ''}Last activity {formatDate(c.last_activity_at)}
                      </p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(c.id) }}
                      disabled={deletingId === c.id}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all shrink-0"
                      style={{ color: 'rgba(10,11,13,0.25)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.background = 'rgba(220,38,38,0.08)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(10,11,13,0.25)'; e.currentTarget.style.background = 'transparent' }}
                      aria-label={`Remove ${c.name}`}
                    >
                      {deletingId === c.id ? (
                        <span className="w-3.5 h-3.5 border border-black/20 border-t-red-500 rounded-full animate-spin block" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                    <ArrowRight size={15} className="shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: 'rgba(10,11,13,0.15)' }} />
                  </motion.div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-black/5">
                <Link to="/clients/new" className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold transition-opacity hover:opacity-70" style={{ color: '#3b82f6' }}>
                  <Plus size={14} />
                  Add Client
                </Link>
              </div>
            </motion.div>
          )}

          {!loading && clients.length > 0 && clients.every(c => !(c.id in scoresByClient)) && (
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="mt-4 flex items-center gap-2 text-xs" style={{ color: 'rgba(10,11,13,0.25)' }}>
              <Sparkles size={13} />
              Run a scan from a client's workspace to see their ATS score here.
            </motion.div>
          )}

        </div>
      </div>
    </AppShell>
  )
}
