const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are a career GPS. Analyze a resume and return exactly 8 job matches where this candidate is positioned to succeed RIGHT NOW based on their actual skills, keywords, and experience level.

Return EXACTLY this JSON:
{
  "matches": [
    {
      "title": "Job Title",
      "company_archetype": "Type of company (e.g. Series B startup, Fortune 500, consulting firm)",
      "fit_reason": "One sentence explaining why their resume is a strong match — reference specific skills or experience",
      "salary_min": 85000,
      "salary_max": 120000,
      "seniority": "Entry" | "Mid" | "Senior" | "Lead",
      "match_score": 87,
      "key_matches": ["skill1", "skill2", "skill3"]
    }
  ]
}

Rules:
- Base everything strictly on what IS in the resume — no fabrication
- Salary ranges should be realistic for US market 2024
- Vary seniority levels based on actual experience
- key_matches: 3 specific skills/keywords from the resume that make this a fit
- Order by match_score descending
Return raw JSON only.`

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

    const userPrompt = `Resume:\n${resumeText.slice(0, 8000)}\n\nGenerate 8 job matches for this candidate.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY') ?? ''}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 2048,
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
