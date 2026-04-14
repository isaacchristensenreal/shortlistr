import { supabase } from './supabase'

// ── Existing functions (unchanged) ────────────────────────────────────────────

export async function generateCoverLetter(resumeText, jobDescription) {
  const { data, error } = await supabase.functions.invoke('cover-letter', {
    body: { resumeText, jobDescription },
  })
  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  return data.result
}

export async function optimizeResume(resumeText, jobDescription) {
  const { data, error } = await supabase.functions.invoke('optimize', {
    body: { resumeText, jobDescription },
  })
  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  return { result: data.result, atsScore: data.atsScore ?? null }
}

// ── New Claude-powered features ───────────────────────────────────────────────

export async function analyzeRejectionReasons(resumeText, jobDescription, atsScore) {
  const { data, error } = await supabase.functions.invoke('analyze-rejection-reasons', {
    body: { resumeText, jobDescription, atsScore },
  })
  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  return data.result
}

export async function detectAtsSystem(jobDescription, companyName) {
  const { data, error } = await supabase.functions.invoke('detect-ats-system', {
    body: { jobDescription, companyName },
  })
  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  return data.result
}

export async function generateJobMatches(resumeText) {
  const { data, error } = await supabase.functions.invoke('generate-job-matches', {
    body: { resumeText },
  })
  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  return data.result
}

export async function predictInterviewQuestions(resumeText, jobDescription) {
  const { data, error } = await supabase.functions.invoke('predict-interview-questions', {
    body: { resumeText, jobDescription },
  })
  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  return data.result
}

export async function optimizeLinkedIn(headline, about, experience) {
  const { data, error } = await supabase.functions.invoke('optimize-linkedin', {
    body: { headline, about, experience },
  })
  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  return data.result
}

export async function generateSalaryEmails(params) {
  const { data, error } = await supabase.functions.invoke('generate-salary-emails', {
    body: params,
  })
  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  return data.result
}

export async function judgeResume(resumeText) {
  const { data, error } = await supabase.functions.invoke('judge-resume', {
    body: { resumeText },
  })
  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  return data.result
}

export async function roastResume(resumeText) {
  const { data, error } = await supabase.functions.invoke('roast-resume', {
    body: { resumeText },
  })
  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  return data // { ats_score, verdict, roast: string[] }
}

// ── Public (no auth required) — image OCR for landing page ──────────────────
export async function extractTextFromImage(file) {
  const arrayBuffer = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  const imageBase64 = btoa(binary)

  const { data, error } = await supabase.functions.invoke('extract-image-text', {
    body: { imageBase64, mimeType: file.type },
  })
  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  return data.text // plain text extracted from the image
}

// ── Public (no auth required) — landing page lead magnet ─────────────────────
export async function scoreResumePreview(resumeText) {
  const { data, error } = await supabase.functions.invoke('score-preview', {
    body: { resumeText },
  })
  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  return data // { displayScore: number, issues: string[] }
}

// ── Authenticated — real job listings via web search ─────────────────────────

const JOB_REC_CACHE_KEY = 'shortlistr_job_recs'
const JOB_REC_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

function getCachedJobRecs() {
  try {
    const raw = localStorage.getItem(JOB_REC_CACHE_KEY)
    if (!raw) return null
    const { jobs, profile, timestamp } = JSON.parse(raw)
    if (Date.now() - timestamp > JOB_REC_TTL_MS) return null
    return { jobs, profile }
  } catch {
    return null
  }
}

function setCachedJobRecs(jobs, profile) {
  try {
    localStorage.setItem(
      JOB_REC_CACHE_KEY,
      JSON.stringify({ jobs, profile, timestamp: Date.now() })
    )
  } catch {
    // ignore storage errors
  }
}

export function clearJobRecsCache() {
  try { localStorage.removeItem(JOB_REC_CACHE_KEY) } catch { /* noop */ }
}

export async function getRealJobRecommendations(resumeText, { forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const cached = getCachedJobRecs()
    if (cached) return cached
  }

  const { data, error } = await supabase.functions.invoke('job-recommendations', {
    body: { resumeText },
  })
  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)

  setCachedJobRecs(data.jobs, data.profile)
  return { jobs: data.jobs, profile: data.profile }
}
