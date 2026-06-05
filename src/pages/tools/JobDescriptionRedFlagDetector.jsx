import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react'
import Layout from '../../components/layout/Layout'

const SYSTEM_PROMPT =
  "Analyze this job posting for red flags and positive signals. Return ONLY valid JSON: { red_flags: [ { flag: string, quote: string (exact phrase from posting max 8 words), reason: string (under 15 words) }, ... ], green_flags: [ { signal: string, quote: string, reason: string (under 15 words) }, ... ], overall_rating: 'Proceed'|'Proceed with caution'|'High risk' }. Max 5 red flags, max 3 green flags. Be honest and direct."

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do you spot a fake job posting?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Signs of a fake or ghost job posting include listings that have been open for many months with no updates, vague or copy-pasted job descriptions, no named hiring manager or team, requirements that don\'t match the listed salary, and companies that appear to interview without making offers. You can cross-reference the posting date on LinkedIn or Indeed with the current date — roles open longer than 60 days without explanation are worth approaching with caution.',
      },
    },
    {
      '@type': 'Question',
      name: "What does 'competitive salary' mean in a job posting?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "'Competitive salary' typically means the company has chosen not to disclose the salary range. In US states with salary transparency laws — including California, New York, Colorado, and Washington — companies are legally required to list ranges. Outside those states, hiding the range is a deliberate choice. It often signals the actual number is below market rate, or that compensation varies widely and the company wants flexibility to offer different candidates different numbers for the same role.",
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

const RATING_STYLES = {
  'Proceed':              { border: 'border-neon-400/40',   bg: 'bg-neon-400/10',   text: 'text-neon-400'   },
  'Proceed with caution': { border: 'border-amber-400/40',  bg: 'bg-amber-400/10',  text: 'text-amber-400'  },
  'High risk':            { border: 'border-crimson-400/40',bg: 'bg-crimson-400/10',text: 'text-crimson-400' },
}

export default function JobDescriptionRedFlagDetector() {
  const [jd, setJd] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleScan() {
    const trimmed = jd.trim()
    if (!trimmed) return

    const cacheKey = `jd_redflag_v1_${djb2Hash(trimmed)}`
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
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.2,
          max_tokens: 600,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: trimmed.slice(0, 3000) },
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

  const overLimit = jd.length > 3600
  const ratingStyle = result ? (RATING_STYLES[result.overall_rating] ?? RATING_STYLES['Proceed with caution']) : null

  return (
    <>
      <Helmet>
        <title>Job Posting Red Flag Detector — Free Tool to Spot Bad Job Listings</title>
        <meta
          name="description"
          content="Paste any job description and find the warning signs before you spend hours applying. Vague salary, unrealistic requirements, ghost postings — surfaced instantly."
        />
        <link rel="canonical" href="https://www.shortlistr.us/tools/job-description-red-flag-detector" />
        <meta property="og:title" content="Job Posting Red Flag Detector — Free Tool to Spot Bad Job Listings" />
        <meta
          property="og:description"
          content="Paste any job description and find the warning signs before you spend hours applying. Vague salary, unrealistic requirements, ghost postings — surfaced instantly."
        />
        <meta property="og:url" content="https://www.shortlistr.us/tools/job-description-red-flag-detector" />
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
              Job Description Red Flag Detector
            </h1>
            <p className="text-white/50 max-w-xl mx-auto text-sm sm:text-base">
              Paste a job posting before you spend hours applying. Get an honest read on the warning signs — and the green ones.
            </p>
          </div>

          {/* ── Editorial content ─────────────────────────────────────── */}
          <div className="space-y-10 mb-14 text-white/65 text-[0.95rem] leading-relaxed">

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">
                What job posting red flags actually cost you
              </h2>
              <p className="mb-3">
                The average job application takes 2–4 hours when you factor in tailoring your resume, writing a cover letter, filling out the application form, and the mental energy of getting your hopes up. Job postings with red flags don't always mean bad jobs — but they often mean roles with high turnover, misaligned expectations, or hiring managers who don't know what they want. Scanning before you invest that time isn't cynicism. It's triage.
              </p>
              <p>
                The most expensive red flag isn't the ones that look like red flags. It's the ghost posting — a job listing that's been open for months because the company keeps interviewing without intent to hire, or because they're benchmarking their current employee, or because they haven't gotten budget approval. None of that is disclosed. You apply, you hear nothing, and you wonder what you did wrong. You didn't do anything wrong. The job was never real.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">
                The red flags worth knowing
              </h2>
              <p className="mb-3">
                Unrealistic requirements are the most common — a five-year-old technology with a ten-year experience requirement, or an entry-level salary attached to a director-level responsibility list. This signals either a hiring manager who didn't write the JD themselves or a company trying to underpay for senior work.
              </p>
              <p className="mb-3">
                Vague compensation language like "competitive salary" or "compensation commensurate with experience" in 2024 is a choice. Salary transparency laws now cover a significant portion of US job seekers, and companies that still hide ranges in those states are doing it deliberately. Outside those states, it's worth asking yourself why they're hiding it.
              </p>
              <p>
                "Wear many hats" and "fast-paced environment" are not inherently bad. Paired with a list of responsibilities that spans four different departments and a salary range at the low end of the market, they mean you're being hired to do three jobs for one salary.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">
                Green flags are real too
              </h2>
              <p>
                A named hiring manager, a specific salary range, mention of the team size and who you'd report to, and clarity on what success looks like in the first 90 days — these are signals that someone thought carefully about this posting. They're also genuinely rare. When you see them, they're worth weighting.
              </p>
            </section>

          </div>

          {/* ── Tool ──────────────────────────────────────────────────── */}
          <div className="border-t border-border-dim pt-12">
            <h2 className="text-white text-xl font-semibold mb-6">Scan a job posting</h2>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white/70">Job posting text</label>
                <span className={`text-xs tabular-nums ${overLimit ? 'text-crimson-400' : 'text-white/30'}`}>
                  {jd.length} / 4000
                </span>
              </div>
              <textarea
                className="w-full min-h-[320px] bg-surface border border-border-dim rounded-xl p-4 text-sm text-white/80 placeholder-white/20 resize-none focus:outline-none focus:border-gold/40 transition-colors"
                placeholder="Paste the full job description here…"
                value={jd}
                maxLength={4000}
                onChange={e => setJd(e.target.value)}
              />
            </div>

            <div className="flex justify-center mb-10">
              <button
                onClick={handleScan}
                disabled={loading || !jd.trim()}
                className="px-8 py-3.5 rounded-xl font-semibold text-midnight bg-gold hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-gold text-sm"
              >
                {loading ? 'Scanning…' : 'Scan for Red Flags'}
              </button>
            </div>

            {error && (
              <div className="mb-8 rounded-xl border border-crimson/30 bg-crimson/10 px-5 py-4 text-crimson-400 text-sm text-center">
                {error}
              </div>
            )}

            {result && (
              <div className="animate-fadeUp space-y-6">
                {/* Overall rating */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${ratingStyle.border} ${ratingStyle.bg} ${ratingStyle.text}`}>
                  {result.overall_rating === 'Proceed'
                    ? <CheckCircle size={15} />
                    : <AlertTriangle size={15} />}
                  {result.overall_rating}
                </div>

                {/* Two columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Red flags */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-crimson-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-crimson-400 inline-block" />
                      Red Flags
                      {result.red_flags?.length > 0 && (
                        <span className="ml-auto text-xs text-white/30 font-normal">{result.red_flags.length} found</span>
                      )}
                    </h3>
                    {result.red_flags?.length > 0 ? (
                      result.red_flags.map((rf, i) => (
                        <FlagCard
                          key={i}
                          title={rf.flag}
                          quote={rf.quote}
                          reason={rf.reason}
                          variant="red"
                        />
                      ))
                    ) : (
                      <p className="text-white/30 text-xs">No red flags detected.</p>
                    )}
                  </div>

                  {/* Green flags */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-neon-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-neon-400 inline-block" />
                      Green Flags
                      {result.green_flags?.length > 0 && (
                        <span className="ml-auto text-xs text-white/30 font-normal">{result.green_flags.length} found</span>
                      )}
                    </h3>
                    {result.green_flags?.length > 0 ? (
                      result.green_flags.map((gf, i) => (
                        <FlagCard
                          key={i}
                          title={gf.signal}
                          quote={gf.quote}
                          reason={gf.reason}
                          variant="green"
                        />
                      ))
                    ) : (
                      <p className="text-white/30 text-xs">No strong green flags found.</p>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <div className="rounded-2xl border border-gold/20 bg-gold/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                  <p className="text-white/80 text-sm leading-relaxed">
                    <span className="text-white font-semibold">Decided to apply anyway?</span>{' '}
                    Tailor your resume to this exact posting in one click.
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
              <h3 className="text-white/90 font-medium mb-1">How do you spot a fake job posting?</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Signs of a fake or ghost job posting include listings that have been open for many months, vague or copy-pasted descriptions, no named hiring manager, requirements that don't match the salary, and companies that interview without making offers. Roles open longer than 60 days without explanation are worth approaching with caution.
              </p>
            </div>
            <div>
              <h3 className="text-white/90 font-medium mb-1">What does "competitive salary" mean in a job posting?</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                "Competitive salary" means the company chose not to disclose the range. In states with salary transparency laws — California, New York, Colorado, Washington — companies are legally required to list ranges. Outside those states, hiding the range is deliberate. It often signals the number is below market, or that the company wants flexibility to offer different candidates different amounts for the same role.
              </p>
            </div>
          </div>

        </div>
      </Layout>
    </>
  )
}

function FlagCard({ title, quote, reason, variant }) {
  const isRed = variant === 'red'
  return (
    <div className="bg-surface rounded-xl p-4 border border-border-dim">
      <div className="flex items-start gap-2 mb-2">
        {isRed
          ? <AlertTriangle size={14} className="text-crimson-400 shrink-0 mt-0.5" />
          : <CheckCircle  size={14} className="text-neon-400 shrink-0 mt-0.5" />}
        <p className={`text-sm font-semibold leading-snug ${isRed ? 'text-crimson-400' : 'text-neon-400'}`}>
          {title}
        </p>
      </div>
      {quote && (
        <p className={`text-xs rounded-lg px-3 py-2 mb-2 font-mono leading-relaxed ${
          isRed ? 'bg-crimson-400/8 text-crimson-400/80' : 'bg-neon-400/8 text-neon-400/80'
        }`}>
          "{quote}"
        </p>
      )}
      {reason && (
        <p className="text-xs text-white/35 leading-relaxed">{reason}</p>
      )}
    </div>
  )
}
