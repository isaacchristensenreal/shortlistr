import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { ExternalLink } from 'lucide-react'
import Layout from '../../components/layout/Layout'

const SYSTEM_PROMPT =
  'You are an ATS scoring engine. Return ONLY valid JSON with these keys: score (number 0-100), matched_keywords (array of up to 6 strings), missing_keywords (array of up to 6 strings), verdict (string under 15 words). No markdown, no explanation outside the JSON.'

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is an ATS score?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'An ATS score is a number between 0 and 100 that an Applicant Tracking System assigns to your resume when you apply for a job. It measures how well your resume matches the specific job description using keyword matching and other signals. Resumes below a threshold score — often 60 to 75 — are filtered out before a human recruiter ever reads them.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I improve my ATS score?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'To improve your ATS score, mirror the exact language from the job description in your resume. Add missing keywords from the required qualifications section, write them into real bullet points rather than stuffing them in. Use a single-column, text-only format to avoid parsing errors. Then re-check your score to confirm the gap is closed.',
      },
    },
  ],
}

function simpleHash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return h.toString(36)
}

function getCacheKey(resume, jd) {
  return `ats_score_v1_${simpleHash(resume + '\x00' + jd)}`
}

export default function AtsScoreChecker() {
  const [resume, setResume] = useState('')
  const [jd, setJd] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleCheck() {
    const trimmedResume = resume.trim()
    const trimmedJd = jd.trim()
    if (!trimmedResume || !trimmedJd) return

    const cacheKey = getCacheKey(trimmedResume, trimmedJd)
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
          temperature: 0,
          max_tokens: 256,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: `RESUME:\n${trimmedResume.slice(0, 2000)}\n\nJOB DESCRIPTION:\n${trimmedJd.slice(0, 1500)}`,
            },
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

  const scoreColor =
    result == null
      ? ''
      : result.score >= 75
      ? 'text-neon-400'
      : result.score >= 50
      ? 'text-amber-400'
      : 'text-crimson-400'

  return (
    <>
      <Helmet>
        <title>Free ATS Score Checker — See How Your Resume Ranks</title>
        <meta
          name="description"
          content="Paste your resume and job description. Get an instant ATS match score, missing keywords, and a plain-English verdict. Free, no signup."
        />
        <link rel="canonical" href="https://www.shortlistr.us/tools/ats-score-checker" />
        <meta property="og:title" content="Free ATS Score Checker — See How Your Resume Ranks" />
        <meta
          property="og:description"
          content="Paste your resume and job description. Get an instant ATS match score, missing keywords, and a plain-English verdict. Free, no signup."
        />
        <meta property="og:url" content="https://www.shortlistr.us/tools/ats-score-checker" />
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
      </Helmet>

      <Layout>
        <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gold/10 text-gold border border-gold/20 mb-4 tracking-wider uppercase">
              Free Tool
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              ATS Score Checker
            </h1>
            <p className="text-white/50 max-w-xl mx-auto text-sm sm:text-base">
              Paste your resume and a job description to get an instant ATS match score, matched and missing keywords, and a plain-English verdict.
            </p>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <TextareaField
              label="Your Resume"
              placeholder="Paste your resume text here…"
              value={resume}
              onChange={setResume}
            />
            <TextareaField
              label="Job Description"
              placeholder="Paste the job description here…"
              value={jd}
              onChange={setJd}
            />
          </div>

          {/* CTA button */}
          <div className="flex justify-center mb-10">
            <button
              onClick={handleCheck}
              disabled={loading || !resume.trim() || !jd.trim()}
              className="px-8 py-3.5 rounded-xl font-semibold text-midnight bg-gold hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-gold text-sm"
            >
              {loading ? 'Checking…' : 'Check ATS Score'}
            </button>
          </div>

          {/* Error state */}
          {error && (
            <div className="mb-8 rounded-xl border border-crimson/30 bg-crimson/10 px-5 py-4 text-crimson-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="animate-fadeUp space-y-6">
              {/* Score + verdict */}
              <div className="flex flex-col items-center">
                <div
                  className={`text-[5.5rem] sm:text-[7rem] font-black tabular-nums leading-none ${scoreColor}`}
                >
                  {result.score}
                </div>
                <div className="text-white/40 text-sm mt-1 mb-3">ATS Match Score</div>
                {result.verdict && (
                  <p className="text-white/70 text-base text-center max-w-md">{result.verdict}</p>
                )}
              </div>

              {/* Keyword chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <KeywordCard
                  title="Matched Keywords"
                  keywords={result.matched_keywords}
                  colorClass="text-neon-400"
                  dotClass="bg-neon-400"
                  chipClass="bg-neon-400/10 text-neon-400 border-neon-400/20"
                />
                <KeywordCard
                  title="Missing Keywords"
                  keywords={result.missing_keywords}
                  colorClass="text-crimson-400"
                  dotClass="bg-crimson-400"
                  chipClass="bg-crimson-400/10 text-crimson-400 border-crimson-400/20"
                />
              </div>

              {/* CTA card */}
              <div className="rounded-2xl border border-gold/20 bg-gold/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                <div>
                  <p className="text-white font-semibold mb-1">
                    Shortlistr auto-optimizes your resume for every application.
                  </p>
                  <p className="text-white/50 text-sm">
                    Fix those missing keywords automatically and land more interviews.
                  </p>
                </div>
                <a
                  href="https://shortlistr.us"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-midnight bg-gold hover:bg-gold-400 transition-all duration-200 shadow-gold whitespace-nowrap"
                >
                  Free trial at shortlistr.us
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}

          {/* FAQ (visible always for SEO crawlers) */}
          <div className="mt-20 space-y-6 border-t border-border-dim pt-12">
            <h2 className="text-xl font-semibold text-white">Frequently Asked Questions</h2>
            <FaqItem
              q="What is an ATS score?"
              a="An ATS score is a number between 0 and 100 that an Applicant Tracking System assigns to your resume when you apply. It measures how well your resume matches the job description. Resumes below a threshold — often 60–75 — are filtered out before a recruiter reads them."
            />
            <FaqItem
              q="How do I improve my ATS score?"
              a="Mirror the exact language from the job description in your resume. Add missing keywords into real bullet points that describe your experience. Use a single-column, text-only format to avoid parsing errors. Then re-check your score to confirm the gap is closed."
            />
          </div>
        </div>
      </Layout>
    </>
  )
}

function TextareaField({ label, placeholder, value, onChange }) {
  const overLimit = value.length > 2800
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white/70">{label}</label>
        <span className={`text-xs tabular-nums ${overLimit ? 'text-crimson-400' : 'text-white/30'}`}>
          {value.length} / 3000
        </span>
      </div>
      <textarea
        className="min-h-[320px] bg-surface border border-border-dim rounded-xl p-4 text-sm text-white/80 placeholder-white/20 resize-none focus:outline-none focus:border-gold/40 transition-colors"
        placeholder={placeholder}
        value={value}
        maxLength={3000}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

function KeywordCard({ title, keywords, colorClass, dotClass, chipClass }) {
  return (
    <div className="bg-surface rounded-xl p-5 border border-border-dim">
      <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${colorClass}`}>
        <span className={`w-2 h-2 rounded-full inline-block ${dotClass}`} />
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {keywords?.length > 0 ? (
          keywords.map(kw => (
            <span
              key={kw}
              className={`px-3 py-1 rounded-full text-xs font-medium border ${chipClass}`}
            >
              {kw}
            </span>
          ))
        ) : (
          <span className="text-white/30 text-xs">None found</span>
        )}
      </div>
    </div>
  )
}

function FaqItem({ q, a }) {
  return (
    <div>
      <h3 className="text-white/90 font-medium mb-1">{q}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{a}</p>
    </div>
  )
}
