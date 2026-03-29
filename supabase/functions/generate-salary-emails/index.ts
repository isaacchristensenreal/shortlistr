const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are a compensation negotiation expert. Generate professional salary negotiation emails.

Return EXACTLY this JSON:
{
  "market_analysis": {
    "verdict": "Below Market" | "At Market" | "Above Market",
    "explanation": "2 sentences explaining the market rate assessment based on role, experience, and location",
    "estimated_market_range": { "min": 95000, "max": 135000 }
  },
  "emails": {
    "aggressive": {
      "subject": "email subject line",
      "body": "full email body, copy-paste ready, 150-200 words"
    },
    "balanced": {
      "subject": "email subject line",
      "body": "full email body, copy-paste ready, 150-200 words"
    },
    "soft": {
      "subject": "email subject line",
      "body": "full email body, copy-paste ready, 120-160 words"
    }
  }
}

Email rules:
- Aggressive: Confident, anchors high, uses competing offers if present, asks for specific number
- Balanced: Professional, grateful but firm, provides market data rationale
- Soft: Polite, acknowledges excitement, easy for employer to say yes, asks as a question
- All emails must be personalized to the specific role and situation — no generic placeholders
- Never use [Your Name] or [Company] — use the actual values provided
- Emails should feel warm and human, not template-y
Return raw JSON only.`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      role,
      offeredSalary,
      targetSalary,
      yearsExperience,
      location,
      competingOffer,
      candidateName,
      companyName,
      hiringManagerName,
    } = await req.json()

    if (!role || !offeredSalary || !targetSalary) {
      return new Response(JSON.stringify({ error: 'Missing required fields: role, offeredSalary, targetSalary' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userPrompt = `Negotiation Details:
Role: ${role}
Offered Salary: $${offeredSalary.toLocaleString()}
Target Salary: $${targetSalary.toLocaleString()}
Years of Experience: ${yearsExperience}
Location: ${location || 'US (unspecified city)'}
${competingOffer ? `Competing Offer: $${Number(competingOffer).toLocaleString()}` : ''}
Candidate Name: ${candidateName || 'the candidate'}
Company Name: ${companyName || 'the company'}
${hiringManagerName ? `Hiring Manager: ${hiringManagerName}` : ''}

Generate 3 salary negotiation emails and market analysis.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY') ?? ''}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 2500,
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
