import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import ResumePreview from '../components/ui/ResumePreview'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

function ScoreBadge({ score }) {
  if (score === null || score === undefined) return null
  const color =
    score >= 85 ? 'from-green-500 to-emerald-400'
    : score >= 70 ? 'from-amber-500 to-yellow-400'
    : 'from-red-500 to-rose-400'
  const textColor =
    score >= 85 ? 'text-green-600 dark:text-green-400'
    : score >= 70 ? 'text-amber-600 dark:text-amber-400'
    : 'text-red-600 dark:text-red-400'
  const bg =
    score >= 85 ? 'bg-green-50 dark:bg-green-500/10'
    : score >= 70 ? 'bg-amber-50 dark:bg-amber-500/10'
    : 'bg-red-50 dark:bg-red-500/10'
  const bar =
    score >= 85 ? 'bg-gradient-to-r from-green-500 to-emerald-400'
    : score >= 70 ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
    : 'bg-gradient-to-r from-red-500 to-rose-400'

  return (
    <div className={`w-12 h-12 rounded-xl ${bg} flex flex-col items-center justify-center shrink-0 relative overflow-hidden`}>
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${color} opacity-60`} />
      <p className={`text-sm font-black ${textColor} leading-none`}>{score}</p>
      <p className={`text-[9px] font-semibold ${textColor} opacity-70 mt-0.5`}>ATS</p>
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
    const fetch = async () => {
      const { data } = await supabase
        .from('saved_resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setResumes(data ?? [])
      if (data?.length) setSelected(data[0].id)
      setLoading(false)
    }
    fetch()
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
    <Layout>
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric-500 to-violet-500 flex items-center justify-center shrink-0">
                <svg className="w-4.5 h-4.5 text-white w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Resume Library</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm pl-12">
              {loading ? 'Loading…' : resumes.length === 0 ? 'No saved resumes yet' : `${resumes.length} saved resume${resumes.length !== 1 ? 's' : ''} — click any to preview`}
            </p>
          </div>
          <Link to="/optimize">
            <Button>
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Optimization
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="bg-slate-50 dark:bg-navy-900/60 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-32">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-electric-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Loading your resumes…</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && resumes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-electric-500/15 to-violet-500/15 rounded-3xl flex items-center justify-center mb-5 float">
                <svg className="w-10 h-10 text-electric-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Your library is empty</h2>
              <p className="text-slate-400 text-sm max-w-sm mb-8 leading-relaxed">
                Every resume you optimize is automatically saved here. Run your first optimization to get started.
              </p>
              <Link to="/optimize"><Button size="lg">Optimize Your First Resume</Button></Link>
            </div>
          )}

          {/* Main grid */}
          {!loading && resumes.length > 0 && (
            <div className="flex gap-5 items-start">

              {/* ── Sidebar ───────────────────────────────── */}
              <div className={`w-full lg:w-72 xl:w-80 shrink-0 space-y-2 ${mobileView === 'preview' ? 'hidden lg:block' : 'block'}`}>

                {/* Section label */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <p className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold">Saved Resumes</p>
                  <span className="text-[11px] bg-electric-500/10 text-electric-600 dark:text-electric-400 font-bold px-2 py-0.5 rounded-full">{resumes.length}</span>
                </div>

                {resumes.map((r, i) => {
                  const isSelected = selected === r.id
                  const score = r.ats_score
                  const barColor =
                    score >= 85 ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                    : score >= 70 ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    : score !== null ? 'bg-gradient-to-r from-red-500 to-rose-400'
                    : 'bg-slate-300 dark:bg-white/20'

                  return (
                    <button
                      key={r.id}
                      onClick={() => handleSelect(r.id)}
                      style={{ animation: `staggerIn 0.35s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: `${i * 45}ms` }}
                      className={`w-full text-left rounded-2xl border-2 transition-all duration-200 group relative overflow-hidden ${
                        isSelected
                          ? 'bg-white dark:bg-navy-700 border-electric-500/50 shadow-lg shadow-electric-500/10'
                          : 'bg-white dark:bg-navy-800 border-slate-200/60 dark:border-white/10 hover:border-electric-500/30 hover:shadow-md hover:shadow-slate-200/50 dark:hover:shadow-black/20'
                      }`}
                    >
                      {/* Selected indicator strip */}
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-electric-500 to-violet-500 rounded-l-2xl" />
                      )}

                      <div className="p-3.5 pl-4">
                        <div className="flex items-start gap-3">
                          <ScoreBadge score={score} />
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className={`text-sm font-semibold truncate leading-snug ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                              {r.title || 'Optimized Resume'}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(r.created_at)}</p>
                          </div>
                          {/* Delete button */}
                          <button
                            onClick={e => { e.stopPropagation(); handleDelete(r.id) }}
                            disabled={deleting === r.id}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all shrink-0 mt-0.5"
                          >
                            {deleting === r.id ? (
                              <span className="w-3.5 h-3.5 border border-slate-300 border-t-red-400 rounded-full animate-spin block" />
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>

                        {/* ATS progress bar */}
                        {score !== null && (
                          <div className="mt-3">
                            <div className="h-1 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full bar-fill ${barColor}`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}

                {/* New optimization CTA at bottom of sidebar */}
                <div className="pt-2">
                  <Link to="/optimize" className="flex items-center gap-2 w-full p-3.5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 hover:border-electric-500/40 hover:text-electric-500 dark:hover:text-electric-400 transition-all text-sm font-medium justify-center group">
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    New Optimization
                  </Link>
                </div>
              </div>

              {/* ── Preview panel ─────────────────────────── */}
              <div
                className={`flex-1 min-w-0 ${mobileView === 'list' ? 'hidden lg:block' : 'block'}`}
                style={{ opacity: previewVisible ? 1 : 0, transition: 'opacity 0.18s ease' }}
              >
                {/* Mobile back button */}
                <button
                  onClick={() => setMobileView('list')}
                  className="lg:hidden flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-electric-500 dark:hover:text-electric-400 mb-4 font-medium transition-colors group"
                >
                  <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to list
                </button>

                {selectedResume ? (
                  <div className="bg-white dark:bg-navy-800 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
                    {/* Preview header bar */}
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400/60" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                        <div className="w-3 h-3 rounded-full bg-green-400/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                          {selectedResume.title || 'Optimized Resume'}
                        </p>
                      </div>
                      <p className="text-xs text-slate-400 shrink-0 hidden sm:block">
                        {formatDate(selectedResume.created_at)}
                      </p>
                    </div>

                    {/* ResumePreview component */}
                    <div className="p-4 sm:p-6">
                      <ResumePreview
                        data={selectedResume.resume_data}
                        atsScore={selectedResume.ats_score}
                        hideLabel
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-white dark:bg-navy-800 rounded-2xl border border-slate-200 dark:border-white/10">
                    <p className="text-slate-400 text-sm">Select a resume to preview</p>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
