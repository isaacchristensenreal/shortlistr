import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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

export default function Library() {
  const { user } = useAuth()
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [previewVisible, setPreviewVisible] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [mobileView, setMobileView] = useState('list')

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data } = await supabase
        .from('saved_resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setResumes(data ?? [])
      if (data?.length) setSelected(data[0].id)
      setLoading(false)
    }
    load()
  }, [user])

  const handleSelect = (id) => {
    if (id === selected) { setMobileView('preview'); return }
    setPreviewVisible(false)
    setTimeout(() => { setSelected(id); setPreviewVisible(true) }, 160)
    setMobileView('preview')
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    const { error } = await supabase.from('saved_resumes').delete().eq('id', id)
    if (!error) {
      const updated = resumes.filter(r => r.id !== id)
      setResumes(updated)
      if (selected === id) setSelected(updated[0]?.id ?? null)
    }
    setDeleting(null)
  }

  const selectedResume = resumes.find(r => r.id === selected)
  const formatDate = (ts) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <AppShell>
      <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

          {/* Header */}
          <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">My Library</h1>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {loading ? 'Loading…' : resumes.length === 0
                  ? 'No saved resumes yet'
                  : `${resumes.length} saved resume${resumes.length !== 1 ? 's' : ''} — click any to preview`}
              </p>
            </div>
            <Link
              to="/optimize"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F', boxShadow: '0 4px 16px rgba(245,200,66,0.2)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Scan
            </Link>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-32">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'rgba(245,200,66,0.3)', borderTopColor: '#F5C842' }} />
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Loading your resumes…</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && resumes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6" style={{ background: 'rgba(245,200,66,0.07)', border: '1px solid rgba(245,200,66,0.15)' }}>
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="rgba(245,200,66,0.4)" strokeWidth="1.25">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Your library is empty</h2>
              <p className="text-sm max-w-sm mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Every resume you optimize is automatically saved here. Run your first scan to get started.
              </p>
              <Link to="/optimize" className="px-6 py-3 rounded-xl font-bold text-sm transition-all" style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F' }}>
                Scan Your First Resume
              </Link>
            </div>
          )}

          {/* Main grid */}
          {!loading && resumes.length > 0 && (
            <div className="flex gap-5 items-start">

              {/* Resume list */}
              <div className={`w-full lg:w-72 xl:w-80 shrink-0 space-y-2 ${mobileView === 'preview' ? 'hidden lg:block' : 'block'}`}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>Saved Resumes</p>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,200,66,0.12)', color: '#F5C842' }}>{resumes.length}</span>
                </div>

                {resumes.map((r, i) => {
                  const isSelected = selected === r.id
                  const score = r.ats_score
                  const accentColor = score >= 70 ? '#00FF88' : score >= 50 ? '#F5C842' : '#FF4444'

                  return (
                    <button
                      key={r.id}
                      onClick={() => handleSelect(r.id)}
                      style={{
                        animation: `staggerIn 0.35s cubic-bezier(0.22,1,0.36,1) both`,
                        animationDelay: `${i * 45}ms`,
                        background: isSelected ? '#1a1a2a' : '#13131A',
                        border: isSelected ? `1px solid rgba(245,200,66,0.25)` : '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '14px',
                        boxShadow: isSelected ? '0 0 0 1px rgba(245,200,66,0.1)' : 'none',
                      }}
                      className="w-full text-left transition-all duration-200 group relative overflow-hidden"
                    >
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r" style={{ background: '#F5C842' }} />
                      )}
                      <div className="p-3.5 pl-4">
                        <div className="flex items-start gap-3">
                          <ScoreDot score={score} />
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-sm font-semibold truncate leading-snug" style={{ color: isSelected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)' }}>
                              {r.title || 'Optimized Resume'}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{formatDate(r.created_at)}</p>
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); handleDelete(r.id) }}
                            disabled={deleting === r.id}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all shrink-0 mt-0.5"
                            style={{ color: 'rgba(255,255,255,0.2)' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#FF4444'; e.currentTarget.style.background = 'rgba(255,68,68,0.08)' }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'transparent' }}
                          >
                            {deleting === r.id ? (
                              <span className="w-3.5 h-3.5 border border-white/20 border-t-red-400 rounded-full animate-spin block" />
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {score !== null && (
                          <div className="mt-3">
                            <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                              <div className="h-full rounded-full bar-fill" style={{ width: `${score}%`, background: accentColor, opacity: 0.6 }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}

                <div className="pt-2">
                  <Link to="/optimize" className="flex items-center gap-2 w-full p-3.5 rounded-xl border-dashed text-sm font-medium justify-center transition-all"
                    style={{ border: '1.5px dashed rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.25)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,200,66,0.3)'; e.currentTarget.style.color = '#F5C842' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.25)' }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    New Optimization
                  </Link>
                </div>
              </div>

              {/* Preview panel */}
              <div
                className={`flex-1 min-w-0 ${mobileView === 'list' ? 'hidden lg:block' : 'block'}`}
                style={{ opacity: previewVisible ? 1 : 0, transition: 'opacity 0.18s ease' }}
              >
                <button
                  onClick={() => setMobileView('list')}
                  className="lg:hidden flex items-center gap-1.5 text-sm mb-4 font-medium transition-colors"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to list
                </button>

                {selectedResume ? (
                  <div className="rounded-2xl overflow-hidden" style={{ background: '#13131A', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {/* macOS-style chrome bar */}
                    <div className="px-5 py-3.5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(255,68,68,0.35)' }} />
                        <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(245,200,66,0.35)' }} />
                        <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(0,255,136,0.35)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>
                          {selectedResume.title || 'Optimized Resume'}
                        </p>
                      </div>
                      <p className="text-xs shrink-0 hidden sm:block" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        {formatDate(selectedResume.created_at)}
                      </p>
                    </div>
                    <div className="p-4 sm:p-6">
                      <ResumePreview data={selectedResume.resume_data} atsScore={selectedResume.ats_score} hideLabel />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 rounded-2xl" style={{ background: '#13131A', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>Select a resume to preview</p>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
