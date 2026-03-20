import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { optimizeResume, generateCoverLetter } from '../lib/ai'
import ResumePreview from '../components/ui/ResumePreview'
import { supabase } from '../lib/supabase'
// Lazy-loaded so pdfjs-dist (~1MB) is only downloaded when the optimizer is used
const getPdfUtils = () => import('../lib/pdfUtils')

function Tabs({ value, onChange, options }) {
  return (
    <div className="flex bg-slate-100 dark:bg-navy-900 rounded-lg p-0.5 gap-0.5 w-fit mb-3">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            value === o.value
              ? 'bg-white dark:bg-navy-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function Optimizer() {
  const { user, profile, canOptimize, optimizationsRemaining } = useAuth()
  const isPro = profile?.tier === 'pro'

  // Resume
  const [resumeMode, setResumeMode] = useState('upload')
  const [resumeText, setResumeText] = useState('')
  const [pdfName, setPdfName] = useState(null)
  const [pdfParsing, setPdfParsing] = useState(false)
  const [pdfError, setPdfError] = useState(null)
  const fileInputRef = useRef(null)

  // Job description
  const [jobMode, setJobMode] = useState('url')
  const [jobUrl, setJobUrl] = useState('')
  const [jobText, setJobText] = useState('')
  const [fetchingJob, setFetchingJob] = useState(false)
  const [fetchError, setFetchError] = useState(null)

  // Result
  const [resultData, setResultData] = useState(null)
  const [atsScore, setAtsScore] = useState(null)
  const [optimizing, setOptimizing] = useState(false)
  const [optimizeError, setOptimizeError] = useState(null)

  // Cover letter
  const [coverText, setCoverText] = useState('')
  const [generatingCover, setGeneratingCover] = useState(false)
  const [coverError, setCoverError] = useState(null)
  const [copied, setCopied] = useState(false)

  // ── PDF upload handlers ──────────────────────────────
  const handleFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setPdfError('Please upload a valid PDF file.')
      return
    }
    setPdfError(null)
    setPdfParsing(true)
    setPdfName(file.name)
    try {
      const { extractTextFromPDF } = await getPdfUtils()
      const text = await extractTextFromPDF(file)
      setResumeText(text)
    } catch (err) {
      setPdfError('Could not parse PDF. Try copy-pasting the text instead.')
      console.error(err)
    } finally {
      setPdfParsing(false)
    }
  }

  const handleDragOver = (e) => { e.preventDefault() }
  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  // ── Job description URL fetch ────────────────────────
  const handleFetchJob = async () => {
    if (!jobUrl.trim()) return
    setFetchError(null)
    setFetchingJob(true)
    try {
      const { fetchJobDescriptionFromURL } = await getPdfUtils()
      const text = await fetchJobDescriptionFromURL(jobUrl.trim())
      setJobText(text)
      setJobMode('paste') // switch to text view so they can see / edit it
    } catch (err) {
      setFetchError('Could not fetch that URL. Paste the job description text directly instead.')
    } finally {
      setFetchingJob(false)
    }
  }

  // ── Optimize ─────────────────────────────────────────
  const handleOptimize = async () => {
    if (!resumeText.trim() || !jobText.trim()) return
    if (resumeText.length > 15000) {
      setOptimizeError('Resume text is too long. Please trim it to under 15,000 characters.')
      return
    }
    setOptimizeError(null)
    setOptimizing(true)
    try {
      const { result, atsScore: score } = await optimizeResume(resumeText, jobText)
      setResultData(result)
      setAtsScore(score)
      // Auto-save to library (best-effort — don't block on failure)
      const title = result?.experience?.[0]
        ? `${result.experience[0].title} — ${result.experience[0].company}`
        : result?.name ?? 'Optimized Resume'
      supabase.from('saved_resumes').insert({
        user_id: user?.id,
        title,
        resume_data: result,
        ats_score: score,
      }).then(({ error }) => {
        if (error) console.error('Auto-save failed:', error.message)
      })
    } catch (err) {
      setOptimizeError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setOptimizing(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(coverText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGenerateCover = async () => {
    if (!resumeText.trim() || !jobText.trim()) return
    setCoverError(null)
    setGeneratingCover(true)
    try {
      const text = await generateCoverLetter(resumeText, jobText)
      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      setCoverText(`${today}\n\n${text}`)
    } catch (err) {
      setCoverError(err.message ?? 'Something went wrong.')
    } finally {
      setGeneratingCover(false)
    }
  }

  const hasJobContent = jobMode === 'url' ? jobText.trim() : jobText.trim()
  const canSubmit = canOptimize && resumeText.trim() && hasJobContent

  return (
    <Layout>
      <div className="bg-white dark:bg-navy-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

          {/* Header */}
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Optimize My Resume</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Upload your resume PDF and a job description to get AI-powered optimization.
              </p>
            </div>
            {!isPro && profile && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm ${
                optimizationsRemaining === 0
                  ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400'
                  : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-navy-800 dark:border-white/10 dark:text-slate-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${optimizationsRemaining === 0 ? 'bg-red-500' : 'bg-electric-500'}`} />
                {optimizationsRemaining === 0 ? 'No optimizations left this month' : `${optimizationsRemaining} of 3 remaining`}
              </div>
            )}
            {isPro && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-electric-500/10 border-electric-500/30 text-electric-600 dark:text-electric-400 text-sm">
                <span className="w-2 h-2 rounded-full bg-electric-500" />
                Pro — unlimited
              </div>
            )}
          </div>

          {/* Upgrade wall */}
          {!canOptimize && !isPro && (
            <div className="mb-8 bg-gradient-to-br from-electric-500/5 to-violet-500/5 dark:from-electric-500/10 dark:to-violet-500/5 border border-electric-500/30 rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-electric-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-electric-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h2 className="text-slate-900 dark:text-white font-bold text-xl mb-2">You've used all 3 free optimizations this month</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-md mx-auto">
                Upgrade to Pro for unlimited optimizations, AI bullet rewriting, cover letter generation, and full version history — $10/month.
              </p>
              <Link to="/pricing"><Button size="lg">Upgrade to Pro</Button></Link>
            </div>
          )}

          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${!canOptimize && !isPro ? 'opacity-40 pointer-events-none select-none' : ''}`}>

            {/* ── LEFT: inputs ──────────────────────────── */}
            <div className="space-y-6">

              {/* Resume */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Your Resume</label>
                  <Tabs
                    value={resumeMode}
                    onChange={setResumeMode}
                    options={[{ value: 'upload', label: 'Upload PDF' }, { value: 'paste', label: 'Paste Text' }]}
                  />
                </div>

                {resumeMode === 'upload' ? (
                  <div>
                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-xl px-6 py-10 text-center cursor-pointer transition-all group ${
                        pdfName
                          ? 'border-electric-500/50 bg-electric-500/5 dark:bg-electric-500/5'
                          : 'border-slate-300 dark:border-white/20 hover:border-electric-500/50 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => handleFile(e.target.files?.[0])}
                      />
                      {pdfParsing ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-2 border-electric-500 border-t-transparent rounded-full animate-spin" />
                          <p className="text-slate-500 dark:text-slate-400 text-sm">Extracting text from PDF…</p>
                        </div>
                      ) : pdfName ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-electric-500/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-electric-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </div>
                          <p className="text-slate-900 dark:text-white font-medium text-sm">{pdfName}</p>
                          <p className="text-electric-500 text-xs">{resumeText.length.toLocaleString()} characters extracted</p>
                          <button
                            onClick={(e) => { e.stopPropagation(); setPdfName(null); setResumeText(''); setPdfError(null) }}
                            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline mt-1"
                          >
                            Remove and upload a different file
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-navy-700 flex items-center justify-center group-hover:bg-electric-500/10 transition-colors">
                            <svg className="w-6 h-6 text-slate-400 group-hover:text-electric-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 font-medium text-sm">Drop your resume PDF here</p>
                          <p className="text-slate-400 text-xs">or click to browse</p>
                        </div>
                      )}
                    </div>
                    {pdfError && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-2">{pdfError}</p>
                    )}
                  </div>
                ) : (
                  <textarea
                    rows={12}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste the full text of your resume here…"
                    className="w-full bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl px-5 py-4 text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500/30 transition-colors text-sm resize-none"
                  />
                )}
              </div>

              {/* Job description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Job Description</label>
                  <Tabs
                    value={jobMode}
                    onChange={setJobMode}
                    options={[{ value: 'url', label: 'Paste Link' }, { value: 'paste', label: 'Paste Text' }]}
                  />
                </div>

                {jobMode === 'url' ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={jobUrl}
                        onChange={(e) => setJobUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFetchJob()}
                        placeholder="https://jobs.company.com/engineer-role"
                        className="flex-1 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500/30 transition-colors text-sm"
                      />
                      <button
                        onClick={handleFetchJob}
                        disabled={!jobUrl.trim() || fetchingJob}
                        className="px-4 py-2.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-white text-sm font-medium rounded-xl border border-slate-200 dark:border-white/10 transition-colors whitespace-nowrap"
                      >
                        {fetchingJob ? (
                          <span className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-electric-500 rounded-full animate-spin" />
                            Fetching…
                          </span>
                        ) : 'Fetch'}
                      </button>
                    </div>
                    {fetchError && (
                      <p className="text-red-500 dark:text-red-400 text-xs">{fetchError}</p>
                    )}
                    {!fetchError && (
                      <p className="text-slate-400 text-xs">Paste the job posting URL and click Fetch — we'll extract the text automatically.</p>
                    )}
                  </div>
                ) : (
                  <textarea
                    rows={8}
                    value={jobText}
                    onChange={(e) => setJobText(e.target.value)}
                    placeholder="Paste the full job description here…"
                    className="w-full bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl px-5 py-4 text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500/30 transition-colors text-sm resize-none"
                  />
                )}
              </div>

              {/* Submit */}
              <div>
                <Button
                  size="lg"
                  disabled={!canSubmit || optimizing}
                  onClick={handleOptimize}
                  className="w-full"
                >
                  {optimizing ? 'Optimizing…' : 'Optimize My Resume'}
                </Button>
                {optimizeError && (
                  <p className="text-red-500 dark:text-red-400 text-xs text-center mt-2">{optimizeError}</p>
                )}
              </div>
            </div>

            {/* ── RIGHT: result ──────────────────────────── */}
            <div className="flex flex-col gap-4">
              {optimizing ? (
                <>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Optimized Resume</label>
                  <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl min-h-[520px] overflow-hidden">
                    {/* Colored header skeleton */}
                    <div className="p-6 space-y-3" style={{ background: '#1e3a5f' }}>
                      <div className="h-7 w-48 bg-white/20 rounded-lg animate-pulse" />
                      <div className="h-3 w-72 bg-white/10 rounded animate-pulse" />
                    </div>
                    {/* Body skeleton */}
                    <div className="p-6 space-y-4">
                      {[80, 95, 60, 88, 72, 65, 90, 55].map((w, i) => (
                        <div key={i} className="h-3 bg-slate-200 dark:bg-white/10 rounded-full animate-pulse" style={{ width: `${w}%`, animationDelay: `${i * 80}ms` }} />
                      ))}
                    </div>
                    <p className="text-center text-xs text-electric-500 font-medium flex items-center justify-center gap-2 pb-6">
                      <span className="w-1.5 h-1.5 bg-electric-500 rounded-full animate-ping inline-block" />
                      AI is optimizing your resume…
                    </p>
                  </div>
                </>
              ) : resultData ? (
                <ResumePreview data={resultData} atsScore={atsScore} />
              ) : (
                <>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Optimized Resume</label>
                  <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl flex-1 min-h-[520px] flex items-center justify-center">
                    <div className="text-center px-6 py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-electric-500/10 to-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-electric-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                      </div>
                      <p className="text-slate-900 dark:text-white font-medium text-sm mb-1">Your optimized resume will appear here</p>
                      <p className="text-slate-400 text-xs max-w-xs">
                        Upload your resume, add a job description, and hit Optimize — a beautifully formatted, ATS-ready resume will appear here.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>

          {/* ── Cover Letter Section ─────────────────────── */}
          <div className="mt-8 border-t border-slate-200 dark:border-white/10 pt-8">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cover Letter Generator</h2>
                  {!isPro && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-electric-500 to-violet-500 text-white px-2 py-0.5 rounded-full">Pro</span>
                  )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {isPro ? 'Generate a tailored cover letter from your resume and job description above.' : 'Upgrade to Pro to generate a tailored cover letter in seconds.'}
                </p>
              </div>
              {isPro && (
                <div className="flex items-center gap-2">
                  {coverText && (
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border transition-all bg-slate-50 dark:bg-navy-800 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-electric-500/50 hover:text-electric-600 dark:hover:text-electric-400"
                    >
                      {copied ? (
                        <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Copied</>
                      ) : (
                        <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>
                      )}
                    </button>
                  )}
                  <Button
                    disabled={!resumeText.trim() || !jobText.trim() || generatingCover}
                    onClick={handleGenerateCover}
                  >
                    {generatingCover ? 'Writing...' : coverText ? 'Regenerate' : 'Generate Cover Letter'}
                  </Button>
                </div>
              )}
              {!isPro && (
                <Link to="/pricing"><Button>Upgrade to Pro</Button></Link>
              )}
            </div>

            {!isPro && (
              <div className="bg-gradient-to-br from-electric-500/5 to-violet-500/5 border border-electric-500/20 rounded-xl p-8 text-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
                  Pro members get unlimited AI-generated cover letters tailored to each job — ready in under 30 seconds.
                </p>
              </div>
            )}

            {isPro && (
              <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl min-h-[200px] flex items-center justify-center">
                {generatingCover && (
                  <div className="text-center py-10">
                    <div className="w-8 h-8 border-2 border-electric-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Writing your cover letter…</p>
                  </div>
                )}
                {!generatingCover && !coverText && (
                  <p className="text-slate-400 text-sm px-6 text-center">Your cover letter will appear here. Make sure you've added a resume and job description above.</p>
                )}
                {!generatingCover && coverText && (
                  <textarea
                    value={coverText}
                    onChange={(e) => setCoverText(e.target.value)}
                    className="w-full h-full min-h-[300px] bg-transparent px-5 py-4 text-slate-700 dark:text-slate-300 text-sm resize-none focus:outline-none leading-relaxed"
                  />
                )}
              </div>
            )}
            {coverError && <p className="text-red-500 dark:text-red-400 text-xs mt-2">{coverError}</p>}
          </div>

        </div>
      </div>
    </Layout>
  )
}
