import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import ResumePreview from '../components/ui/ResumePreview'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Library() {
  const { user, profile } = useAuth()
  const isPro = profile?.tier === 'pro'
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [previewVisible, setPreviewVisible] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [mobileView, setMobileView] = useState('list') // 'list' | 'preview'

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
    if (id === selected) {
      setMobileView('preview')
      return
    }
    setPreviewVisible(false)
    setTimeout(() => {
      setSelected(id)
      setPreviewVisible(true)
    }, 180)
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
      <div className="bg-white dark:bg-navy-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Resume Library</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">All your saved optimized resumes in one place.</p>
            </div>
            <Link to="/optimize"><Button>New Optimization</Button></Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 border-electric-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
              <div className="w-16 h-16 bg-gradient-to-br from-electric-500/10 to-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-electric-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <p className="text-slate-900 dark:text-white font-semibold mb-2">No saved resumes yet</p>
              <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">Every resume you optimize is automatically saved here so you can revisit and download anytime.</p>
              <Link to="/optimize"><Button>Optimize your first resume</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

              {/* Sidebar list */}
              <div className={`space-y-2 ${mobileView === 'preview' ? 'hidden lg:block' : 'block'}`}>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">{resumes.length} saved resume{resumes.length !== 1 ? 's' : ''}</p>
                {resumes.map((r, i) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelect(r.id)}
                    style={{ animation: `staggerIn 0.35s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: `${i * 40}ms` }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all group ${
                      selected === r.id
                        ? 'bg-white dark:bg-navy-700 border-electric-500/30 shadow-sm ring-1 ring-electric-500/20'
                        : 'bg-slate-50 dark:bg-navy-800 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{r.title || 'Optimized Resume'}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{formatDate(r.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {r.ats_score !== null && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            r.ats_score >= 85 ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                            : r.ats_score >= 70 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                            : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                          }`}>{r.ats_score}%</span>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(r.id) }}
                          disabled={deleting === r.id}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Preview panel */}
              <div className={mobileView === 'list' ? 'hidden lg:block' : 'block'} style={{ transition: 'opacity 0.2s ease', opacity: previewVisible ? 1 : 0 }}>
                {/* Mobile back button */}
                <button
                  onClick={() => setMobileView('list')}
                  className="lg:hidden flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-4 font-medium"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  Back to list
                </button>
                {selectedResume && (
                  <ResumePreview data={selectedResume.resume_data} atsScore={selectedResume.ats_score} />
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
