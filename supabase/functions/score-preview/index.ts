const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── In-memory rate limiter (per-instance; good enough for abuse prevention) ──
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }

  if (entry.count >= RATE_LIMIT) return false

  entry.count++
  return true
}

const SYSTEM_PROMPT = `You are an ATS (Applicant Tracking System) expert and resume analyst.

Given a resume, analyze it for ATS compatibility issues and return EXACTLY this JSON structure:
{
  "realScore": <integer 0-100 representing true ATS compatibility>,
  "issues": [
    "<specific critical problem 1>",
    "<specific critical problem 2>",
    "<specific critical problem 3>",
    "<specific critical problem 4>",
    "<specific critical problem 5>"
  ]
}

Rules:
- realScore: honest ATS compatibility score based on keyword density, formatting, section naming, action verbs, quantification, and structure
- issues: exactly 4-6 items, each one specific and critical
- Each issue MUST reference actual content from the resume (job titles, companies, specific bullet points, section names)
- Focus on: missing high-value keywords, weak/passive action verbs, lack of quantified achievements, ATS-unreadable formatting, non-standard section headers, sparse skills section, no summary/objective, unexplained gaps, missing dates
- Be brutally specific — not generic advice like "add more keywords"
- Return raw JSON only, no markdown, no explanation`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // ── Rate limiting ────────────────────────────────────────────────────────
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  console.log(`[score-preview] Request from IP: ${ip}`)

  if (!checkRateLimit(ip)) {
    console.log(`[score-preview] Rate limit exceeded for IP: ${ip}`)
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again in an hour.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { resumeText } = await req.json()

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: 'Please provide at least 50 characters of resume text.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY') ?? ''
    if (!openaiKey) {
      console.error('[score-preview] OPENAI_API_KEY is not set')
      return new Response(
        JSON.stringify({ error: 'Scoring service is temporarily unavailable.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const truncatedResume = resumeText.slice(0, 6000)
    console.log(`[score-preview] Calling OpenAI with ${truncatedResume.length} chars`)

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 600,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Resume:\n${truncatedResume}\n\nAnalyze this resume for ATS compatibility and return the JSON report.`,
          },
        ],
      }),
    })

    const openaiData = await openaiRes.json()

    if (!openaiRes.ok) {
      console.error('[score-preview] OpenAI API error:', openaiData)
      throw new Error(openaiData?.error?.message ?? 'AI analysis failed')
    }

    const rawText = openaiData.choices?.[0]?.message?.content ?? '{}'
    const u = openaiData.usage
    if (u) {
      const cost = ((u.prompt_tokens * 0.15 + u.completion_tokens * 0.60) / 1_000_000).toFixed(6)
      console.log(`[score-preview] tokens: ${u.prompt_tokens}p + ${u.completion_tokens}c = ${u.total_tokens}t (~$${cost})`)
    }
    console.log('[score-preview] OpenAI raw response:', rawText.slice(0, 200))

    let parsed: { realScore?: number; issues?: string[] }
    try {
      parsed = JSON.parse(rawText)
    } catch {
      console.error('[score-preview] Failed to parse JSON from OpenAI:', rawText)
      throw new Error('AI returned invalid response format')
    }

    const issues = Array.isArray(parsed.issues) ? parsed.issues.slice(0, 6) : []
    if (issues.length < 4) {
      throw new Error('AI did not return enough analysis data')
    }

    // ── Clamp score to 40–50 regardless of real score (intentional) ──────────
    const displayScore = Math.floor(Math.random() * 11) + 40 // 40–50 inclusive
    console.log(`[score-preview] Real score was ${parsed.realScore}, displaying ${displayScore}`)

    return new Response(
      JSON.stringify({ displayScore, issues }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[score-preview] Error:', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Something went wrong. Please try again.' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
