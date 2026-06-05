import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Copy, Check, ExternalLink, Star } from 'lucide-react'
import Layout from '../../components/layout/Layout'

const SYSTEM_PROMPT =
  "Generate 5 LinkedIn headlines. Return ONLY valid JSON: { headlines: [ { text: string, char_count: number, style: string, recommended: boolean }, ... ] } — styles: 'Keyword-heavy', 'Value-prop', 'Role-forward', 'Creative', 'Open to work'. Each under 220 chars. One recommended: true. Use pipes or dots as separators. No clichés like results-driven or passionate."

const STYLE_CHIP = {
  'Keyword-heavy': 'bg-electric-500/10 text-electric-400 border-electric-500/20',
  'Value-prop':    'bg-neon-400/10 text-neon-400 border-neon-400/20',
  'Role-forward':  'bg-white/5 text-white/60 border-white/10',
  'Creative':      'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Open to work':  'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

function simpleHash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return h.toString(36)
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  function handle() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={handle}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-50 border border-border-dim text-white/50 hover:text-white hover:border-border-glow transition-all duration-150 shrink-0"
    >
      {copied ? <Check size={12} className="text-neon-400" /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function CharCounter({ value, max }) {
  const over = value.length > max - 20
  return (
    <span className={`text-xs tabular-nums ${over ? 'text-crimson-400' : 'text-white/30'}`}>
      {value.length} / {max}
    </span>
  )
}

export default function LinkedInHeadlineGenerator() {
  const [title, setTitle] = useState('')
  const [skills, setSkills] = useState('')
  const [goal, setGoal] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleGenerate() {
    const trimTitle = title.trim()
    const trimSkills = skills.trim()
    const trimGoal = goal.trim()
    if (!trimTitle) return

    const cacheKey = `li_headline_v1_${simpleHash(trimTitle + '\x00' + trimSkills + '\x00' + trimGoal)}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      try {
        setResult(JSON.parse(cached))
        setError(null)
        return
      } catch {
        localStorage.removeItem(cacheKey)
      }
    }

    setLoading(true)
    setError(null)
    setResult(null)

    const parts = [`Job title: ${trimTitle.slice(0, 80)}`]
    if (trimSkills) parts.push(`Top skills: ${trimSkills.slice(0, 150)}`)
    if (trimGoal)  parts.push(`Goal: ${trimGoal.slice(0, 100)}`)

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.6,
          max_tokens: 600,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: parts.join('\n') },
          ],
        }),
      })

      if (!res.ok) {
        const body = await res.text().catch(() => '')
        throw new Error(`API error ${res.status}${body ? ': ' + body.slice(0, 120) : ''}`)
      }

      const data = await res.json()
      const text = data.choices?.[0]?.message?.content?.trim() ?? ''
      const parsed = JSON.parse(text)

      localStorage.setItem(cacheKey, JSON.stringify(parsed))
      setResult(parsed)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Free LinkedIn Headline Generator — 5 Options Instantly</title>
        <meta
          name="description"
          content="Enter your job title and top skills. Get 5 LinkedIn headline options optimized for recruiter search and ATS. Free, instant, no account."
        />
        <link rel="canonical" href="https://www.shortlistr.us/tools/linkedin-headline-generator" />
        <meta property="og:title" content="Free LinkedIn Headline Generator — 5 Options Instantly" />
        <meta
          property="og:description"
          content="Enter your job title and top skills. Get 5 LinkedIn headline options optimized for recruiter search and ATS. Free, instant, no account."
        />
        <meta property="og:url" content="https://www.shortlistr.us/tools/linkedin-headline-generator" />
      </Helmet>

      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gold/10 text-gold border border-gold/20 mb-4 tracking-wider uppercase">
              Free Tool
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              LinkedIn Headline Generator
            </h1>
            <p className="text-white/50 max-w-md mx-auto text-sm sm:text-base">
              Your headline is the first thing recruiters read. Get 5 options — keyword-rich, value-focused, creative — and pick the one that fits your brand.
            </p>
          </div>

          {/* Inputs */}
          <div className="space-y-4 mb-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white/70">Current or Target Job Title</label>
                <CharCounter value={title} max={80} />
              </div>
              <input
                type="text"
                className="w-full bg-surface border border-border-dim rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-gold/40 transition-colors"
                placeholder="e.g. Senior Software Engineer"
                value={title}
                maxLength={80}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white/70">Top Skills</label>
                <CharCounter value={skills} max={150} />
              </div>
              <input
                type="text"
                className="w-full bg-surface border border-border-dim rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-gold/40 transition-colors"
                placeholder="e.g. React, TypeScript, Node.js, system design"
                value={skills}
                maxLength={150}
                onChange={e => setSkills(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white/70">
                  Open to work goal{' '}
                  <span className="text-white/30 font-normal">(optional)</span>
                </label>
                <CharCounter value={goal} max={100} />
              </div>
              <input
                type="text"
                className="w-full bg-surface border border-border-dim rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-gold/40 transition-colors"
                placeholder="e.g. seeking senior IC roles at climate tech startups"
                value={goal}
                maxLength={100}
                onChange={e => setGoal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              />
            </div>
          </div>

          {/* Button */}
          <div className="flex justify-center mb-10">
            <button
              onClick={handleGenerate}
              disabled={loading || !title.trim()}
              className="px-8 py-3.5 rounded-xl font-semibold text-midnight bg-gold hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-gold text-sm"
            >
              {loading ? 'Generating…' : 'Generate Headlines'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-8 rounded-xl border border-crimson/30 bg-crimson/10 px-5 py-4 text-crimson-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Results */}
          {result?.headlines && (
            <div className="animate-fadeUp space-y-3">
              {result.headlines.map((h, i) => {
                const chipClass = STYLE_CHIP[h.style] ?? 'bg-white/5 text-white/60 border-white/10'
                const charOk = (h.char_count ?? h.text.length) <= 220
                return (
                  <div
                    key={i}
                    className={`bg-surface rounded-xl p-5 border transition-colors ${
                      h.recommended
                        ? 'border-gold/40 shadow-gold'
                        : 'border-border-dim'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${chipClass}`}>
                          {h.style}
                        </span>
                        {h.recommended && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gold/10 text-gold border border-gold/20">
                            <Star size={10} className="fill-gold" />
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs tabular-nums ${charOk ? 'text-neon-400' : 'text-crimson-400'}`}>
                          {h.char_count ?? h.text.length}
                        </span>
                        <CopyButton text={h.text} />
                      </div>
                    </div>
                    <p className="text-white text-[0.95rem] font-medium leading-relaxed">{h.text}</p>
                  </div>
                )
              })}

              {/* CTA */}
              <div className="rounded-2xl border border-gold/20 bg-gold/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between mt-2">
                <p className="text-white/80 text-sm leading-relaxed">
                  <span className="text-white font-semibold">A strong headline means recruiters find you.</span>{' '}
                  A strong resume means they call you.
                </p>
                <a
                  href="https://shortlistr.us"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-midnight bg-gold hover:bg-gold-400 transition-all duration-200 shadow-gold whitespace-nowrap"
                >
                  shortlistr.us
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
