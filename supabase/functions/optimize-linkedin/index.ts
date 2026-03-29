const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are a LinkedIn SEO and personal branding expert. Optimize LinkedIn profiles for maximum recruiter discoverability.

LinkedIn has its own search algorithm — keywords in headline, about, and job titles heavily influence search ranking.

Return EXACTLY this JSON:
{
  "linkedin_score": 73,
  "headline": {
    "original": "the original headline",
    "optimized": "the optimized headline (220 chars max)",
    "changes": ["change 1 explanation", "change 2"]
  },
  "about": {
    "original": "the original about section",
    "optimized": "the full optimized about section (2000 chars max, keyword-rich, starts with strong hook)",
    "changes": ["change 1", "change 2", "change 3"]
  },
  "experience": [
    {
      "original": "original job description",
      "optimized": "optimized version with keywords and achievements",
      "changes": ["change 1", "change 2"]
    }
  ],
  "missing_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "keyword_sources": "Brief explanation of where these keywords come from (recruiter searches in their field)"
}

Rules:
- linkedin_score: current discoverability 1-100 BEFORE optimization
- Never fabricate job titles, companies, or dates
- missing_keywords: top 5 keywords recruiters in their field search for most
- Make changes specific and explain WHY each improves discoverability
Return raw JSON only.`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { headline, about, experience } = await req.json()

    if (!headline && !about) {
      return new Response(JSON.stringify({ error: 'Missing LinkedIn profile content' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userPrompt = `LinkedIn Profile to Optimize:

Headline: ${headline ?? '(not provided)'}

About Section: ${about ?? '(not provided)'}

${experience?.length ? `Job Descriptions:\n${experience.slice(0, 3).map((e, i) => `${i + 1}. ${e}`).join('\n\n')}` : ''}

Optimize this LinkedIn profile for maximum recruiter discoverability.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 3000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data?.error?.message ?? 'Anthropic API error')

    const raw = data.content?.[0]?.text ?? '{}'
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
