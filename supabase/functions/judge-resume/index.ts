const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are a brutally honest resume grader with 20 years of hiring experience.

Given a resume, return EXACTLY this JSON structure with no additional fields:
{
  "overall_score": <integer 0-100>,
  "overall_grade": <"A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D+" | "D" | "F">,
  "summary": "<2-3 sentence honest overall assessment referencing actual resume content>",
  "ats_readiness": <"High" | "Medium" | "Low">,
  "strengths": [
    { "title": "<5 words max>", "detail": "<specific explanation referencing actual resume content>" },
    { "title": "<5 words max>", "detail": "<specific explanation referencing actual resume content>" },
    { "title": "<5 words max>", "detail": "<specific explanation referencing actual resume content>" }
  ],
  "weaknesses": [
    { "title": "<5 words max>", "detail": "<specific explanation>", "fix": "<one specific actionable fix>" },
    { "title": "<5 words max>", "detail": "<specific explanation>", "fix": "<one specific actionable fix>" },
    { "title": "<5 words max>", "detail": "<specific explanation>", "fix": "<one specific actionable fix>" }
  ],
  "sections": {
    "contact": { "score": <integer 0-100>, "feedback": "<one sentence>" },
    "summary": { "score": <integer 0-100>, "feedback": "<one sentence>" },
    "experience": { "score": <integer 0-100>, "feedback": "<one sentence>" },
    "skills": { "score": <integer 0-100>, "feedback": "<one sentence>" },
    "education": { "score": <integer 0-100>, "feedback": "<one sentence>" }
  },
  "quick_wins": ["<specific actionable fix 1>", "<specific actionable fix 2>", "<specific actionable fix 3>"]
}

Rules:
- Return EXACTLY 3 strengths and 3 weaknesses
- Be brutally specific — reference actual job titles, companies, bullet points, or skills from the resume
- Do not sugarcoat; if the resume is mediocre, say so clearly
- overall_score drives overall_grade: 93+=A+, 90+=A, 87+=A-, 83+=B+, 80+=B, 77+=B-, 73+=C+, 70+=C, 67+=C-, 63+=D+, 60+=D, else F
- ats_readiness is High if score>=75, Medium if 50-74, Low if <50
- Return raw JSON only, no markdown`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { resumeText } = await req.json()

    if (!resumeText) {
      return new Response(JSON.stringify({ error: 'Missing resumeText' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userPrompt = `Resume:\n${resumeText.slice(0, 10000)}\n\nGrade this resume and return the JSON report.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY') ?? ''}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1500,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data?.error?.message ?? 'OpenAI API error')

    const raw = data.choices?.[0]?.message?.content ?? '{}'
    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      throw new Error('AI returned invalid JSON')
    }

    return new Response(JSON.stringify({ result: parsed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
