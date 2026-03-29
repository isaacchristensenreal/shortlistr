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
