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

    const systemPrompt = `You are an expert cover letter writer. Write a compelling, human-sounding cover letter that:
1. Opens with a strong hook — not "I am writing to apply for..."
2. Highlights 2-3 specific achievements from the resume that directly match the job requirements
3. Uses keywords and language from the job description naturally
4. Shows genuine enthusiasm for the specific company/role
5. Is concise — 3 short paragraphs max, under 250 words
6. Ends with a confident call to action
7. Sounds like a real person wrote it, not an AI

Format: Plain text only. Include greeting and sign-off. No placeholders like [Your Name] — use the name from the resume if present, otherwise "the candidate".`

    const userPrompt = `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}\n\nWrite the cover letter now.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY') ?? ''}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1024,
        messages: [
          { role: 'system', content: systemPrompt },
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
      console.log(`[cover-letter] tokens: ${u.prompt_tokens}p + ${u.completion_tokens}c = ${u.total_tokens}t (~$${cost})`)
    }

    const result = data.choices?.[0]?.message?.content ?? 'Could not generate cover letter.'

    return new Response(JSON.stringify({ result }), {
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
