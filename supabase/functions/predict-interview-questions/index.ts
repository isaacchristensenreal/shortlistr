const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are an expert interviewer and hiring coach. Given a candidate's resume and a job description, generate exactly 8 highly specific interview questions this company will likely ask THIS specific candidate.

CRITICAL RULES:
- Every question must reference something specific from either the resume OR job description
- No generic questions. "Tell me about yourself" is NOT acceptable.
- Focus on: gaps between resume and JD, career transitions, specific achievements to probe, technical depth

Return EXACTLY this JSON:
{
  "questions": [
    {
      "question": "The specific interview question",
      "category": "Behavioral" | "Technical" | "Situational" | "Culture Fit",
      "why_asked": "One sentence: why this company will ask this based on the JD/resume",
      "answer_framework": [
        "STAR bullet 1 — Situation/Task specific to this candidate",
        "STAR bullet 2 — Action they should highlight",
        "STAR bullet 3 — Result to emphasize"
      ]
    }
  ]
}

Return raw JSON only.`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { resumeText, jobDescription } = await req.json()

    if (!resumeText || !jobDescription) {
      return new Response(JSON.stringify({ error: 'Missing resumeText or jobDescription' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userPrompt = `Resume:\n${resumeText.slice(0, 7000)}\n\nJob Description:\n${jobDescription.slice(0, 5000)}\n\nGenerate 8 predicted interview questions.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY') ?? ''}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 2000,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data?.error?.message ?? 'OpenAI API error')

    const u = data.usage
    if (u) {
      const cost = ((u.prompt_tokens * 0.15 + u.completion_tokens * 0.60) / 1_000_000).toFixed(6)
      console.log(`[predict-interview-questions] tokens: ${u.prompt_tokens}p + ${u.completion_tokens}c = ${u.total_tokens}t (~$${cost})`)
    }

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
