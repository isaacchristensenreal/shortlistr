const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are a brutally honest hiring manager and ATS expert who has seen tens of thousands of resumes. You tell candidates the cold hard truth about why their resume isn't getting them hired.

Return EXACTLY this JSON — no markdown, no code fences:
{
  "ats_score": <integer 0-100, honest ATS compatibility>,
  "verdict": "<one brutal, specific sentence about the single biggest problem — reference their actual job title or content>",
  "roast": [
    "<specific criticism 1 — must reference actual content from the resume>",
    "<specific criticism 2>",
    "<specific criticism 3>",
    "<specific criticism 4>",
    "<specific criticism 5>"
  ]
}

Rules:
- ats_score: honest score based on keyword density, action verb strength, quantified achievements, section structure, formatting quality
- verdict: one direct sentence naming the #1 thing killing their chances — name their actual role or company
- roast: exactly 5 items. Each must be brutally specific and reference actual content (job titles, bullet text, section names, specific phrases). No generic advice like "add more keywords" — say WHAT keywords for THEIR specific field
- Focus on: passive/weak bullets, zero metrics, generic descriptions that fit anyone, missing keywords for their industry, no summary, sparse skills, unexplained gaps, vague achievements
- Do NOT sugarcoat. Do NOT be encouraging. This is a roast.
- Return raw JSON only`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const truncatedResume = resumeText.slice(0, 6000)

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 700,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Resume:\n${truncatedResume}\n\nRoast this resume.` },
        ],
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data?.error?.message ?? 'AI analysis failed')

    const u = data.usage
    if (u) {
      const cost = ((u.prompt_tokens * 0.15 + u.completion_tokens * 0.60) / 1_000_000).toFixed(6)
      console.log(`[roast-resume] tokens: ${u.prompt_tokens}p + ${u.completion_tokens}c = ${u.total_tokens}t (~$${cost})`)
    }

    let parsed: { ats_score?: number; verdict?: string; roast?: string[] }
    try {
      parsed = JSON.parse(data.choices?.[0]?.message?.content ?? '{}')
    } catch {
      throw new Error('AI returned invalid response')
    }

    if (!parsed.roast || parsed.roast.length < 3) {
      throw new Error('AI did not return enough analysis')
    }

    return new Response(
      JSON.stringify({
        ats_score: parsed.ats_score ?? 45,
        verdict: parsed.verdict ?? '',
        roast: parsed.roast.slice(0, 5),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[roast-resume] Error:', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Something went wrong. Please try again.' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
