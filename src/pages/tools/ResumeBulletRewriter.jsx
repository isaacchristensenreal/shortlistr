import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Copy, Check, ExternalLink } from 'lucide-react'
import Layout from '../../components/layout/Layout'

const SYSTEM_PROMPT =
  'Rewrite this resume bullet for ATS and impact. Return ONLY valid JSON: { rewrites: [ { text: string, action_verb: string, improvement: string (under 10 words) }, ... ] } — exactly 3 rewrites, each bullet under 20 words, start with a strong action verb, include [X%] placeholder if no metric in original.'

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

export default function ResumeBulletRewriter() {
  const [bullet, setBullet] = useState('')
  const [role, setRole] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleRewrite() {
    const trimmedBullet = bullet.trim()
    const trimmedRole = role.trim()
    if (!trimmedBullet) return

    const cacheKey = `bullet_rw_v1_${simpleHash(trimmedBullet + '\x00' + trimmedRole)}`
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

    const userContent = trimmedRole
      ? `Target role: ${trimmedRole.slice(0, 100)}\n\nBullet: ${trimmedBullet.slice(0, 200)}`
      : `Bullet: ${trimmedBullet.slice(0, 200)}`

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.4,
          max_tokens: 400,
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

  return (
    <>
      <Helmet>
        <title>Free Resume Bullet Point Rewriter — Stronger Bullets in Seconds</title>
        <meta
          name="description"
          content="Paste a weak resume bullet and get 3 rewritten versions with strong action verbs and ATS-friendly phrasing. Free, instant, no signup."
        />
        <link rel="canonical" href="https://www.shortlistr.us/tools/resume-bullet-rewriter" />
        <meta property="og:title" content="Free Resume Bullet Point Rewriter — Stronger Bullets in Seconds" />
        <meta
          property="og:description"
          content="Paste a weak resume bullet and get 3 rewritten versions with strong action verbs and ATS-friendly phrasing. Free, instant, no signup."
        />
        <meta property="og:url" content="https://www.shortlistr.us/tools/resume-bullet-rewriter" />
      </Helmet>

      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gold/10 text-gold border border-gold/20 mb-4 tracking-wider uppercase">
              Free Tool
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Resume Bullet Rewriter
            </h1>
            <p className="text-white/50 max-w-md mx-auto text-sm sm:text-base">
              Paste a weak bullet and get 3 stronger rewrites — with action verbs, metrics, and ATS-friendly phrasing.
            </p>
          </div>

          {/* Inputs */}
          <div className="space-y-4 mb-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white/70">Resume Bullet</label>
                <span className={`text-xs tabular-nums ${bullet.length > 180 ? 'text-crimson-400' : 'text-white/30'}`}>
                  {bullet.length} / 200
                </span>
              </div>
              <textarea
                className="w-full min-h-[100px] bg-surface border border-border-dim rounded-xl p-4 text-sm text-white/80 placeholder-white/20 resize-none focus:outline-none focus:border-gold/40 transition-colors"
                placeholder="e.g. Helped with marketing campaigns and social media"
                value={bullet}
                maxLength={200}
                onChange={e => setBullet(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white/70">
                  Target Role <span className="text-white/30 font-normal">(optional)</span>
                </label>
                <span className={`text-xs tabular-nums ${role.length > 90 ? 'text-crimson-400' : 'text-white/30'}`}>
                  {role.length} / 100
                </span>
              </div>
              <input
                type="text"
                className="w-full bg-surface border border-border-dim rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-gold/40 transition-colors"
                placeholder="e.g. Senior Marketing Manager"
                value={role}
                maxLength={100}
                onChange={e => setRole(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRewrite()}
              />
            </div>
          </div>

          {/* Button */}
          <div className="flex justify-center mb-10">
            <button
              onClick={handleRewrite}
              disabled={loading || !bullet.trim()}
              className="px-8 py-3.5 rounded-xl font-semibold text-midnight bg-gold hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-gold text-sm"
            >
              {loading ? 'Rewriting…' : 'Rewrite Bullet'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-8 rounded-xl border border-crimson/30 bg-crimson/10 px-5 py-4 text-crimson-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Results */}
          {result?.rewrites && (
            <div className="animate-fadeUp space-y-4">
              {result.rewrites.map((rw, i) => (
                <RewriteCard key={i} index={i + 1} rewrite={rw} />
              ))}

              {/* CTA */}
              <div className="rounded-2xl border border-gold/20 bg-gold/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between mt-2">
                <p className="text-white/80 text-sm leading-relaxed">
                  <span className="text-white font-semibold">Your whole resume, rewritten for every job</span>{' '}
                  in one click.
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

function RewriteCard({ index, rewrite }) {
  const { text, action_verb, improvement } = rewrite

  // Bold the action verb at the start of the bullet text
  const verbIndex = text.toLowerCase().indexOf(action_verb?.toLowerCase())
  let beforeVerb = ''
  let verbText = action_verb
  let afterVerb = text
  if (verbIndex === 0 && action_verb) {
    verbText = text.slice(0, action_verb.length)
    afterVerb = text.slice(action_verb.length)
  }

  return (
    <div className="bg-surface rounded-xl p-5 border border-border-dim">
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs font-semibold text-white/25 tabular-nums mt-0.5">#{index}</span>
        <CopyButton text={text} />
      </div>

      <p className="text-white text-base font-medium leading-relaxed mb-3">
        {verbIndex === 0 && action_verb ? (
          <>
            <span className="text-gold font-bold">{verbText}</span>
            {afterVerb}
          </>
        ) : (
          text
        )}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {action_verb && (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gold/10 text-gold border border-gold/20">
            {action_verb}
          </span>
        )}
        {improvement && (
          <span className="text-xs text-white/35">{improvement}</span>
        )}
      </div>
    </div>
  )
}
