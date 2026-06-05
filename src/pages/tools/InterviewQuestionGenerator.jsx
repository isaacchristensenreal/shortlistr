import { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { Copy, Check, ExternalLink } from 'lucide-react'
import Layout from '../../components/layout/Layout'

const SYSTEM_PROMPT =
  "Generate interview questions for this role. Return ONLY valid JSON: { questions: [ { number: number, question: string, type: 'Behavioral'|'Technical'|'Situational'|'Culture fit', testing_for: string (under 12 words) }, ... ] } — exactly 10 questions: 4 behavioral, 3 technical, 2 situational, 1 culture fit. Base them directly on the JD content, not generic questions."

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I prepare for a job-specific interview?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The most effective approach is to read the job description carefully and identify the core requirements, then prepare specific examples from your past work that demonstrate each one. For behavioral questions, use the STAR format — Situation, Task, Action, Result. For technical questions, review the tools and technologies listed. For situational questions, think through how your values and judgment would apply to realistic scenarios in that role.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the STAR method for interview answers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'STAR stands for Situation, Task, Action, Result. It is a framework for answering behavioral interview questions. Situation: briefly describe the context. Task: explain what you were responsible for. Action: describe the specific steps you took. Result: share the outcome, ideally with a measurable number. The result is the most important part — interviewers want evidence of impact, not just effort.',
      },
    },
  ],
}

const TABS = ['All', 'Behavioral', 'Technical', 'Situational', 'Culture fit']

const TYPE_CHIP = {
  'Behavioral':   'bg-electric-500/10 text-electric-400 border-electric-500/20',
  'Technical':    'bg-neon-400/10 text-neon-400 border-neon-400/20',
  'Situational':  'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Culture fit':  'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

function djb2Hash(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(h, 33) ^ str.charCodeAt(i)) >>> 0
  }
  return h.toString(36)
}

export default function InterviewQuestionGenerator() {
  const [jd, setJd] = useState('')
  const [level, setLevel] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('All')
  const [copied, setCopied] = useState(false)

  const visibleQuestions = useMemo(() => {
    if (!result?.questions) return []
    if (activeTab === 'All') return result.questions
    return result.questions.filter(q => q.type === activeTab)
  }, [result, activeTab])

  async function handleGenerate() {
    const trimJd = jd.trim()
    const trimLevel = level.trim()
    if (!trimJd) return

    const cacheKey = `iq_gen_v1_${djb2Hash(trimJd + '\x00' + trimLevel)}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      try {
        setResult(JSON.parse(cached))
        setActiveTab('All')
        setError(null)
        return
      } catch {
        localStorage.removeItem(cacheKey)
      }
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setActiveTab('All')

    const userContent = [
      trimLevel && `Experience level: ${trimLevel.slice(0, 60)}`,
      `Job description:\n${trimJd.slice(0, 2500)}`,
    ].filter(Boolean).join('\n\n')

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.3,
          max_tokens: 900,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userContent },
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

  function handleCopyAll() {
    if (!result?.questions) return
    const text = result.questions
      .map(q => `${q.number}. ${q.question}`)
      .join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const overLimit = jd.length > 2700

  return (
    <>
      <Helmet>
        <title>Interview Question Generator from Job Description — Free Tool</title>
        <meta
          name="description"
          content="Paste a job posting and get the 10 most likely interview questions by type, with what each question is actually testing for. Free, no signup."
        />
        <link rel="canonical" href="https://www.shortlistr.us/tools/interview-question-generator" />
        <meta property="og:title" content="Interview Question Generator from Job Description — Free Tool" />
        <meta
          property="og:description"
          content="Paste a job posting and get the 10 most likely interview questions by type, with what each question is actually testing for. Free, no signup."
        />
        <meta property="og:url" content="https://www.shortlistr.us/tools/interview-question-generator" />
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
              Interview Question Generator
            </h1>
            <p className="text-white/50 max-w-xl mx-auto text-sm sm:text-base">
              Paste the job description you're interviewing for. Get 10 questions pulled directly from it — behavioral, technical, situational, and culture fit — with what each one is actually testing.
            </p>
          </div>

          {/* ── Editorial content ─────────────────────────────────────── */}
          <div className="space-y-10 mb-14 text-white/65 text-[0.95rem] leading-relaxed">

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">
                Why generic interview prep fails
              </h2>
              <p className="mb-3">
                Most interview prep advice tells you to prepare for "tell me about yourself" and "what's your greatest weakness." Those questions exist, but they're not what gets people cut. What gets people cut is being unprepared for the role-specific questions — the ones pulled directly from the job description, the ones that expose whether you've actually done the work the posting is asking for.
              </p>
              <p>
                A job description is a document written by someone who knows exactly what problems they need solved. Every requirement in it is either something their last person failed at, something the team is currently struggling with, or something the business has identified as critical for the next 12 months. The questions in your interview are almost always variations on: "can you handle these specific things?" Preparing from the JD isn't a hack. It's the obvious approach that most people skip.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">
                How behavioral, technical, and situational questions differ
              </h2>
              <p className="mb-3">
                Behavioral questions (the "tell me about a time when…" format) are asking for evidence that you've done something before. The logic is that past behavior predicts future performance. Your answer should follow the STAR format — Situation, Task, Action, Result — and the result should be specific. "We increased retention by 18%" beats "the project went well."
              </p>
              <p className="mb-3">
                Technical questions are role-specific and either you know the answer or you don't, but interviewers weight honesty and reasoning over bluffing. "I haven't worked with that tool directly, but here's how I'd approach learning it" is a better answer than a confident wrong one.
              </p>
              <p>
                Situational questions ("what would you do if…") are testing your judgment and values, not your experience. There's usually not one right answer — they want to see how you think through trade-offs.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-3">
                How to use this tool effectively
              </h2>
              <p>
                Paste the actual job description, not a summary of it. The more specific the input, the more specific the questions. Run it for the role level you're actually interviewing for — questions for a senior engineer look different than for a mid-level one even at the same company. Use the generated questions as a preparation checklist: for each one, can you give a concrete example from your past work? If not, that's the gap to address before you walk in.
              </p>
            </section>

          </div>

          {/* ── Tool ──────────────────────────────────────────────────── */}
          <div className="border-t border-border-dim pt-12">
            <h2 className="text-white text-xl font-semibold mb-6">Generate interview questions</h2>

            <div className="space-y-4 mb-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white/70">Job Description</label>
                  <span className={`text-xs tabular-nums ${overLimit ? 'text-crimson-400' : 'text-white/30'}`}>
                    {jd.length} / 3000
                  </span>
                </div>
                <textarea
                  className="w-full min-h-[260px] bg-surface border border-border-dim rounded-xl p-4 text-sm text-white/80 placeholder-white/20 resize-none focus:outline-none focus:border-gold/40 transition-colors"
                  placeholder="Paste the full job description here…"
                  value={jd}
                  maxLength={3000}
                  onChange={e => setJd(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white/70">
                    Experience level{' '}
                    <span className="text-white/30 font-normal">(optional)</span>
                  </label>
                  <span className={`text-xs tabular-nums ${level.length > 54 ? 'text-crimson-400' : 'text-white/30'}`}>
                    {level.length} / 60
                  </span>
                </div>
                <input
                  type="text"
                  className="w-full bg-surface border border-border-dim rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-gold/40 transition-colors"
                  placeholder="e.g. Senior, mid-level, entry-level, 5 years experience"
                  value={level}
                  maxLength={60}
                  onChange={e => setLevel(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                />
              </div>
            </div>

            <div className="flex justify-center mb-10">
              <button
                onClick={handleGenerate}
                disabled={loading || !jd.trim()}
                className="px-8 py-3.5 rounded-xl font-semibold text-midnight bg-gold hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-gold text-sm"
              >
                {loading ? 'Generating…' : 'Generate Questions'}
              </button>
            </div>

            {error && (
              <div className="mb-8 rounded-xl border border-crimson/30 bg-crimson/10 px-5 py-4 text-crimson-400 text-sm text-center">
                {error}
              </div>
            )}

            {result?.questions && (
              <div className="animate-fadeUp space-y-5">
                {/* Controls row */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  {/* Filter tabs */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {TABS.map(tab => {
                      const count = tab === 'All'
                        ? result.questions.length
                        : result.questions.filter(q => q.type === tab).length
                      return (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                            activeTab === tab
                              ? 'bg-gold/15 text-gold border border-gold/30'
                              : 'bg-surface border border-border-dim text-white/40 hover:text-white/70'
                          }`}
                        >
                          {tab}
                          {count > 0 && (
                            <span className="ml-1.5 opacity-60">{count}</span>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Copy all */}
                  <button
                    onClick={handleCopyAll}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface border border-border-dim text-white/50 hover:text-white hover:border-border-glow transition-all duration-150 shrink-0"
                  >
                    {copied ? <Check size={12} className="text-neon-400" /> : <Copy size={12} />}
                    {copied ? 'Copied!' : 'Copy all questions'}
                  </button>
                </div>

                {/* Question cards */}
                <div className="space-y-3">
                  {visibleQuestions.map(q => (
                    <QuestionCard key={q.number} q={q} />
                  ))}
                  {visibleQuestions.length === 0 && (
                    <p className="text-white/30 text-sm text-center py-4">
                      No {activeTab} questions generated.
                    </p>
                  )}
                </div>

                {/* CTA */}
                <div className="rounded-2xl border border-gold/20 bg-gold/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between mt-2">
                  <p className="text-white/80 text-sm leading-relaxed">
                    <span className="text-white font-semibold">Before the interview, make sure your resume reflects these skills.</span>{' '}
                    Shortlistr tailors it per-job in one click.
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
              <h3 className="text-white/90 font-medium mb-1">How do I prepare for a job-specific interview?</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Read the job description carefully and identify the core requirements, then prepare specific examples from your past work that demonstrate each one. For behavioral questions, use the STAR format — Situation, Task, Action, Result. For technical questions, review the tools and technologies listed. For situational questions, think through how your judgment would apply to realistic scenarios in that role.
              </p>
            </div>
            <div>
              <h3 className="text-white/90 font-medium mb-1">What is the STAR method for interview answers?</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                STAR stands for Situation, Task, Action, Result. Situation: briefly describe the context. Task: explain what you were responsible for. Action: describe the specific steps you took. Result: share the outcome, ideally with a measurable number. The result is the most important part — interviewers want evidence of impact, not just effort.
              </p>
            </div>
          </div>

        </div>
      </Layout>
    </>
  )
}

function QuestionCard({ q }) {
  const [copied, setCopied] = useState(false)
  const chipClass = TYPE_CHIP[q.type] ?? 'bg-white/5 text-white/60 border-white/10'

  function handleCopy() {
    navigator.clipboard.writeText(q.question).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="bg-surface rounded-xl p-5 border border-border-dim">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-white/25 tabular-nums">#{q.number}</span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${chipClass}`}>
            {q.type}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-50 border border-border-dim text-white/50 hover:text-white hover:border-border-glow transition-all duration-150 shrink-0"
        >
          {copied ? <Check size={12} className="text-neon-400" /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="text-white text-[0.95rem] font-medium leading-relaxed mb-2">{q.question}</p>
      {q.testing_for && (
        <p className="text-xs text-white/35">
          <span className="text-white/25">Testing for: </span>{q.testing_for}
        </p>
      )}
    </div>
  )
}
