import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EXTRACT_SYSTEM_PROMPT = `You are a resume parsing expert. Given a resume, extract the key professional profile.

Return EXACTLY this JSON:
{
  "jobTitles": ["<most likely target title 1>", "<title 2>", "<title 3>"],
  "skills": ["<skill 1>", "<skill 2>", "<skill 3>", "<skill 4>", "<skill 5>"],
  "experienceLevel": "entry" | "mid" | "senior" | "lead",
  "industries": ["<industry 1>", "<industry 2>"]
}

Rules:
- jobTitles: 3 specific roles this resume is targeting or qualified for based on actual experience
- skills: 5 most prominent and marketable technical or domain skills from the resume
- experienceLevel: based on years of experience and seniority of roles held
- industries: 1-2 industries this person has worked in
- Return raw JSON only, no markdown`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // ── Auth check ────────────────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[job-recommendations] Request from user: ${user.id}`)

    const { resumeText } = await req.json()

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: 'Please provide your resume text.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY') ?? ''
    if (!openaiKey) {
      console.error('[job-recommendations] OPENAI_API_KEY is not set')
      return new Response(
        JSON.stringify({ error: 'Job search service is temporarily unavailable.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── Step 1: GPT-4o-mini extracts professional profile ────────────────────
    console.log('[job-recommendations] Step 1: Extracting profile with gpt-4o-mini')

    const extractRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 512,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: EXTRACT_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Resume:\n${resumeText.slice(0, 10000)}\n\nExtract the professional profile JSON.`,
          },
        ],
      }),
    })

    const extractData = await extractRes.json()

    if (!extractRes.ok) {
      console.error('[job-recommendations] Profile extraction failed:', extractData)
      throw new Error('Profile extraction failed')
    }

    const u1 = extractData.usage
    if (u1) {
      const cost = ((u1.prompt_tokens * 0.15 + u1.completion_tokens * 0.60) / 1_000_000).toFixed(6)
      console.log(`[job-recommendations] extract tokens: ${u1.prompt_tokens}p + ${u1.completion_tokens}c (~$${cost})`)
    }

    let profile: {
      jobTitles: string[]
      skills: string[]
      experienceLevel: string
      industries: string[]
    }

    try {
      profile = JSON.parse(extractData.choices?.[0]?.message?.content ?? '{}')
    } catch {
      throw new Error('Failed to parse profile from AI')
    }

    console.log('[job-recommendations] Extracted profile:', JSON.stringify(profile))

    const primaryTitle = profile.jobTitles?.[0] ?? 'Professional'
    const skills = (profile.skills ?? []).slice(0, 5).join(', ')
    const level = profile.experienceLevel ?? 'mid'

    // ── Step 2: GPT-4o-mini with web_search_preview finds real job listings ──
    console.log('[job-recommendations] Step 2: Searching for real jobs via OpenAI web search')

    const searchPrompt = `Search for 8 real, currently open job listings for a ${level}-level ${primaryTitle} with skills in ${skills}.

Return ONLY a JSON array with no other text, no markdown, no explanation. Each item must have exactly these fields:
[
  {
    "title": "exact job title from the listing",
    "company": "company name",
    "location": "city, state or Remote",
    "salary": "salary range if listed, otherwise null",
    "applyUrl": "direct URL to apply or job listing page",
    "description": "1-2 sentence summary of the role and key requirements"
  }
]

Requirements:
- Only include jobs that are verifiably open right now (2025)
- Prefer jobs from company career pages, LinkedIn, Indeed, or Glassdoor
- Make sure applyUrl is a real, direct URL — not a placeholder
- Vary the companies (no duplicates)
- Return exactly 8 jobs`

    const searchRes = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        tools: [{ type: 'web_search_preview' }],
        input: searchPrompt,
      }),
    })

    const searchData = await searchRes.json()

    if (!searchRes.ok) {
      console.error('[job-recommendations] OpenAI Responses API error:', JSON.stringify(searchData))
      throw new Error(searchData?.error?.message ?? 'Job search failed')
    }

    console.log('[job-recommendations] Output types:',
      searchData.output?.map((o: { type: string }) => o.type).join(', '))

    // Extract text from the Responses API output format
    const messageOutput = searchData.output?.find(
      (o: { type: string }) => o.type === 'message'
    )
    const outputText = messageOutput?.content?.find(
      (c: { type: string }) => c.type === 'output_text'
    )?.text ?? '[]'

    console.log('[job-recommendations] Raw output (first 300 chars):', outputText.slice(0, 300))

    // Parse the JSON array — strip any markdown fences if present
    let jobs: unknown[]
    try {
      const cleaned = outputText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/, '')
        .trim()
      jobs = JSON.parse(cleaned)
      if (!Array.isArray(jobs)) throw new Error('Not an array')
    } catch {
      // Try extracting a JSON array from within the text
      const match = outputText.match(/\[[\s\S]*\]/)
      if (match) {
        try {
          jobs = JSON.parse(match[0])
        } catch {
          throw new Error('Could not parse job listings from search results')
        }
      } else {
        throw new Error('No job listings found in search results')
      }
    }

    // Normalize and validate
    const normalized = jobs
      .filter((j): j is Record<string, unknown> => typeof j === 'object' && j !== null)
      .map((j) => ({
        title: String(j.title ?? 'Position'),
        company: String(j.company ?? 'Company'),
        location: String(j.location ?? 'Location not listed'),
        salary: j.salary ? String(j.salary) : null,
        applyUrl: String(j.applyUrl ?? j.apply_url ?? j.url ?? '#'),
        description: String(j.description ?? ''),
      }))
      .filter((j) => j.title && j.company)
      .slice(0, 10)

    console.log(`[job-recommendations] Returning ${normalized.length} jobs`)

    return new Response(
      JSON.stringify({ jobs: normalized, profile }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[job-recommendations] Error:', err)
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Job search failed. Please try again.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
