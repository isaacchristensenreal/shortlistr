import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { ArrowRight, ExternalLink } from 'lucide-react'
import Layout from '../../components/layout/Layout'

const SYSTEM_PROMPT =
  "Normalize this job title for ATS compatibility. Return ONLY valid JSON: { original: string, normalized_primary: string, alternatives: string[] (max 2), ats_risk: 'Low'|'Medium'|'High', risk_reason: string (under 20 words), recommendation: string (under 25 words), keep_or_change: 'Keep'|'Change'|'Add alternate' }."

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Should I change my job title on my resume?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "You should not falsify a job title on your resume, but you can add a normalized equivalent in parentheses next to your actual title. For example, 'Growth Hacker (Marketing Manager)' or 'Chief Happiness Officer (HR Director)' is standard practice and fully accurate. This gives ATS systems the standard keyword they need while preserving what your employer actually called your role.",
      },
    },
    {
      '@type': 'Question',
      name: 'What job titles does ATS not recognize?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "ATS systems struggle most with portmanteau titles like DevSecOps Engineer, RevOps Manager, and DesignOps Lead, as well as creative or culture-driven titles like Growth Ninja, Chief Happiness Officer, and Full-Stack Wizard. Newer role names that post-date a platform's keyword database also score poorly. Enterprise and government ATS platforms are especially likely to miss these, as their keyword lists update slowly.",
      },
    },
  ],
}

function djb2Hash(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(h, 33) ^ str.charCodeAt(i)) >>> 0
  }
  return h.toString(36)
}

const RISK_STYLES = {
  Low:    { badge: 'bg-neon-400/10 text-neon-400 border-neon-400/20',    dot: 'bg-neon-400'    },
  Medium: { badge: 'bg-amber-400/10 text-amber-400 border-amber-400/20', dot: 'bg-amber-400'   },
  High:   { badge: 'bg-crimson-400/10 text-crimson-400 border-crimson-400/20', dot: 'bg-crimson-400' },
}

const KOC_STYLES = {
  'Keep':          'bg-neon-400/10 text-neon-400 border-neon-400/20',
  'Change':        'bg-crimson-400/10 text-crimson-400 border-crimson-400/20',
  'Add alternate': 'bg-amber-400/10 text-amber-400 border-amber-400/20',
}

export default function AtsJobTitleNormalizer() {
  const [title, setTitle] = useState('')
  const [industry, setIndustry] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleNormalize() {
    const trimTitle = title.trim()
    const trimIndustry = industry.trim()
    if (!trimTitle) return

    const cacheKey = `jt_norm_v1_${djb2Hash(trimTitle + '\x00' + trimIndustry)}`
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
    if (trimIndustry) parts.push(`Industry: ${trimIndustry.slice(0, 60)}`)

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0,
          max_tokens: 250,
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
        <title>ATS Job Title Normalizer — Fix Unusual Job Titles for Resume ATS</title>
        <meta
          name="description"
          content="Creative job titles like 'Growth Ninja' get filtered by ATS before anyone reads your resume. Find the standard equivalent and fix it free."
        />
        <link rel="canonical" href="https://www.shortlistr.us/tools/ats-job-title-normalizer" />
        <meta property="og:title" content="ATS Job Title Normalizer — Fix Unusual Job Titles for Resume ATS" />
        <meta
          property="og:description"
          content="Creative job titles like 'Growth Ninja' get filtered by ATS before anyone reads your resume. Find the standard equivalent and fix it free."
        />
        <meta property="og:url" content="https://www.shortlistr.us/tools/ats-job-title-normalizer" />
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
      </Helmet>

      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">

          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gold/10 text-gold border border-gold/20 mb-4 tracking-wider uppercase">
              Free Tool
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              ATS Job Title Normalizer
            </h1>
            <p className="text-white/50 max-w-xl mx-auto text-sm sm:text-base">
              Enter your current job title and see whether it's hurting your ATS score — plus the standard equivalent you should add to your resume.
            </p>
          </div>

          {/* ── Editorial content ─────────────────────────────────────── */}
          <div className="space-y-10 mb-14 text-white/65 text-[0.95rem] leading-relaxed">

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">
                Why your job title might be hurting your job search
              </h2>
              <p className="mb-3">
                Job titles have gotten creative. Growth Hacker. Chief Happiness Officer. Full-Stack Ninja. These titles can reflect genuine culture and real responsibilities — but they create a specific problem when you start applying elsewhere. ATS systems match your resume against the job posting using keyword logic. If the posting says "Marketing Manager" and your resume says "Head of Growth," the system may not connect those as equivalent. You score lower. You get filtered out. The recruiter never knows you applied.
              </p>
              <p>
                This isn't hypothetical. LinkedIn's own data has shown that non-standard titles get fewer profile views from recruiters, because recruiter search queries use standard industry terminology. The same dynamic applies inside ATS — the system is only as smart as its keyword matching, and keyword matching runs on consensus vocabulary, not creative naming.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">
                When to change your title and when to keep it
              </h2>
              <p className="mb-3">
                If your current employer gave you a creative title, you don't need to lie on your resume — but you can add a normalized equivalent in parentheses. "Growth Hacker (Marketing Manager)" is standard practice and fully honest. LinkedIn even has a separate "former title" field for this reason.
              </p>
              <p>
                The titles that carry the highest ATS risk are the ones that are ambiguous across industries. "Operations Lead" means something completely different in logistics versus software versus healthcare. "Product Owner" and "Product Manager" are treated as the same role by some ATS systems and different levels by others. Knowing which category your title falls into tells you whether to clarify or leave it.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">
                The titles ATS handles worst
              </h2>
              <p className="mb-3">
                Portmanteau titles are the biggest offenders — "DevSecOps Engineer," "RevOps Manager," "DesignOps Lead." These are real roles with real communities, but they're newer than most ATS keyword databases. If you're applying to companies using older ATS platforms (common in enterprise and government), these titles may return zero matches against standard postings.
              </p>
              <p>
                The fix is almost always additive: keep your real title but add the normalized version in your resume summary or as a subtitle under your current role. You preserve the authenticity of what you actually did while giving the parser something it can work with.
              </p>
            </section>

          </div>

          {/* ── Tool ──────────────────────────────────────────────────── */}
          <div className="border-t border-border-dim pt-12">
            <h2 className="text-white text-xl font-semibold mb-6">Normalize a job title</h2>

            <div className="space-y-4 mb-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white/70">Your Job Title</label>
                  <span className={`text-xs tabular-nums ${title.length > 72 ? 'text-crimson-400' : 'text-white/30'}`}>
                    {title.length} / 80
                  </span>
                </div>
                <input
                  type="text"
                  className="w-full bg-surface border border-border-dim rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-gold/40 transition-colors"
                  placeholder="e.g. Growth Ninja, Chief Happiness Officer, DevSecOps Lead"
                  value={title}
                  maxLength={80}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white/70">
                    Industry{' '}
                    <span className="text-white/30 font-normal">(optional — improves accuracy)</span>
                  </label>
                  <span className={`text-xs tabular-nums ${industry.length > 54 ? 'text-crimson-400' : 'text-white/30'}`}>
                    {industry.length} / 60
                  </span>
                </div>
                <input
                  type="text"
                  className="w-full bg-surface border border-border-dim rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-gold/40 transition-colors"
                  placeholder="e.g. SaaS, Healthcare, Finance, E-commerce"
                  value={industry}
                  maxLength={60}
                  onChange={e => setIndustry(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNormalize()}
                />
              </div>
            </div>

            <div className="flex justify-center mb-10">
              <button
                onClick={handleNormalize}
                disabled={loading || !title.trim()}
                className="px-8 py-3.5 rounded-xl font-semibold text-midnight bg-gold hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-gold text-sm"
              >
                {loading ? 'Normalizing…' : 'Normalize Title'}
              </button>
            </div>

            {error && (
              <div className="mb-8 rounded-xl border border-crimson/30 bg-crimson/10 px-5 py-4 text-crimson-400 text-sm text-center">
                {error}
              </div>
            )}

            {result && (
              <div className="animate-fadeUp space-y-5">
                {/* Side-by-side title comparison */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className="bg-surface rounded-xl p-4 border border-border-dim text-center">
                    <p className="text-xs text-white/30 mb-2 uppercase tracking-wider">Your Title</p>
                    <p className="text-white font-semibold text-base leading-snug">{result.original}</p>
                  </div>
                  <ArrowRight size={20} className="text-white/20 shrink-0" />
                  <div className="bg-surface rounded-xl p-4 border border-gold/30 text-center">
                    <p className="text-xs text-gold/60 mb-2 uppercase tracking-wider">Normalized</p>
                    <p className="text-white font-semibold text-base leading-snug">{result.normalized_primary}</p>
                  </div>
                </div>

                {/* Risk + verdict */}
                <div className="bg-surface rounded-xl p-5 border border-border-dim space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    {result.ats_risk && (() => {
                      const rs = RISK_STYLES[result.ats_risk] ?? RISK_STYLES.Medium
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${rs.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${rs.dot}`} />
                          {result.ats_risk} ATS Risk
                        </span>
                      )
                    })()}
                    {result.keep_or_change && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${KOC_STYLES[result.keep_or_change] ?? KOC_STYLES['Add alternate']}`}>
                        {result.keep_or_change}
                      </span>
                    )}
                  </div>

                  {result.risk_reason && (
                    <p className="text-white/65 text-sm leading-relaxed">
                      <span className="text-white/40 font-medium">Why: </span>
                      {result.risk_reason}
                    </p>
                  )}

                  {result.recommendation && (
                    <p className="text-white/65 text-sm leading-relaxed">
                      <span className="text-white/40 font-medium">Recommendation: </span>
                      {result.recommendation}
                    </p>
                  )}

                  {result.alternatives?.length > 0 && (
                    <div>
                      <p className="text-xs text-white/30 mb-2">Also recognized as:</p>
                      <div className="flex flex-wrap gap-2">
                        {result.alternatives.map(alt => (
                          <span key={alt} className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/60 border border-white/10">
                            {alt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="rounded-2xl border border-gold/20 bg-gold/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                  <p className="text-white/80 text-sm leading-relaxed">
                    <span className="text-white font-semibold">Shortlistr auto-normalizes your titles</span>{' '}
                    when it rewrites your resume for each application.
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

          {/* FAQ */}
          <div className="mt-16 space-y-6 border-t border-border-dim pt-12">
            <h2 className="text-xl font-semibold text-white">Frequently Asked Questions</h2>
            <div>
              <h3 className="text-white/90 font-medium mb-1">Should I change my job title on my resume?</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                You should not falsify a job title, but you can add a normalized equivalent in parentheses next to your actual title — for example, "Growth Hacker (Marketing Manager)." This is standard practice and fully accurate. It gives ATS systems the standard keyword they need while preserving what your employer actually called your role.
              </p>
            </div>
            <div>
              <h3 className="text-white/90 font-medium mb-1">What job titles does ATS not recognize?</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                ATS systems struggle most with portmanteau titles like DevSecOps Engineer, RevOps Manager, and DesignOps Lead, as well as creative titles like Growth Ninja and Chief Happiness Officer. Newer role names that post-date a platform's keyword database also score poorly. Enterprise and government ATS platforms are especially likely to miss these since their keyword lists update slowly.
              </p>
            </div>
          </div>

        </div>
      </Layout>
    </>
  )
}
