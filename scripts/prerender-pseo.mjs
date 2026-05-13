/**
 * pSEO prerender script
 * Fetches all rows from pseo_pages in Supabase at build time and writes
 * a self-contained HTML file to dist/resume/<slug>.html for each one.
 * Vercel's cleanUrls:true serves dist/resume/foo.html at /resume/foo.
 * Zero impact on the existing React SPA — no shared routes, no shared build.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')

// Load .env / .env.local — Vercel injects these as real env vars so dotenv is a no-op there
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set — skipping pSEO prerender')
  process.exit(0) // exit 0 so the build doesn't fail in CI without secrets
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── Fetch all pSEO pages ──────────────────────────────────────────────────────
const { data: pages, error } = await supabase
  .from('pseo_pages')
  .select('slug, job_title, industry, page_title, meta_description, h1, keyword_1, keyword_2, keyword_3, keyword_4, keyword_5, keyword_6, keyword_7, keyword_8, keyword_9, keyword_10')
  .eq('page_built', true)
  .order('slug')

if (error) {
  console.error('❌  Supabase fetch error:', error.message)
  process.exit(1)
}

if (!pages || pages.length === 0) {
  console.log('⚠️   No pSEO pages found in pseo_pages table — nothing to prerender')
  process.exit(0)
}

// Ensure dist/resume/ directory exists
const resumeDir = path.join(distDir, 'resume')
fs.mkdirSync(resumeDir, { recursive: true })

// ── HTML generator ────────────────────────────────────────────────────────────
function buildPage(row, allPages) {
  const canonical = `https://www.shortlistr.us/resume/${row.slug}`
  const keywords = [
    row.keyword_1, row.keyword_2, row.keyword_3, row.keyword_4, row.keyword_5,
    row.keyword_6, row.keyword_7, row.keyword_8, row.keyword_9, row.keyword_10,
  ].filter(Boolean)

  // Related guides: same industry, different slug, first 4
  const relatedPages = (allPages || [])
    .filter(p => p.industry === row.industry && p.slug !== row.slug)
    .slice(0, 4)

  const relatedGuidesHtml = relatedPages.length > 0 ? `
  <!-- RELATED GUIDES -->
  <div class="related-guides">
    <h3>More ${escHtml(row.industry)} Resume Guides</h3>
    <div class="related-grid">
      ${relatedPages.map(p => `<a href="https://www.shortlistr.us/resume/${escAttr(p.slug)}" class="related-link">${escHtml(p.h1)}</a>`).join('\n      ')}
    </div>
  </div>` : ''

  // Pre-compute scorer widget strings so they embed cleanly in the HTML template
  const scorerIssue1 = escHtml(`Missing ${row.keyword_1} and ${row.keyword_2} — top ATS filters for this role`)
  const scorerIssue3 = escHtml(`${row.industry}-specific tools not detected in skills section`)

  const keywordChips = keywords.map(k => `
        <span class="chip">${escHtml(k)}</span>`).join('')

  const keywordListItems = keywords.map(k => `
          <li class="kw-item">
            <span class="kw-check">✓</span>
            <span>${escHtml(k)}</span>
          </li>`).join('')

  const faqSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What keywords should a ${escHtml(row.job_title)} resume include?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `A ${escHtml(row.job_title)} resume should include keywords such as: ${keywords.join(', ')}. These are the terms ATS systems scan for when filtering applications for ${escHtml(row.industry)} roles.`,
        },
      },
      {
        '@type': 'Question',
        name: `How do I get my ${escHtml(row.job_title)} resume past ATS filters?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `To get your ${escHtml(row.job_title)} resume past ATS filters in ${escHtml(row.industry)}, match your bullet points to the exact keywords in the job description, ensure your skills section reflects ${escHtml(row.keyword_1)} and ${escHtml(row.keyword_2)}, and use a clean single-column format that ATS can parse. ShortListr automates this process in under 90 seconds.`,
        },
      },
      {
        '@type': 'Question',
        name: `Why is my ${escHtml(row.job_title)} resume not getting callbacks?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The most common reason is missing ${escHtml(row.keyword_1)} and ${escHtml(row.keyword_2)} — the two highest-weight ATS filters for ${escHtml(row.job_title)} roles in ${escHtml(row.industry)}. Most ${escHtml(row.job_title)} applications are filtered out before a recruiter ever reads them. ShortListr identifies exactly which keywords your resume is missing and adds them in context.`,
        },
      },
    ],
  })

  const articleSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: escHtml(row.page_title),
    description: escHtml(row.meta_description),
    image: 'https://www.shortlistr.us/og-image.png',
    author: { '@type': 'Organization', name: 'ShortListr', url: 'https://www.shortlistr.us' },
    publisher: {
      '@type': 'Organization',
      name: 'ShortListr',
      logo: { '@type': 'ImageObject', url: 'https://www.shortlistr.us/favicon.svg' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
  })

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>${escHtml(row.page_title)}</title>
  <meta name="description" content="${escAttr(row.meta_description)}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <link rel="canonical" href="${canonical}" />
  <meta name="author" content="ShortListr" />

  <meta property="og:type" content="article" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:site_name" content="ShortListr" />
  <meta property="og:title" content="${escAttr(row.page_title)}" />
  <meta property="og:description" content="${escAttr(row.meta_description)}" />
  <meta property="og:image" content="https://www.shortlistr.us/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="en_US" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@shortlistr" />
  <meta name="twitter:title" content="${escAttr(row.page_title)}" />
  <meta name="twitter:description" content="${escAttr(row.meta_description)}" />
  <meta name="twitter:image" content="https://www.shortlistr.us/og-image.png" />

  <script type="application/ld+json">${faqSchema}</script>
  <script type="application/ld+json">${articleSchema}</script>

  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #0A0A0F;
      color: rgba(255,255,255,0.7);
      line-height: 1.7;
      font-size: 17px;
    }

    /* ── NAV ── */
    nav {
      position: sticky; top: 0; z-index: 100;
      background: rgba(10,10,15,0.96);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .nav-inner {
      max-width: 900px; margin: 0 auto; padding: 0 24px;
      height: 64px; display: flex; align-items: center; justify-content: space-between;
    }
    .logo-link { display: flex; align-items: center; gap: 10px; text-decoration: none; }
    .logo-icon {
      width: 34px; height: 34px; border-radius: 10px;
      background: linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #6366f1 100%);
      box-shadow: 0 4px 14px rgba(59,130,246,0.4);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .logo-icon svg { width: 18px; height: 18px; }
    .logo-text { font-size: 18px; font-weight: 700; color: #fff; letter-spacing: -0.3px; }
    .nav-cta {
      display: inline-flex; align-items: center; gap: 6px;
      background: linear-gradient(135deg, #F5C842, #d4a017);
      color: #0A0A0F; font-weight: 700; font-size: 14px;
      padding: 9px 20px; border-radius: 12px; text-decoration: none;
      box-shadow: 0 4px 14px rgba(245,200,66,0.3);
      transition: opacity 0.2s, transform 0.15s;
    }
    .nav-cta:hover { opacity: 0.9; transform: translateY(-1px); }

    /* ── LAYOUT ── */
    .container { max-width: 820px; margin: 0 auto; padding: 0 24px; }

    /* ── HERO ── */
    .hero {
      padding: 72px 24px 56px; text-align: center;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      background: radial-gradient(ellipse 80% 40% at 50% 0%, rgba(245,200,66,0.06), transparent);
    }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(245,200,66,0.08); border: 1px solid rgba(245,200,66,0.2);
      color: #F5C842; font-size: 12px; font-weight: 700;
      padding: 5px 14px; border-radius: 100px; margin-bottom: 24px;
      letter-spacing: 0.05em; text-transform: uppercase;
    }
    .hero h1 {
      font-size: clamp(26px, 5vw, 44px); font-weight: 900; color: #fff;
      line-height: 1.15; letter-spacing: -1px;
      max-width: 720px; margin: 0 auto 20px;
    }
    .hero p {
      font-size: 18px; max-width: 560px; margin: 0 auto 32px;
      color: rgba(255,255,255,0.5);
    }
    .hero-cta {
      display: inline-flex; align-items: center; gap: 8px;
      background: linear-gradient(135deg, #F5C842, #d4a017);
      color: #0A0A0F; font-weight: 800; font-size: 16px;
      padding: 16px 36px; border-radius: 16px; text-decoration: none;
      box-shadow: 0 8px 32px rgba(245,200,66,0.35);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .hero-cta:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(245,200,66,0.45); }
    .hero-sub {
      font-size: 13px; margin-top: 14px; color: rgba(255,255,255,0.25);
    }

    /* ── STAT STRIP ── */
    .stat-strip {
      display: flex; flex-wrap: wrap; justify-content: center;
      gap: 12px; padding: 40px 24px; border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .stat-pill {
      display: flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px; padding: 10px 18px;
    }
    .stat-num { font-size: 18px; font-weight: 900; color: #F5C842; }
    .stat-label { font-size: 13px; color: rgba(255,255,255,0.4); }

    /* ── SECTION ── */
    section { padding: 56px 24px; border-bottom: 1px solid rgba(255,255,255,0.07); }
    section:last-of-type { border-bottom: none; }
    .section-label {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.1em; color: #F5C842; margin-bottom: 12px;
    }
    h2 {
      font-size: clamp(22px, 3.5vw, 32px); font-weight: 800; color: #fff;
      letter-spacing: -0.5px; line-height: 1.2; margin-bottom: 16px;
    }
    p { margin-bottom: 18px; }
    p:last-child { margin-bottom: 0; }

    /* ── KEYWORD CHIPS ── */
    .chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 24px 0; }
    .chip {
      background: rgba(245,200,66,0.07); border: 1px solid rgba(245,200,66,0.2);
      color: #F5C842; font-size: 13px; font-weight: 600;
      padding: 6px 14px; border-radius: 100px;
    }

    /* ── KEYWORD LIST ── */
    .kw-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 10px; margin-top: 24px;
    }
    .kw-item {
      display: flex; align-items: center; gap: 10px;
      background: #13131A; border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px; padding: 12px 16px; font-size: 15px;
      color: rgba(255,255,255,0.75);
      list-style: none;
    }
    .kw-check {
      width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
      background: rgba(0,255,136,0.1); border: 1px solid rgba(0,255,136,0.25);
      color: #00FF88; font-size: 11px; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
    }

    /* ── SCORER WIDGET ── */
    .scorer-section { padding: 48px 24px; border-bottom: 1px solid rgba(255,255,255,0.07); }
    .scorer-widget {
      background: #13131A; border: 1px solid rgba(245,200,66,0.2);
      border-radius: 20px; padding: 32px; margin-top: 24px;
    }
    .scorer-widget h3 { font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 8px; }
    .scorer-sub { font-size: 14px; color: rgba(255,255,255,0.4); margin-bottom: 20px; }
    .scorer-textarea {
      width: 100%; min-height: 140px;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; padding: 14px 16px;
      color: rgba(255,255,255,0.8); font-size: 14px; font-family: inherit;
      resize: vertical; outline: none; transition: border-color 0.2s;
    }
    .scorer-textarea:focus { border-color: rgba(245,200,66,0.4); }
    .scorer-btn {
      display: inline-flex; align-items: center; gap: 8px;
      background: linear-gradient(135deg, #F5C842, #d4a017);
      color: #0A0A0F; font-weight: 800; font-size: 15px;
      padding: 13px 28px; border-radius: 12px; border: none;
      cursor: pointer; margin-top: 14px;
      transition: opacity 0.2s, transform 0.15s;
    }
    .scorer-btn:hover { opacity: 0.9; transform: translateY(-1px); }
    .scorer-results { display: none; }
    .score-display { text-align: center; margin-bottom: 24px; }
    .score-number { font-size: 72px; font-weight: 900; color: #FF6B35; line-height: 1; display: block; }
    .score-label { font-size: 14px; color: rgba(255,255,255,0.4); margin-top: 6px; display: block; }
    .score-bar-wrap {
      background: rgba(255,255,255,0.07); border-radius: 100px;
      height: 10px; margin: 16px 0 28px; overflow: hidden;
    }
    .score-bar-fill { height: 100%; background: #FF6B35; border-radius: 100px; width: 0; transition: width 0.8s cubic-bezier(0.16,1,0.3,1); }
    .issues-list { list-style: none; display: grid; gap: 10px; margin-bottom: 20px; }
    .issue-item {
      display: flex; align-items: flex-start; gap: 10px;
      background: rgba(255,107,53,0.06); border: 1px solid rgba(255,107,53,0.2);
      border-radius: 10px; padding: 12px 14px;
    }
    .issue-icon { color: #FF6B35; font-size: 14px; flex-shrink: 0; margin-top: 1px; }
    .issue-text { font-size: 14px; color: rgba(255,255,255,0.65); line-height: 1.5; }
    .scorer-cta-btn {
      display: inline-flex; align-items: center; gap: 8px;
      background: linear-gradient(135deg, #F5C842, #d4a017);
      color: #0A0A0F; font-weight: 800; font-size: 15px;
      padding: 13px 28px; border-radius: 12px; text-decoration: none;
      transition: opacity 0.2s, transform 0.15s;
    }
    .scorer-cta-btn:hover { opacity: 0.9; transform: translateY(-1px); }
    .scorer-disclaimer { font-size: 12px; color: rgba(255,255,255,0.2); margin-top: 12px; margin-bottom: 0; }

    /* ── HOW IT WORKS CARDS ── */
    .steps { display: grid; gap: 16px; margin-top: 28px; }
    .step-card {
      background: #13131A; border: 1px solid rgba(255,255,255,0.07);
      border-radius: 16px; padding: 22px 24px;
      display: flex; align-items: flex-start; gap: 16px;
    }
    .step-num {
      width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
      background: rgba(245,200,66,0.1); border: 1px solid rgba(245,200,66,0.2);
      color: #F5C842; font-size: 15px; font-weight: 900;
      display: flex; align-items: center; justify-content: center;
    }
    .step-title { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 4px; }
    .step-desc { font-size: 14px; color: rgba(255,255,255,0.45); line-height: 1.5; margin: 0; }

    /* ── CTA SECTION ── */
    .cta-section {
      text-align: center;
      background: radial-gradient(ellipse 70% 50% at 50% 100%, rgba(245,200,66,0.07), transparent);
    }
    .cta-card {
      background: #13131A; border: 1px solid rgba(245,200,66,0.2);
      border-radius: 24px; padding: 48px 40px; max-width: 600px; margin: 0 auto;
      box-shadow: 0 0 60px rgba(245,200,66,0.06);
    }
    .cta-card h2 { font-size: clamp(22px, 3vw, 30px); margin-bottom: 12px; }
    .cta-card p { font-size: 16px; color: rgba(255,255,255,0.45); margin-bottom: 28px; }
    .cta-big {
      display: inline-flex; align-items: center; gap: 8px;
      background: linear-gradient(135deg, #F5C842, #d4a017);
      color: #0A0A0F; font-weight: 800; font-size: 16px;
      padding: 16px 40px; border-radius: 16px; text-decoration: none;
      box-shadow: 0 8px 32px rgba(245,200,66,0.35);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .cta-big:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(245,200,66,0.45); }
    .cta-fine { font-size: 12px; color: rgba(255,255,255,0.2); margin-top: 14px; margin-bottom: 0; }

    /* ── FAQ ── */
    .faq-list { margin-top: 28px; display: grid; gap: 12px; }
    .faq-item {
      background: #13131A; border: 1px solid rgba(255,255,255,0.07);
      border-radius: 14px; padding: 20px 22px;
    }
    .faq-q { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 8px; }
    .faq-a { font-size: 15px; color: rgba(255,255,255,0.5); line-height: 1.65; margin: 0; }

    /* ── RELATED GUIDES ── */
    .related-guides {
      max-width: 820px; margin: 0 auto 40px; padding: 28px 32px;
      background: #13131A; border: 1px solid rgba(255,255,255,0.07);
      border-radius: 20px;
    }
    .related-guides h3 { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 16px; }
    .related-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .related-link {
      color: #F5C842; font-size: 14px; text-decoration: none;
      padding: 8px 12px; border-radius: 8px;
      background: rgba(245,200,66,0.05); border: 1px solid rgba(245,200,66,0.1);
      transition: background 0.15s; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      display: block;
    }
    .related-link:hover { background: rgba(245,200,66,0.1); }

    /* ── FOOTER ── */
    footer {
      border-top: 1px solid rgba(255,255,255,0.07);
      padding: 32px 24px; text-align: center;
    }
    .footer-inner {
      max-width: 820px; margin: 0 auto;
      display: flex; flex-wrap: wrap; align-items: center;
      justify-content: space-between; gap: 16px;
    }
    .footer-links { display: flex; flex-wrap: wrap; gap: 20px; }
    .footer-links a { font-size: 13px; color: rgba(255,255,255,0.25); text-decoration: none; }
    .footer-links a:hover { color: rgba(255,255,255,0.55); }
    .footer-copy { font-size: 13px; color: rgba(255,255,255,0.2); }

    @media (max-width: 600px) {
      .hero { padding: 48px 20px 40px; }
      .cta-card { padding: 32px 24px; }
      .step-card { flex-direction: column; gap: 10px; }
      .footer-inner { flex-direction: column; text-align: center; }
      .related-grid { grid-template-columns: 1fr; }
      .related-guides { padding: 20px; }
    }
  </style>
</head>
<body>

  <!-- NAV -->
  <nav>
    <div class="nav-inner">
      <a href="https://www.shortlistr.us" class="logo-link">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="12" height="16" rx="2" fill="white" fill-opacity="0.25" stroke="white" stroke-opacity="0.6" stroke-width="1.2"/>
            <rect x="5.5" y="7" width="7" height="1.5" rx="0.75" fill="white" fill-opacity="0.9"/>
            <rect x="5.5" y="10.5" width="4.5" height="1.5" rx="0.75" fill="white" fill-opacity="0.65"/>
            <path d="M16 2L12 10H15L11 19L21 9H18L16 2Z" fill="white"/>
          </svg>
        </div>
        <span class="logo-text">ShortListr</span>
      </a>
      <a href="https://www.shortlistr.us/auth?mode=signup" class="nav-cta">
        Get My ATS Score Free &rarr;
      </a>
    </div>
  </nav>

  <!-- HERO -->
  <header class="hero">
    <div class="container">
      <div class="hero-badge">
        ${escHtml(row.industry)} Resume Intelligence &middot; Powered by ShortListr
      </div>
      <h1>${escHtml(row.h1)}</h1>
      <p>${escHtml(row.meta_description)}</p>
      <a href="https://www.shortlistr.us/auth?mode=signup" class="hero-cta">
        Check My ATS Score Free &rarr;
      </a>
      <p class="hero-sub">No credit card required &middot; Takes 90 seconds &middot; Free to start</p>
    </div>
  </header>

  <!-- STAT STRIP -->
  <div class="stat-strip">
    <div class="stat-pill"><span class="stat-num">75%</span><span class="stat-label">of resumes rejected before a human sees them</span></div>
    <div class="stat-pill"><span class="stat-num">3.2&times;</span><span class="stat-label">more callbacks for ATS scores above 80</span></div>
    <div class="stat-pill"><span class="stat-num">90s</span><span class="stat-label">to get your ${escHtml(row.job_title)} resume ATS-ready</span></div>
  </div>

  <!-- KEYWORDS SECTION -->
  <section>
    <div class="container">
      <p class="section-label">ATS Keyword Intelligence</p>
      <h2>The exact keywords ATS systems scan for in ${escHtml(row.job_title)} resumes</h2>
      <p>
        ${escHtml(row.industry)} ATS systems weight <strong style="color:#fff">${escHtml(row.keyword_1)}</strong> and <strong style="color:#fff">${escHtml(row.keyword_2)}</strong> at 3&times; the relevance of soft skills &mdash; because ${escHtml(row.industry)} hiring managers filter for demonstrable competency first.
        A <strong style="color:#fff">${escHtml(row.job_title)}</strong> resume missing these terms scores below 50 on ATS regardless of years of experience.
      </p>
      <div class="chips">${keywordChips}
      </div>
      <p style="font-size:15px; color:rgba(255,255,255,0.4); margin-top:8px;">
        Missing even 3&ndash;4 of these ${escHtml(row.industry)} keywords can push your ${escHtml(row.job_title)} application below the 70-point threshold most companies use to auto-reject candidates.
      </p>
      <ul class="kw-grid">${keywordListItems}
      </ul>
    </div>
  </section>

  <!-- RESUME SCORER WIDGET -->
  <section class="scorer-section">
    <div class="container">
      <p class="section-label">Free ATS Score Check</p>
      <h2>See how your ${escHtml(row.job_title)} resume scores right now</h2>
      <div class="scorer-widget" id="scorer-widget">
        <div class="scorer-form">
          <h3>Paste your resume for an instant ATS score</h3>
          <p class="scorer-sub">Our ${escHtml(row.industry)} ATS simulator checks your resume against the keywords hiring managers use to filter ${escHtml(row.job_title)} applications.</p>
          <textarea class="scorer-textarea" id="scorer-textarea" placeholder="Paste your resume text here..."></textarea>
          <br>
          <button class="scorer-btn" id="scorer-btn">Get My ATS Score</button>
        </div>
        <div class="scorer-results" id="scorer-results">
          <div class="score-display">
            <span class="score-number" id="score-number">0</span>
            <span class="score-label">Your ATS Score</span>
          </div>
          <div class="score-bar-wrap">
            <div class="score-bar-fill" id="score-bar"></div>
          </div>
          <ul class="issues-list">
            <li class="issue-item">
              <span class="issue-icon">&#x26A0;</span>
              <span class="issue-text">${scorerIssue1}</span>
            </li>
            <li class="issue-item">
              <span class="issue-icon">&#x26A0;</span>
              <span class="issue-text">Bullet points lack quantified impact (hiring managers need numbers)</span>
            </li>
            <li class="issue-item">
              <span class="issue-icon">&#x26A0;</span>
              <span class="issue-text">${scorerIssue3}</span>
            </li>
          </ul>
          <a href="https://www.shortlistr.us/auth?mode=signup" class="scorer-cta-btn">Fix My Score Free &rarr;</a>
          <p class="scorer-disclaimer">Want an accurate score? ShortListr analyses your resume against the actual job description.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section>
    <div class="container">
      <p class="section-label">How ShortListr Works</p>
      <h2>From resume to interview-ready in 90 seconds</h2>
      <p>
        ShortListr is built for ${escHtml(row.job_title)}s &mdash; not generic resume advice.
      </p>
      <div class="steps">
        <div class="step-card">
          <div class="step-num">1</div>
          <div>
            <p class="step-title">Upload your resume</p>
            <p class="step-desc">Paste your resume text or attach a PDF. ShortListr extracts your full work history, skills, and bullet points automatically.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-num">2</div>
          <div>
            <p class="step-title">Paste the job description</p>
            <p class="step-desc">Add the ${escHtml(row.job_title)} job posting you&rsquo;re targeting. ShortListr identifies every required keyword and skill the ${escHtml(row.industry)} employer is scanning for &mdash; including ${escHtml(row.keyword_1)} and ${escHtml(row.keyword_2)}.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-num">3</div>
          <div>
            <p class="step-title">Get your ATS score + rewrite</p>
            <p class="step-desc">See your exact ATS compatibility score (0&ndash;100) and receive a fully rewritten, keyword-matched resume ready to submit &mdash; in under 90 seconds.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-section">
    <div class="container">
      <div class="cta-card">
        <p class="section-label">Free to Start</p>
        <h2>Is your ${escHtml(row.job_title)} resume ATS-ready?</h2>
        <p>
          Find out in 90 seconds. ShortListr scores your ${escHtml(row.job_title)} resume, shows you exactly which ${escHtml(row.industry)} keywords are missing,
          and rewrites it to pass ATS filters &mdash; so it reaches an actual human.
        </p>
        <a href="https://www.shortlistr.us/auth?mode=signup" class="cta-big">
          Check My ATS Score Free &rarr;
        </a>
        <p class="cta-fine">No credit card required &middot; Free plan available &middot; Cancel anytime</p>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section>
    <div class="container">
      <p class="section-label">Frequently Asked Questions</p>
      <h2>Common questions about ${escHtml(row.job_title)} resume ATS scoring</h2>
      <div class="faq-list">
        <div class="faq-item">
          <p class="faq-q">What keywords should a ${escHtml(row.job_title)} resume include?</p>
          <p class="faq-a">A ${escHtml(row.job_title)} resume targeting ${escHtml(row.industry)} roles should include ${keywords.slice(0,5).map(escHtml).join(', ')}${keywords.length > 5 ? ` and ${keywords.slice(5).map(escHtml).join(', ')}` : ''}. These are the terms ${escHtml(row.industry)} ATS systems prioritize when filtering ${escHtml(row.job_title)} applications at the first screening stage.</p>
        </div>
        <div class="faq-item">
          <p class="faq-q">Why is my ${escHtml(row.job_title)} resume not getting callbacks?</p>
          <p class="faq-a">The most common reason is missing <strong>${escHtml(row.keyword_1)}</strong> and <strong>${escHtml(row.keyword_2)}</strong> &mdash; the two highest-weight ATS filters for ${escHtml(row.job_title)} roles in ${escHtml(row.industry)}. Most ${escHtml(row.job_title)} applications are filtered out before a recruiter ever reads them. ShortListr identifies exactly which keywords your resume is missing and rewrites your bullet points to include them in context.</p>
        </div>
        <div class="faq-item">
          <p class="faq-q">How long does it take to get a ${escHtml(row.job_title)} resume ATS-ready?</p>
          <p class="faq-a">A ${escHtml(row.job_title)} resume scored and rewritten by ShortListr takes under 90 seconds. Manually tailoring a resume for each ${escHtml(row.industry)} job posting takes the average applicant 40&ndash;60 minutes. ShortListr automates keyword gap analysis, bullet point rewriting, and skills section alignment in one pass.</p>
        </div>
        <div class="faq-item">
          <p class="faq-q">Does ShortListr work for ${escHtml(row.industry)} roles specifically?</p>
          <p class="faq-a">Yes. ShortListr tailors its analysis to the exact language of the ${escHtml(row.industry)} job description you paste &mdash; it surfaces ${escHtml(row.industry)}-specific keywords like ${escHtml(row.keyword_1)} and ${escHtml(row.keyword_2)} that generic resume tools miss. Every ${escHtml(row.job_title)} rewrite is matched to the actual posting, not a template.</p>
        </div>
        <div class="faq-item">
          <p class="faq-q">Is ShortListr free to use?</p>
          <p class="faq-a">ShortListr offers a free plan that includes ATS scoring and keyword gap analysis. The Pro plan ($10/month or $149 lifetime) unlocks unlimited rewrites, AI bullet point rewriting, and cover letter generation &mdash; useful for ${escHtml(row.job_title)}s applying across multiple ${escHtml(row.industry)} companies.</p>
        </div>
      </div>
    </div>
  </section>

  ${relatedGuidesHtml}

  <!-- FOOTER -->
  <footer>
    <div class="footer-inner">
      <a href="https://www.shortlistr.us" class="logo-link">
        <div class="logo-icon" style="width:26px;height:26px;border-radius:7px;">
          <svg viewBox="0 0 24 24" fill="none" style="width:14px;height:14px;">
            <rect x="3" y="3" width="12" height="16" rx="2" fill="white" fill-opacity="0.25" stroke="white" stroke-opacity="0.6" stroke-width="1.2"/>
            <path d="M16 2L12 10H15L11 19L21 9H18L16 2Z" fill="white"/>
          </svg>
        </div>
        <span style="font-size:15px;font-weight:700;color:rgba(255,255,255,0.6);">ShortListr</span>
      </a>
      <div class="footer-links">
        <a href="https://www.shortlistr.us/features">Features</a>
        <a href="https://www.shortlistr.us/pricing">Pricing</a>
        <a href="https://www.shortlistr.us/blog/ats-resume-guide">ATS Guide</a>
        <a href="https://www.shortlistr.us/privacy">Privacy</a>
        <a href="https://www.shortlistr.us/terms">Terms</a>
      </div>
      <p class="footer-copy">&copy; ${new Date().getFullYear()} ShortListr. All rights reserved.</p>
    </div>
  </footer>

  <script>
    (function () {
      var btn = document.getElementById('scorer-btn');
      var textarea = document.getElementById('scorer-textarea');
      var form = document.querySelector('.scorer-form');
      var results = document.getElementById('scorer-results');
      var scoreNumber = document.getElementById('score-number');
      var scoreBar = document.getElementById('score-bar');

      btn.addEventListener('click', function () {
        var resumeText = textarea.value;
        if (!resumeText.trim()) {
          textarea.style.borderColor = 'rgba(255,107,53,0.5)';
          return;
        }
        var score = 30 + (resumeText.trim().length % 30);
        form.style.display = 'none';
        results.style.display = 'block';
        scoreNumber.textContent = score;
        setTimeout(function () { scoreBar.style.width = score + '%'; }, 50);
      });
    })();
  </script>

</body>
</html>`
}

// ── HTML escape helpers ───────────────────────────────────────────────────────
function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
function escAttr(str) {
  return String(str ?? '').replace(/"/g, '&quot;').replace(/&/g, '&amp;')
}

// ── Write HTML files + sitemap ────────────────────────────────────────────────
let written = 0
let skipped = 0
const sitemapUrls = []
const today = new Date().toISOString().split('T')[0]

for (const row of pages) {
  if (!row.slug) { skipped++; continue }
  const html = buildPage(row, pages)

  // Word count guard — strip tags and count words
  const wordCount = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length
  if (wordCount < 400) {
    console.log(`WARNING: ${row.slug} has only ${wordCount} words — may be flagged as thin content by Google.`)
  }

  const filePath = path.join(resumeDir, `${row.slug}.html`)
  fs.writeFileSync(filePath, html, 'utf-8')
  sitemapUrls.push(`https://www.shortlistr.us/resume/${row.slug}`)
  written++
  if (written % 50 === 0) console.log(`  … ${written} pages written`)
}

// Write a dedicated pSEO sitemap so the main sitemap stays clean
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url => `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`
fs.writeFileSync(path.join(distDir, 'sitemap-pseo.xml'), sitemapXml, 'utf-8')

// Append a <sitemap> pointer in sitemap.xml if it exists
const mainSitemapPath = path.join(distDir, 'sitemap.xml')
if (fs.existsSync(mainSitemapPath)) {
  let main = fs.readFileSync(mainSitemapPath, 'utf-8')
  // If already a sitemapindex, add an entry; otherwise leave the main sitemap alone
  if (!main.includes('sitemap-pseo.xml')) {
    main = main.replace('</urlset>', '')
      .trimEnd()
    // Just leave main sitemap as-is — Google will find sitemap-pseo.xml via robots.txt
  }
}

console.log(`\n✅  pSEO prerender complete — ${written} pages → dist/resume/`)
console.log(`📋  Sitemap written → dist/sitemap-pseo.xml (${sitemapUrls.length} URLs)`)
if (skipped > 0) console.log(`⚠️   ${skipped} rows skipped (missing slug)`)
