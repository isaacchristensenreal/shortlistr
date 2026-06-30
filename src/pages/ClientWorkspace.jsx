import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Zap } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import ResumePreview from '../components/ui/ResumePreview'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

function ScoreDot({ score }) {
  if (score === null || score === undefined) return null
  const color = score >= 70 ? '#00FF88' : score >= 50 ? '#F5C842' : '#FF4444'
  return (
    <div className="w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0" style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
      <p className="text-sm font-black leading-none" style={{ color }}>{score}</p>
      <p className="text-[9px] font-semibold mt-0.5" style={{ color: `${color}80` }}>ATS</p>
    </div>
  )
}

export default function ClientWorkspace() {
  const { clientId } = useParams()
  const { user } = useAuth()
  const [client, setClient] = useState(null)
  const [versions, setVersions] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!user || !clientId) return
    let cancelled = false

    const load = async () => {
      const { data: clientRow, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()

      if (cancelled) return
      if (clientError || !clientRow) {
        setNotFound(true)
        setLoading(false)
        return
      }
      setClient(clientRow)

      const { data: resumeRows } = await supabase
        .from('saved_resumes')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (cancelled) return
      setVersions(resumeRows ?? [])
      setSelected(resumeRows?.[0]?.id ?? null)
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [user, clientId])

  const formatDate = (ts) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const selectedResume = versions.find(v => v.id === selected)

  if (loading) {
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

  if (notFound) {
    return (
      <AppShell>
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6" style={{ background: '#0A0A0F' }}>
          <p className="text-white font-semibold mb-2">Client not found</p>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>This client may belong to a different account or no longer exists.</p>
          <Link to="/dashboard" className="px-5 py-2.5 rounded-xl font-bold text-sm" style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F' }}>
            Back to roster
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm mb-4 font-medium transition-colors" style={{ color: 'rgba(255,255,255,0.35)' }}>
            <ArrowLeft size={15} />
            Back to roster
          </Link>

          {/* Header */}
          <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{client.name}</h1>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {client.contact_email ? `${client.contact_email} · ` : ''}
                {versions.length} resume{versions.length !== 1 ? 's' : ''} on file
              </p>
            </div>
            <Link
              to={`/optimize?client=${client.id}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F', boxShadow: '0 4px 16px rgba(245,200,66,0.2)' }}
            >
              <Zap size={16} />
              Rewrite Resume
            </Link>
          </div>

          {/* Empty state */}
          {versions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border" style={{ background: '#13131A', borderColor: '#1E1E2E' }}>
              <h2 className="text-xl font-bold text-white mb-2">No resume yet</h2>
              <p className="text-sm max-w-sm mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Run a scan to generate {client.name}'s first ATS-optimized resume.
              </p>
              <Link to={`/optimize?client=${client.id}`} className="px-6 py-3 rounded-xl font-bold text-sm transition-all" style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F' }}>
                Run First Scan
              </Link>
            </div>
          )}

          {/* Workspace grid */}
          {versions.length > 0 && (
            <div className="flex gap-5 items-start flex-col lg:flex-row">

              {/* Current resume + ATS score */}
              <div className="flex-1 min-w-0 w-full">
                <p className="text-xs font-bold uppercase tracking-widest mb-3 px-1" style={{ color: 'rgba(255,255,255,0.25)' }}>Current Resume</p>
                {selectedResume ? (
                  <div className="rounded-2xl overflow-hidden" style={{ background: '#13131A', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="px-5 py-3.5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>
                          {selectedResume.title || 'Optimized Resume'}
                        </p>
                      </div>
                      <p className="text-xs shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        {formatDate(selectedResume.created_at)}
                      </p>
                    </div>
                    <div className="p-4 sm:p-6">
                      <ResumePreview data={selectedResume.resume_data} atsScore={selectedResume.ats_score} hideLabel />
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Version history */}
              <div className="w-full lg:w-72 xl:w-80 shrink-0 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest mb-3 px-1" style={{ color: 'rgba(255,255,255,0.25)' }}>Version History</p>
                {versions.map((v) => {
                  const isSelected = selected === v.id
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelected(v.id)}
                      style={{
                        background: isSelected ? '#1a1a2a' : '#13131A',
                        border: isSelected ? '1px solid rgba(245,200,66,0.25)' : '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '14px',
                      }}
                      className="w-full text-left transition-all duration-200"
                    >
                      <div className="p-3.5 pl-4 flex items-start gap-3">
                        <ScoreDot score={v.ats_score} />
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-sm font-semibold truncate leading-snug" style={{ color: isSelected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)' }}>
                            {v.title || 'Optimized Resume'}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{formatDate(v.created_at)}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
