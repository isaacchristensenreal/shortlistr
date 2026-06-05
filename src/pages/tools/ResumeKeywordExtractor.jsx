import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Copy, Check, ExternalLink } from 'lucide-react'
import Layout from '../../components/layout/Layout'

const SYSTEM_PROMPT =
  'Extract ATS keywords from this job description. Return ONLY valid JSON: { hard_skills: string[] (max 8), soft_skills: string[] (max 5), title_variants: string[] (max 3), must_have_phrases: string[] (max 4) }. Arrays only, no explanations.'

function simpleHash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return h.toString(36)
}

const SECTIONS = [
  {
    key: 'hard_skills',
    label: 'Hard Skills',
    description: 'Technical abilities, tools, and certifications',
    chipClass: 'bg-electric-500/10 text-electric-400 border-electric-500/20',
    dotClass: 'bg-electric-400',
    labelClass: 'text-electric-400',
  },
  {
    key: 'soft_skills',
    label: 'Soft Skills',
    description: 'Interpersonal and professional traits',
    chipClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    dotClass: 'bg-purple-400',
    labelClass: 'text-purple-400',
  },
  {
    key: 'title_variants',
    label: 'Title Variants',
    description: 'Job title synonyms the ATS may match',
    chipClass: 'bg-white/5 text-white/70 border-white/10',
    dotClass: 'bg-white/40',
    labelClass: 'text-white/60',
  },
  {
    key: 'must_have_phrases',
    label: 'Must-Have Phrases',
    description: 'Exact phrases from the requirements section',
    chipClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dotClass: 'bg-amber-400',
    labelClass: 'text-amber-400',
  },
]

export default function ResumeKeywordExtractor() {
  const [jd, setJd] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  async function handleExtract() {
    const trimmed = jd.trim()
    if (!trimmed) return

    const cacheKey = `kw_extract_v1_${simpleHash(trimmed)}`
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

    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0,
          max_tokens: 300,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: trimmed.slice(0, 2500) },
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

  function handleCopyAll() {
    if (!result) return
    const all = SECTIONS.flatMap(s => result[s.key] ?? [])
    navigator.clipboard.writeText(all.join(', ')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const overLimit = jd.length > 2800

  return (
    <>
      <Helmet>
        <title>Free Resume Keyword Extractor — Find the Exact ATS Keywords for Any Job</title>
        <meta
          name="description"
          content="Paste a job posting and get the exact keywords ATS systems scan for. Free tool, instant results, no account needed."
        />
        <link rel="canonical" href="https://www.shortlistr.us/tools/resume-keyword-extractor" />
        <meta property="og:title" content="Free Resume Keyword Extractor — Find the Exact ATS Keywords for Any Job" />
        <meta
          property="og:description"
          content="Paste a job posting and get the exact keywords ATS systems scan for. Free tool, instant results, no account needed."
        />
        <meta property="og:url" content="https://www.shortlistr.us/tools/resume-keyword-extractor" />
      </Helmet>

      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gold/10 text-gold border border-gold/20 mb-4 tracking-wider uppercase">
              Free Tool
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Resume Keyword Extractor
            </h1>
            <p className="text-white/50 max-w-lg mx-auto text-sm sm:text-base">
              Paste a job description and instantly get the exact keywords ATS systems look for — organized by type so you know where to put them.
            </p>
          </div>

          {/* Textarea */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-white/70">Job Description</label>
              <span className={`text-xs tabular-nums ${overLimit ? 'text-crimson-400' : 'text-white/30'}`}>
                {jd.length} / 3000
              </span>
            </div>
            <textarea
              className="w-full min-h-[260px] bg-surface border border-border-dim rounded-xl p-4 text-sm text-white/80 placeholder-white/20 resize-none focus:outline-none focus:border-gold/40 transition-colors"
              placeholder="Paste the full job posting here…"
              value={jd}
              maxLength={3000}
              onChange={e => setJd(e.target.value)}
            />
          </div>

          {/* Button */}
          <div className="flex justify-center mb-10">
            <button
              onClick={handleExtract}
              disabled={loading || !jd.trim()}
              className="px-8 py-3.5 rounded-xl font-semibold text-midnight bg-gold hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-gold text-sm"
            >
              {loading ? 'Extracting…' : 'Extract Keywords'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-8 rounded-xl border border-crimson/30 bg-crimson/10 px-5 py-4 text-crimson-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="animate-fadeUp space-y-4">
              {/* Copy all button */}
              <div className="flex justify-end">
                <button
                  onClick={handleCopyAll}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-surface border border-border-dim text-white/60 hover:text-white hover:border-border-glow transition-all duration-150"
                >
                  {copied ? <Check size={13} className="text-neon-400" /> : <Copy size={13} />}
                  {copied ? 'Copied!' : 'Copy all keywords'}
                </button>
              </div>

              {/* Keyword sections */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SECTIONS.map(section => {
                  const keywords = result[section.key] ?? []
                  return (
                    <div
                      key={section.key}
                      className="bg-surface rounded-xl p-5 border border-border-dim"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full inline-block ${section.dotClass}`} />
                        <h3 className={`text-sm font-semibold ${section.labelClass}`}>
                          {section.label}
                        </h3>
                      </div>
                      <p className="text-xs text-white/30 mb-3">{section.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {keywords.length > 0 ? (
                          keywords.map(kw => (
                            <span
                              key={kw}
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${section.chipClass}`}
                            >
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-white/25 text-xs">None found</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* CTA */}
              <div className="rounded-2xl border border-gold/20 bg-gold/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between mt-2">
                <p className="text-white/80 text-sm leading-relaxed">
                  <span className="text-white font-semibold">Shortlistr automatically inserts these keywords into your resume</span>{' '}
                  without it sounding stuffed.
                </p>
                <a
                  href="https://shortlistr.us"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-midnight bg-gold hover:bg-gold-400 transition-all duration-200 shadow-gold whitespace-nowrap"
                >
                  Try it free
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
