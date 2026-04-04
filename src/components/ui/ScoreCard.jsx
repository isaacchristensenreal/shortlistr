/**
 * ScoreCard.jsx
 * Before/After ATS Score Card — LinkedIn optimal 1080×566px
 * Self-contained: card + PNG export + LinkedIn share prompt
 */
import { forwardRef, useRef, useState } from 'react'
import html2canvas from 'html2canvas'

/* ─── constants ─────────────────────────────────────────────── */
const GOLD   = '#C9A84C'
const DARK   = '#0d0d0d'
const CARD_W = 1080
const CARD_H = 566

/* ─── SVG score ring ─────────────────────────────────────────── */
function Ring({ score, color, label }) {
  const R   = 82
  const SW  = 13
  const SZ  = (R + SW) * 2 + 4          // viewBox size with padding
  const cx  = SZ / 2
  const cy  = SZ / 2
  const circ = 2 * Math.PI * R
  const arc  = Math.min(score / 100, 1) * circ

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ position: 'relative', width: SZ, height: SZ }}>
        <svg width={SZ} height={SZ} viewBox={`0 0 ${SZ} ${SZ}`}>
          {/* Track */}
          <circle
            cx={cx} cy={cy} r={R}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={SW}
          />
          {/* Arc — rotated so it starts at 12 o'clock */}
          <circle
            cx={cx} cy={cy} r={R}
            fill="none"
            stroke={color}
            strokeWidth={SW}
            strokeLinecap="round"
            strokeDasharray={`${arc} ${circ - arc}`}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
          />
        </svg>

        {/* Score text centred inside ring */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 0,
        }}>
          <span style={{
            fontSize: 54, fontWeight: 900, lineHeight: 1,
            color, fontFamily: 'inherit',
          }}>{score}</span>
          <span style={{
            fontSize: 20, fontWeight: 700, lineHeight: 1,
            color, fontFamily: 'inherit', opacity: 0.8,
          }}>%</span>
        </div>
      </div>

      {/* Label below ring */}
      <span style={{
        fontSize: 11, fontWeight: 800, letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.45)',
        fontFamily: 'inherit',
      }}>{label}</span>
    </div>
  )
}

/* ─── The 1080×566 card ──────────────────────────────────────── */
export const ScoreCard = forwardRef(function ScoreCard(
  { beforeScore, afterScore, keywordsAdded, bulletsRewritten },
  ref,
) {
  const diff = afterScore - beforeScore

  const stats = [
    { value: String(keywordsAdded), sub: 'Keywords Added' },
    { value: String(bulletsRewritten), sub: 'Bullets Rewritten' },
    { value: 'ATS Ready', sub: '✓ Optimized' },
  ]

  return (
    <div
      ref={ref}
      style={{
        width: CARD_W,
        height: CARD_H,
        background: DARK,
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        padding: '44px 68px',
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* ── subtle grid dots ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0)',
        backgroundSize: '32px 32px',
      }} />

      {/* ── top glow ── */}
      <div style={{
        position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 280,
        background: `radial-gradient(ellipse, ${GOLD}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* ── Header row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36, position: 'relative' }}>
        {/* Logo mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Inline logo (matches Logo.jsx) */}
          <div style={{
            width: 36, height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #6366f1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="14" height="18" rx="2" fill="white" fillOpacity="0.2" stroke="white" strokeOpacity="0.5" strokeWidth="1.2" />
              <rect x="5" y="7"  width="8" height="1.5" rx="0.75" fill="white" fillOpacity="0.85" />
              <rect x="5" y="11" width="5" height="1.5" rx="0.75" fill="white" fillOpacity="0.65" />
              <rect x="5" y="15" width="7" height="1.5" rx="0.75" fill="white" fillOpacity="0.55" />
              <path d="M18 2L13 12H17L12 22L23 10H19L18 2Z" fill="white" />
            </svg>
          </div>
          <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', fontFamily: 'inherit' }}>
            Short<span style={{ color: GOLD }}>Listr</span>
          </span>
        </div>

        {/* Badge */}
        <div style={{
          padding: '7px 18px', borderRadius: 100,
          background: `${GOLD}12`,
          border: `1px solid ${GOLD}30`,
          fontSize: 11, fontWeight: 700,
          letterSpacing: '0.16em', textTransform: 'uppercase',
          color: GOLD, fontFamily: 'inherit',
        }}>
          ATS Score Report
        </div>
      </div>

      {/* ── Score circles ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 0, position: 'relative',
      }}>
        <Ring score={beforeScore} color="#FF4444" label="Before" />

        {/* Divider */}
        <div style={{ margin: '0 56px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 1, height: 72, background: `linear-gradient(to bottom, transparent, ${GOLD}, transparent)` }} />
          {/* Improvement badge */}
          <div style={{
            padding: '8px 18px', borderRadius: 100,
            background: `${GOLD}12`, border: `1px solid ${GOLD}28`,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: GOLD, lineHeight: 1, fontFamily: 'inherit' }}>
              +{diff}
            </span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: `${GOLD}90`, fontFamily: 'inherit' }}>
              pts gained
            </span>
          </div>
          <div style={{ width: 1, height: 72, background: `linear-gradient(to bottom, transparent, ${GOLD}, transparent)` }} />
        </div>

        <Ring score={afterScore} color="#00FF88" label="After" />
      </div>

      {/* ── Gold rule ── */}
      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}40, ${GOLD}80, ${GOLD}40, transparent)`, margin: '20px 0 24px' }} />

      {/* ── Stats row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && (
              <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.1)', margin: '0 48px' }} />
            )}
            <div style={{ textAlign: 'center' }}>
              <span style={{
                display: 'block',
                fontSize: i === 2 ? 20 : 26, fontWeight: 900,
                color: i === 2 ? '#00FF88' : '#fff',
                lineHeight: 1.1, fontFamily: 'inherit',
              }}>{s.value}</span>
              <span style={{
                display: 'block',
                fontSize: 10, fontWeight: 700,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: i === 2 ? '#00FF8890' : 'rgba(255,255,255,0.38)',
                marginTop: 4, fontFamily: 'inherit',
              }}>{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Watermark ── */}
      <div style={{
        position: 'absolute', bottom: 22, right: 52,
        fontSize: 11, fontWeight: 500, letterSpacing: '0.06em',
        color: 'rgba(255,255,255,0.18)', fontFamily: 'inherit',
      }}>
        shortlistr.us
      </div>
    </div>
  )
})

/* ─── LinkedIn share modal ───────────────────────────────────── */
function SharePrompt({ beforeScore, afterScore, onClose }) {
  const [copied, setCopied] = useState(false)
  const caption = `Just ran my resume through an ATS scanner and the results were wild.\n\nWent from ${beforeScore}% to ${afterScore}% match score after optimizing with @ShortListr. If you're job hunting and not checking your ATS score, you're invisible to recruiters.\n\nshortlistr.us`

  const handleCopy = () => {
    navigator.clipboard.writeText(caption)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div style={{
        position: 'relative', width: '100%', maxWidth: 520,
        background: '#13131A', borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '32px 28px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.35)', padding: 4,
          }}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* LinkedIn logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: '#0A66C2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" fill="white" viewBox="0 0 24 24" aria-label="LinkedIn">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1 }}>Share on LinkedIn</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>Copy the caption below, then post your downloaded image</p>
          </div>
        </div>

        {/* Caption preview */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, padding: '14px 16px', marginBottom: 14,
          fontSize: 13, lineHeight: 1.65,
          color: 'rgba(255,255,255,0.7)',
          whiteSpace: 'pre-line',
          fontFamily: 'inherit',
        }}>
          {caption}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          style={{
            width: '100%', padding: '13px 0', borderRadius: 12,
            background: copied ? 'rgba(0,255,136,0.12)' : `${GOLD}15`,
            border: `1px solid ${copied ? 'rgba(0,255,136,0.3)' : `${GOLD}35`}`,
            color: copied ? '#00FF88' : GOLD,
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: 'inherit',
          }}
        >
          {copied ? (
            <>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Caption
            </>
          )}
        </button>
      </div>
    </div>
  )
}

/* ─── Main modal (preview + download + share) ────────────────── */
export function ScoreCardModal({ beforeScore, afterScore, keywordsAdded, bulletsRewritten, onClose }) {
  const captureRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const [showShare, setShowShare] = useState(false)

  const handleDownload = async () => {
    if (!captureRef.current || downloading) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: DARK,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = 'shortlistr-scorecard.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
      setTimeout(() => setShowShare(true), 400)
    } catch (err) {
      console.error('ScoreCard export failed:', err)
    } finally {
      setDownloading(false)
    }
  }

  // Scale for the preview (modal max content width is ~900px, card is 1080px)
  const PREVIEW_SCALE = 0.74

  return (
    <>
      {/* Modal backdrop */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        />
        <div style={{
          position: 'relative', width: '100%', maxWidth: 860,
          background: '#0d0d0d',
          borderRadius: 24,
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0 }}>Your Score Card</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '2px 0 0' }}>1080 × 566 px — LinkedIn optimal</p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4 }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ── Scaled preview ── */}
          <div style={{
            padding: '24px 24px 0',
            display: 'flex', justifyContent: 'center',
          }}>
            {/* Container shrinks to the scaled dimensions so the card looks inset */}
            <div style={{
              width: CARD_W * PREVIEW_SCALE,
              height: CARD_H * PREVIEW_SCALE,
              overflow: 'hidden',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.08)',
              flexShrink: 0,
            }}>
              <div style={{
                transform: `scale(${PREVIEW_SCALE})`,
                transformOrigin: 'top left',
                width: CARD_W,
                height: CARD_H,
              }}>
                <ScoreCard
                  beforeScore={beforeScore}
                  afterScore={afterScore}
                  keywordsAdded={keywordsAdded}
                  bulletsRewritten={bulletsRewritten}
                />
              </div>
            </div>
          </div>

          {/* Hidden full-size card that html2canvas actually captures */}
          <div style={{ position: 'absolute', top: -9999, left: -9999, pointerEvents: 'none' }}>
            <ScoreCard
              ref={captureRef}
              beforeScore={beforeScore}
              afterScore={afterScore}
              keywordsAdded={keywordsAdded}
              bulletsRewritten={bulletsRewritten}
            />
          </div>

          {/* Actions */}
          <div style={{ padding: '20px 24px', display: 'flex', gap: 10 }}>
            {/* Download PNG */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{
                flex: 1, padding: '14px 0', borderRadius: 14,
                background: downloading ? 'rgba(201,168,76,0.15)' : 'linear-gradient(135deg, #C9A84C, #a87d2e)',
                border: 'none', cursor: downloading ? 'default' : 'pointer',
                color: downloading ? GOLD : '#0d0d0d',
                fontWeight: 800, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'opacity 0.2s',
                opacity: downloading ? 0.7 : 1,
              }}
            >
              {downloading ? (
                <>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: `2px solid ${GOLD}40`,
                    borderTop: `2px solid ${GOLD}`,
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Generating…
                </>
              ) : (
                <>
                  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Score Card
                </>
              )}
            </button>

            {/* Share on LinkedIn */}
            <button
              onClick={() => setShowShare(true)}
              style={{
                padding: '14px 20px', borderRadius: 14,
                background: 'rgba(10,102,194,0.12)',
                border: '1px solid rgba(10,102,194,0.3)',
                cursor: 'pointer',
                color: '#5aabff',
                fontWeight: 700, fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 8,
                whiteSpace: 'nowrap',
              }}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-label="LinkedIn">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Share Caption
            </button>
          </div>
        </div>
      </div>

      {/* Share prompt (layered on top) */}
      {showShare && (
        <SharePrompt
          beforeScore={beforeScore}
          afterScore={afterScore}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* Spin animation for the download spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
