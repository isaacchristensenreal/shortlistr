const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are a hiring expert and ATS specialist who diagnoses exactly why candidates get rejected.

Given a resume and job description, return EXACTLY 3 rejection reasons in this JSON format:
{
  "stage": "ats" | "human",
  "reasons": [
    {
      "title": "5 words max",
      "explanation": "2-3 sentences explaining exactly why this is causing rejections for this specific candidate",
      "severity": "Critical" | "Major" | "Minor",
      "fix": "One-line specific action to fix this"
    }
  ]
}

stage: "ats" if the resume score is below 65, "human" if above 65.
Order reasons from most to least severe.
Be brutally specific — reference actual content from the resume and job description.
Return raw JSON only, no markdown.`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { resumeText, jobDescription, atsScore } = await req.json()

    if (!resumeText || !jobDescription) {
      return new Response(JSON.stringify({ error: 'Missing resumeText or jobDescription' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userPrompt = `Resume:\n${resumeText.slice(0, 8000)}\n\nJob Description:\n${jobDescription.slice(0, 6000)}\n\nATS Score: ${atsScore ?? 'unknown'}\n\nAnalyze and return the 3 rejection reasons.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
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
