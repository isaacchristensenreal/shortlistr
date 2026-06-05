import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Copy, Check, ExternalLink } from 'lucide-react'
import Layout from '../../components/layout/Layout'

const SYSTEM_PROMPT =
  "Write 3 cover letter opening paragraphs. Return ONLY valid JSON: { openers: [ { style: string, text: string, word_count: number }, ... ] } — styles are exactly 'Direct', 'Story-driven', 'Question'. Each opener max 60 words. Sound human, not AI. Never start with 'I am writing to apply'."

const STYLE_META = {
  Direct: {
    label: 'Direct',
    description: 'Gets straight to the value you bring',
    chipClass: 'bg-electric-500/10 text-electric-400 border-electric-500/20',
  },
  'Story-driven': {
    label: 'Story-driven',
    description: 'Opens with a moment or experience',
    chipClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  Question: {
    label: 'Question',
    description: 'Hooks with a relevant question',
    chipClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
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
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-50 border border-border-dim text-white/50 hover:text-white hover:border-border-glow transition-all duration-150"
    >
      {copied ? <Check size={12} className="text-neon-400" /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function CoverLetterOpenerGenerator() {
  const [roleCompany, setRoleCompany] = useState('')
  const [fit, setFit] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleGenerate() {
    const trimmedRole = roleCompany.trim()
    const trimmedFit = fit.trim()
    if (!trimmedRole) return

    const cacheKey = `cl_opener_v1_${simpleHash(trimmedRole + '\x00' + trimmedFit)}`
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

    const userContent = `Role and company: ${trimmedRole.slice(0, 100)}${trimmedFit ? `\n\nWhat makes me a fit: ${trimmedFit.slice(0, 300)}` : ''}`

    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.7,
          max_tokens: 500,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userContent },
          ],
        }),
      })

      if (!res.ok) {
        throw new Error('Something went wrong with the API connection. Please try again.')
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
        <title>Cover Letter Opening Paragraph Generator — 3 Options, Free</title>
        <meta
          name="description"
          content="The hardest sentence to write. Get 3 cover letter opening paragraphs tailored to your role — direct, story-driven, or question-based. No signup."
        />
        <link rel="canonical" href="https://www.shortlistr.us/tools/cover-letter-first-paragraph-generator" />
        <meta property="og:title" content="Cover Letter Opening Paragraph Generator — 3 Options, Free" />
        <meta
          property="og:description"
          content="The hardest sentence to write. Get 3 cover letter opening paragraphs tailored to your role — direct, story-driven, or question-based. No signup."
        />
        <meta property="og:url" content="https://www.shortlistr.us/tools/cover-letter-first-paragraph-generator" />
      </Helmet>

      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gold/10 text-gold border border-gold/20 mb-4 tracking-wider uppercase">
              Free Tool
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Cover Letter Opener Generator
            </h1>
            <p className="text-white/50 max-w-md mx-auto text-sm sm:text-base">
              The hardest part of any cover letter. Get three opening paragraphs — direct, story-driven, and question-based — and pick the one that fits.
            </p>
          </div>

          {/* Inputs */}
          <div className="space-y-4 mb-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white/70">Role &amp; Company</label>
                <span className={`text-xs tabular-nums ${roleCompany.length > 90 ? 'text-crimson-400' : 'text-white/30'}`}>
                  {roleCompany.length} / 100
                </span>
              </div>
              <input
                type="text"
                className="w-full bg-surface border border-border-dim rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-gold/40 transition-colors"
                placeholder="e.g. Senior Product Manager at Stripe"
                value={roleCompany}
                maxLength={100}
                onChange={e => setRoleCompany(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white/70">
                  What makes you a fit{' '}
                  <span className="text-white/30 font-normal">(optional but improves results)</span>
                </label>
                <span className={`text-xs tabular-nums ${fit.length > 270 ? 'text-crimson-400' : 'text-white/30'}`}>
                  {fit.length} / 300
                </span>
              </div>
              <textarea
                className="w-full min-h-[110px] bg-surface border border-border-dim rounded-xl p-4 text-sm text-white/80 placeholder-white/20 resize-none focus:outline-none focus:border-gold/40 transition-colors"
                placeholder="e.g. 6 years in B2B SaaS, led a 0→1 payments product, obsessed with Stripe's API-first model"
                value={fit}
                maxLength={300}
                onChange={e => setFit(e.target.value)}
              />
            </div>
          </div>

          {/* Button */}
          <div className="flex justify-center mb-10">
            <button
              onClick={handleGenerate}
              disabled={loading || !roleCompany.trim()}
              className="px-8 py-3.5 rounded-xl font-semibold text-midnight bg-gold hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-gold text-sm"
            >
              {loading ? 'Generating…' : 'Generate Openers'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-8 rounded-xl border border-crimson/30 bg-crimson/10 px-5 py-4 text-crimson-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Results */}
          {result?.openers && (
            <div className="animate-fadeUp space-y-4">
              {result.openers.map((opener, i) => {
                const meta = STYLE_META[opener.style] ?? {
                  label: opener.style,
                  description: '',
                  chipClass: 'bg-white/5 text-white/60 border-white/10',
                }
                return (
                  <div key={i} className="bg-surface rounded-xl p-5 border border-border-dim">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.chipClass}`}>
                          {meta.label}
                        </span>
                        {meta.description && (
                          <span className="text-xs text-white/30 hidden sm:inline">{meta.description}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {opener.word_count && (
                          <span className="text-xs tabular-nums text-white/25">
                            {opener.word_count}w
                          </span>
                        )}
                        <CopyButton text={opener.text} />
                      </div>
                    </div>
                    <p className="text-white/85 text-[0.95rem] leading-relaxed">{opener.text}</p>
                  </div>
                )
              })}

              {/* Tip */}
              <p className="text-xs text-white/30 text-center px-4">
                Tip: pick one and finish the letter yourself — personalization is what gets callbacks.
              </p>

              {/* CTA */}
              <div className="rounded-2xl border border-gold/20 bg-gold/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                <p className="text-white/80 text-sm leading-relaxed">
                  <span className="text-white font-semibold">Shortlistr writes the full tailored cover letter</span>{' '}
                  alongside your optimized resume.
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
