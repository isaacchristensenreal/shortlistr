import { supabase } from './supabase'

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

  // result is now a structured JSON object
  return { result: data.result, atsScore: data.atsScore ?? null }
}
