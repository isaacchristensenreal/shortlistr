import { RESUME_SYSTEM_PROMPT } from './prompt.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    if (resumeText.length > 15000 || jobDescription.length > 10000) {
      return new Response(JSON.stringify({ error: 'Input text is too long. Please trim your resume or job description.' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userPrompt = `Here is the candidate's current resume:\n\n${resumeText}\n\nHere is the job description:\n\n${jobDescription}\n\nReturn the optimized resume as a JSON object following the exact schema in your instructions. No markdown, no code fences — raw JSON only.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY') ?? ''}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 3000,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: RESUME_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data?.error?.message ?? 'OpenAI API error')
    }

    const u = data.usage
    if (u) {
      const cost = ((u.prompt_tokens * 0.15 + u.completion_tokens * 0.60) / 1_000_000).toFixed(6)
      console.log(`[optimize] tokens: ${u.prompt_tokens}p + ${u.completion_tokens}c = ${u.total_tokens}t (~$${cost})`)
    }

    const raw = data.choices?.[0]?.message?.content ?? '{}'
    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      throw new Error('AI returned invalid JSON. Please try again.')
    }

    const atsScore = parsed.ats_score ?? null
    delete parsed.ats_score

    return new Response(JSON.stringify({ result: parsed, atsScore }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
