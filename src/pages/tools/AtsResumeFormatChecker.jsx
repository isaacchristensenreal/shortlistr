import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react'
import Layout from '../../components/layout/Layout'

const SYSTEM_PROMPT =
  "Analyze this resume text for ATS formatting issues. Return ONLY valid JSON: { score: number (0-10), checks: [ { name: string, status: 'pass'|'fail'|'warning', note: string (under 20 words) }, ... ] } — check these exactly: 'Contact info at top', 'Standard section headings', 'Consistent date format', 'No tables or columns detected', 'Bullet points present', 'Skills section found', 'Education section found', 'No graphics indicators'. Be strict."

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What formatting does ATS reject?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ATS systems commonly reject or misparse resumes that use multi-column layouts, tables, text boxes, headers and footers for contact info, graphics or icons, non-standard fonts, and custom bullet symbols. The safest format is a single-column plain text layout with standard section headings like Work Experience, Education, and Skills.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why does my resume get no responses?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The most common reason resumes get no responses is ATS filtering — your resume is either failing to parse correctly due to formatting issues, or it lacks the specific keywords from the job description. A formatting check rules out the first cause. If formatting is clean, the issue is likely keyword gaps between your resume and the job postings you are applying to.',
      },
    },
  ],
}

// djb2 hash
function djb2Hash(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(h, 33) ^ str.charCodeAt(i)) >>> 0
  }
  return h.toString(36)
}

function StatusIcon({ status }) {
  if (status === 'pass')    return <CheckCircle size={18} className="text-neon-400 shrink-0 mt-0.5" />
  if (status === 'fail')    return <XCircle     size={18} className="text-crimson-400 shrink-0 mt-0.5" />
  return                           <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
}

function statusLabel(status) {
  if (status === 'pass')    return 'text-neon-400'
  if (status === 'fail')    return 'text-crimson-400'
  return                           'text-amber-400'
}

function scoreColor(score) {
  if (score >= 8) return 'text-neon-400'
  if (score >= 6) return 'text-amber-400'
  return 'text-crimson-400'
}

function scoreSummary(score, checks) {
  if (score >= 8) return 'Your resume should parse cleanly on most major ATS platforms.'
  if (score >= 6) {
    const fails = checks?.filter(c => c.status !== 'pass').map(c => c.name.toLowerCase())
    return `There are fixable issues — address the warnings above before submitting.`
  }
  return 'Structural problems detected. A multi-column or table-based layout is likely causing parsing failures.'
}

export default function AtsResumeFormatChecker() {
  const [resume, setResume] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleCheck() {
    const trimmed = resume.trim()
    if (!trimmed) return

    const cacheKey = `ats_fmt_v1_${djb2Hash(trimmed)}`
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
          max_tokens: 500,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: trimmed.slice(0, 3000) },
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

  const overLimit = resume.length > 3600

  return (
    <>
      <Helmet>
        <title>Free ATS Resume Format Checker — Find Formatting Errors Instantly</title>
        <meta
          name="description"
          content="Paste your resume and see exactly which formatting issues will cause ATS systems to misparse or reject it. Free, no signup required."
        />
        <link rel="canonical" href="https://www.shortlistr.us/tools/ats-resume-format-checker" />
        <meta property="og:title" content="Free ATS Resume Format Checker — Find Formatting Errors Instantly" />
        <meta
          property="og:description"
          content="Paste your resume and see exactly which formatting issues will cause ATS systems to misparse or reject it. Free, no signup required."
        />
        <meta property="og:url" content="https://www.shortlistr.us/tools/ats-resume-format-checker" />
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
      </Helmet>

      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">

          {/* Page header */}
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gold/10 text-gold border border-gold/20 mb-4 tracking-wider uppercase">
              Free Tool
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              ATS Resume Format Checker
            </h1>
            <p className="text-white/50 max-w-xl mx-auto text-sm sm:text-base">
              Paste your resume text and instantly see which formatting issues will cause ATS systems to misparse or score it near zero.
            </p>
          </div>

          {/* ── Editorial content ─────────────────────────────────────── */}
          <div className="space-y-10 mb-14 text-white/65 text-[0.95rem] leading-relaxed">

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">
                Why resume formatting kills applications before anyone reads them
              </h2>
              <p className="mb-3">
                Most job seekers assume their resume gets read. In reality, at companies that use ATS software — which is most companies with more than 15 employees — your resume gets parsed by a machine first. That machine isn't reading. It's extracting: your name, contact info, job titles, dates, skills. If your formatting confuses the parser, those fields come back blank or scrambled, and your resume scores near zero before a human ever sees it.
              </p>
              <p>
                The formatting issues that cause this are mundane and fixable: two-column layouts that ATS reads left-to-right as garbled text, tables that export as a wall of pipes and dashes, headers and footers that parsers skip entirely, and graphics or icons that show up as empty boxes in the extracted data. None of these look wrong to a human eye. All of them are invisible resume killers.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">
                How to interpret your format check results
              </h2>
              <p className="mb-3">
                A score of 8–10 means your resume will parse cleanly on most major ATS platforms including Greenhouse, Lever, Workday, and iCIMS. A score of 6–7 means there are fixable issues — usually a non-standard section heading (writing "Career History" instead of "Work Experience") or inconsistent date formats (mixing "Jan 2022" and "01/2022" in the same document). A score below 6 usually means structural problems: columns, tables, or a design template built for human readers, not machine parsing.
              </p>
              <p>
                The single most common failure: resumes built in Canva, Google Docs with multi-column layouts, or InDesign. They look sharp. They parse terribly. If a recruiter has ever told you they "had trouble with your file," this is why.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">
                What ATS systems actually check
              </h2>
              <p className="mb-3">
                Different ATS platforms weight different signals, but the universal ones are: a parseable contact block at the top of the document, standard section labels (Work Experience, Education, Skills), dates in a consistent format attached to each role, and bullet points formatted with standard characters rather than custom symbols. Beyond those basics, more sophisticated systems like Workday and Taleo also run keyword matching — but they can only match keywords they successfully extracted, which brings you back to formatting.
              </p>
              <p>
                The fix is almost always simpler than people expect: single-column layout, standard fonts, no text boxes, no headers/footers for contact info, no tables. Clean and boring beats beautiful and broken.
              </p>
            </section>

          </div>

          {/* ── Tool ──────────────────────────────────────────────────── */}
          <div className="border-t border-border-dim pt-12">
            <h2 className="text-white text-xl font-semibold mb-6">Check your resume formatting</h2>

            {/* Textarea */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white/70">Paste resume text</label>
                <span className={`text-xs tabular-nums ${overLimit ? 'text-crimson-400' : 'text-white/30'}`}>
                  {resume.length} / 4000
                </span>
              </div>
              <textarea
                className="w-full min-h-[320px] bg-surface border border-border-dim rounded-xl p-4 text-sm text-white/80 placeholder-white/20 resize-none focus:outline-none focus:border-gold/40 transition-colors"
                placeholder="Paste the plain text of your resume here. Copy from your PDF or Word doc using Ctrl+A → Ctrl+C, then paste…"
                value={resume}
                maxLength={4000}
                onChange={e => setResume(e.target.value)}
              />
            </div>

            {/* Button */}
            <div className="flex justify-center mb-10">
              <button
                onClick={handleCheck}
                disabled={loading || !resume.trim()}
                className="px-8 py-3.5 rounded-xl font-semibold text-midnight bg-gold hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-gold text-sm"
              >
                {loading ? 'Checking…' : 'Check Formatting'}
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
              <div className="animate-fadeUp space-y-6">
                {/* Score */}
                <div className="flex flex-col items-center">
                  <div className={`text-7xl font-black tabular-nums leading-none ${scoreColor(result.score)}`}>
                    {result.score}<span className="text-3xl text-white/20 font-normal">/10</span>
                  </div>
                  <div className="text-white/40 text-sm mt-2">ATS Format Score</div>
                </div>

                {/* Checklist */}
                <div className="bg-surface rounded-xl border border-border-dim overflow-hidden">
                  {result.checks?.map((check, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 px-5 py-4 ${
                        i < result.checks.length - 1 ? 'border-b border-border-dim' : ''
                      }`}
                    >
                      <StatusIcon status={check.status} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${statusLabel(check.status)}`}>
                          {check.name}
                        </p>
                        {check.note && (
                          <p className="text-xs text-white/35 mt-0.5 leading-relaxed">{check.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <p className="text-white/50 text-sm text-center">
                  {scoreSummary(result.score, result.checks)}
                </p>

                {/* CTA */}
                <div className="rounded-2xl border border-gold/20 bg-gold/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                  <div>
                    <p className="text-white font-semibold mb-1">
                      Shortlistr generates ATS-clean formatted resumes automatically.
                    </p>
                    <p className="text-white/50 text-sm">No formatting headaches.</p>
                  </div>
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

          {/* FAQ (HTML for crawlers) */}
          <div className="mt-16 space-y-6 border-t border-border-dim pt-12">
            <h2 className="text-xl font-semibold text-white">Frequently Asked Questions</h2>
            <div>
              <h3 className="text-white/90 font-medium mb-1">What formatting does ATS reject?</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                ATS systems commonly reject or misparse resumes that use multi-column layouts, tables, text boxes, headers and footers for contact info, graphics or icons, non-standard fonts, and custom bullet symbols. The safest format is a single-column plain text layout with standard section headings like Work Experience, Education, and Skills.
              </p>
            </div>
            <div>
              <h3 className="text-white/90 font-medium mb-1">Why does my resume get no responses?</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                The most common reason resumes get no responses is ATS filtering — your resume is either failing to parse due to formatting issues, or it lacks the specific keywords from the job description. A formatting check rules out the first cause. If formatting is clean, the issue is likely keyword gaps between your resume and the roles you're applying to.
              </p>
            </div>
          </div>

        </div>
      </Layout>
    </>
  )
}
