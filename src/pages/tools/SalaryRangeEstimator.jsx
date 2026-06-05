import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { ExternalLink, TrendingUp } from 'lucide-react'
import Layout from '../../components/layout/Layout'

const SYSTEM_PROMPT =
  "Estimate salary range based on training data. Return ONLY valid JSON: { low: number, median: number, high: number, currency: string, includes_equity: boolean, includes_bonus: boolean, high_end_factors: string[] (max 3, each under 8 words), negotiation_tip: string (under 20 words), data_caveat: string (under 20 words, acknowledge this is training data not live market data) }. Give real numbers, don't hedge excessively."

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I answer salary expectations questions?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "The best approach is to delay anchoring until you have enough information about the role's scope and level. If pressed early, give a researched range rather than a single number — for example, 'Based on my research and the scope of this role, I'm targeting $X to $Y.' This signals confidence and preparation without locking you in before you know all the details. Avoid saying 'I'm flexible' — it signals you don't know your market value and will accept less.",
      },
    },
    {
      '@type': 'Question',
      name: 'What is a salary band?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "A salary band is the approved compensation range for a given role and level at a company. It has a floor, a midpoint, and a ceiling. Most companies target the midpoint for a qualified hire. The high end of the band is reserved for candidates who bring something above the baseline — specialized expertise, a competing offer, or experience that directly maps to the company's current problems. Understanding this helps you know what it takes to negotiate toward the top of the range rather than accepting the midpoint as the default.",
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

function formatCurrency(amount, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}

const VERIFY_LINKS = [
  { label: 'Levels.fyi', href: 'https://www.levels.fyi', note: 'Best for tech' },
  { label: 'Glassdoor', href: 'https://www.glassdoor.com/Salaries/index.htm', note: 'All industries' },
  { label: 'LinkedIn Salary', href: 'https://www.linkedin.com/salary/', note: 'Role + location' },
]

export default function SalaryRangeEstimator() {
  const [jobTitle, setJobTitle] = useState('')
  const [location, setLocation] = useState('')
  const [experience, setExperience] = useState('')
  const [industry, setIndustry] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleEstimate() {
    const trimTitle = jobTitle.trim()
    const trimLocation = location.trim()
    const trimExp = experience.trim()
    const trimIndustry = industry.trim()
    if (!trimTitle) return

    const cacheKey = `salary_est_v1_${djb2Hash([trimTitle, trimLocation, trimExp, trimIndustry].join('\x00'))}`
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
    if (trimLocation)  parts.push(`Location: ${trimLocation.slice(0, 80)}`)
    if (trimExp)       parts.push(`Years of experience: ${trimExp.slice(0, 20)}`)
    if (trimIndustry)  parts.push(`Industry: ${trimIndustry.slice(0, 60)}`)

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
          max_tokens: 350,
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
        <title>Free Salary Range Estimator — Know Your Worth Before You Negotiate</title>
        <meta
          name="description"
          content="Get a realistic salary range for any job title and location. Includes what pushes you to the high end and a negotiation tip. Free, no signup."
        />
        <link rel="canonical" href="https://www.shortlistr.us/tools/salary-range-estimator" />
        <meta property="og:title" content="Free Salary Range Estimator — Know Your Worth Before You Negotiate" />
        <meta
          property="og:description"
          content="Get a realistic salary range for any job title and location. Includes what pushes you to the high end and a negotiation tip. Free, no signup."
        />
        <meta property="og:url" content="https://www.shortlistr.us/tools/salary-range-estimator" />
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
              Salary Range Estimator
            </h1>
            <p className="text-white/50 max-w-xl mx-auto text-sm sm:text-base">
              Know your number before the recruiter asks. Get a low, median, and high estimate — plus what it takes to land at the top of the range.
            </p>
          </div>

          {/* ── Editorial content ─────────────────────────────────────── */}
          <div className="space-y-10 mb-14 text-white/65 text-[0.95rem] leading-relaxed">

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">
                Why most people leave money on the table in salary negotiation
              </h2>
              <p className="mb-3">
                The single biggest negotiation mistake isn't asking for too much. It's not knowing your range before the conversation starts. When a recruiter asks "what are your salary expectations" in the first call, that question isn't small talk — it's an anchoring attempt. If you say a number first, you've set the ceiling. If you say a number too low, most recruiters won't correct you. They'll move forward happily.
              </p>
              <p>
                Knowing your market range before that call doesn't just protect you from anchoring — it changes how you answer. "Based on my research and the scope of this role, I'm targeting X to Y" is a completely different conversation than either giving a number blind or saying "I'm flexible" (which signals you don't know your worth and will accept less).
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">
                How salary ranges actually work
              </h2>
              <p className="mb-3">
                Every role at a well-run company has a salary band — a low, midpoint, and high that HR has approved for that position and level. When a recruiter gives you a range, the midpoint is usually where they expect to land for a qualified candidate. The high end is reserved for someone who brings something they weren't expecting — specific domain expertise, a competing offer, or a track record that's clearly above the baseline requirement.
              </p>
              <p>
                The factors that consistently push compensation toward the high end are the same across most industries: specialized technical skills that are scarce, direct experience in the company's specific market or customer segment, a competing offer from a comparable company, and clarity in the interview about what problems you've already solved that this role needs solved.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">
                How to use this estimate
              </h2>
              <p>
                This tool uses AI training data, not live market feeds. Treat the output as a directional starting point, not a definitive number. For roles in fast-moving fields (AI, certain engineering specializations) or high cost-of-living markets, the actual market may have moved since the training data was collected. Levels.fyi is the most accurate source for compensation in tech. Glassdoor and LinkedIn Salary are better for non-tech roles. Use this estimate to sanity-check a posted range, prepare for the expectations question, or decide whether a role is worth pursuing before investing application time.
              </p>
            </section>

          </div>

          {/* ── Tool ──────────────────────────────────────────────────── */}
          <div className="border-t border-border-dim pt-12">
            <h2 className="text-white text-xl font-semibold mb-6">Estimate your salary range</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <InputField
                label="Job Title"
                placeholder="e.g. Senior Product Manager"
                value={jobTitle}
                max={80}
                onChange={setJobTitle}
              />
              <InputField
                label="City or Region"
                placeholder="e.g. San Francisco, New York, Remote US"
                value={location}
                max={80}
                onChange={setLocation}
              />
              <InputField
                label="Years of Experience"
                placeholder="e.g. 5, 8-10, 12+"
                value={experience}
                max={20}
                onChange={setExperience}
                onEnter={handleEstimate}
              />
              <InputField
                label="Industry"
                optional
                placeholder="e.g. SaaS, Healthcare, Finance"
                value={industry}
                max={60}
                onChange={setIndustry}
                onEnter={handleEstimate}
              />
            </div>

            <div className="flex justify-center mb-10">
              <button
                onClick={handleEstimate}
                disabled={loading || !jobTitle.trim()}
                className="px-8 py-3.5 rounded-xl font-semibold text-midnight bg-gold hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-gold text-sm"
              >
                {loading ? 'Estimating…' : 'Estimate Salary'}
              </button>
            </div>

            {error && (
              <div className="mb-8 rounded-xl border border-crimson/30 bg-crimson/10 px-5 py-4 text-crimson-400 text-sm text-center">
                {error}
              </div>
            )}

            {result && (
              <div className="animate-fadeUp space-y-5">
                {/* Three metric cards */}
                <div className="grid grid-cols-3 gap-3">
                  <MetricCard label="Low" amount={result.low} currency={result.currency} dim />
                  <MetricCard label="Median" amount={result.median} currency={result.currency} featured />
                  <MetricCard label="High" amount={result.high} currency={result.currency} dim />
                </div>

                {/* Detail card */}
                <div className="bg-surface rounded-xl p-5 border border-border-dim space-y-4">
                  {/* Equity / bonus badges */}
                  {(result.includes_equity || result.includes_bonus) && (
                    <div className="flex flex-wrap gap-2">
                      {result.includes_equity && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          Equity typically included
                        </span>
                      )}
                      {result.includes_bonus && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Bonus typically included
                        </span>
                      )}
                    </div>
                  )}

                  {/* High-end factors */}
                  {result.high_end_factors?.length > 0 && (
                    <div>
                      <p className="text-xs text-white/30 mb-2 flex items-center gap-1.5">
                        <TrendingUp size={12} />
                        What gets you to the high end:
                      </p>
                      <ul className="space-y-1">
                        {result.high_end_factors.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-white/65">
                            <span className="text-gold mt-0.5">→</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Negotiation tip */}
                  {result.negotiation_tip && (
                    <div className="rounded-lg bg-gold/8 border border-gold/15 px-4 py-3">
                      <p className="text-xs text-gold/60 mb-1">Negotiation tip</p>
                      <p className="text-sm text-white/80">{result.negotiation_tip}</p>
                    </div>
                  )}

                  {/* Data caveat */}
                  {result.data_caveat && (
                    <p className="text-xs text-white/25 leading-relaxed">{result.data_caveat}</p>
                  )}
                </div>

                {/* Verify links */}
                <div className="bg-surface rounded-xl p-5 border border-border-dim">
                  <p className="text-xs text-white/30 mb-3">Verify with live market data:</p>
                  <div className="flex flex-wrap gap-3">
                    {VERIFY_LINKS.map(link => (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-surface-50 border border-border-dim text-white/50 hover:text-white hover:border-border-glow transition-all duration-150"
                      >
                        {link.label}
                        <span className="text-white/25">·</span>
                        <span className="text-white/30">{link.note}</span>
                        <ExternalLink size={10} className="opacity-40" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="rounded-2xl border border-gold/20 bg-gold/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                  <p className="text-white/80 text-sm leading-relaxed">
                    <span className="text-white font-semibold">Know your worth — now make sure your resume justifies it.</span>{' '}
                    Shortlistr positions you for the senior end of the range.
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
              <h3 className="text-white/90 font-medium mb-1">How do I answer salary expectations questions?</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Give a researched range rather than a single number. "Based on my research and the scope of this role, I'm targeting $X to $Y" signals confidence without locking you in early. Avoid saying "I'm flexible" — it signals you don't know your market value and will accept less.
              </p>
            </div>
            <div>
              <h3 className="text-white/90 font-medium mb-1">What is a salary band?</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                A salary band is the approved compensation range for a given role and level at a company. It has a floor, a midpoint, and a ceiling. Most companies target the midpoint for a qualified hire. The high end is reserved for candidates who bring specialized expertise, a competing offer, or experience that directly maps to the company's current problems.
              </p>
            </div>
          </div>

        </div>
      </Layout>
    </>
  )
}

function InputField({ label, placeholder, value, max, onChange, onEnter, optional }) {
  const nearLimit = value.length > max - (max > 30 ? 8 : 4)
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-white/70">
          {label}{optional && <span className="text-white/30 font-normal ml-1">(optional)</span>}
        </label>
        <span className={`text-xs tabular-nums ${nearLimit ? 'text-crimson-400' : 'text-white/30'}`}>
          {value.length} / {max}
        </span>
      </div>
      <input
        type="text"
        className="w-full bg-surface border border-border-dim rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-gold/40 transition-colors"
        placeholder={placeholder}
        value={value}
        maxLength={max}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onEnter ? e => e.key === 'Enter' && onEnter() : undefined}
      />
    </div>
  )
}

function MetricCard({ label, amount, currency, featured, dim }) {
  return (
    <div className={`rounded-xl p-4 border text-center ${
      featured
        ? 'bg-surface border-gold/30'
        : 'bg-surface border-border-dim'
    }`}>
      <p className={`text-xs uppercase tracking-wider mb-2 ${featured ? 'text-gold/60' : 'text-white/25'}`}>
        {label}
      </p>
      <p className={`font-bold tabular-nums leading-none ${
        featured ? 'text-white text-xl sm:text-2xl' : 'text-white/60 text-base sm:text-lg'
      }`}>
        {formatCurrency(amount, currency)}
      </p>
    </div>
  )
}
