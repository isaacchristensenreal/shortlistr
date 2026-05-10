import { Helmet } from 'react-helmet-async'
import { Link, useParams, Navigate } from 'react-router-dom'
import BlogLayout, { InlineCTA } from '../components/layout/BlogLayout'
import seoPages from '../data/seoPages.json'

// ── Derive the human-readable subject of the page from its title ──────────────
function getRoleName(page) {
  const { page_title, target_keyword, slug } = page
  if (slug.startsWith('ats-resume-')) {
    const m = page_title.match(/^How to Optimize Your (.+?) Resume for ATS/i)
    return m ? m[1] : page_title
  }
  if (slug.startsWith('does-') && slug.endsWith('-use-ats')) {
    const m = page_title.match(/^Does (.+?) Use ATS/i)
    return m ? m[1] : target_keyword
  }
  if (slug.startsWith('how-to-beat-')) {
    return target_keyword || page_title
  }
  return page_title
}

// ── Copy tuned to each of the 3 page types ───────────────────────────────────
function getPageCopy(page, roleName) {
  const { slug, target_keyword } = page

  if (slug.startsWith('ats-resume-')) {
    return {
      badge: 'ATS Resume Guide',
      keywordSectionTitle: `Keywords ATS Systems Scan For in ${roleName} Resumes`,
      keywordIntro: `These are the exact strings an ATS parser matches against when screening ${roleName} applications. Missing even 3–4 of them drops your score below the auto-reject threshold, regardless of your actual experience.`,
      whyTitle: `Why Most ${roleName} Resumes Get Filtered Out Before a Human Reads Them`,
      whyBody: `Hiring teams for ${roleName} roles at mid-to-large companies route every application through an ATS before a recruiter touches it. Systems like Workday, Greenhouse, and Taleo score your resume against the job description and discard anything below a cutoff — typically 70–80 out of 100. Most ${roleName} resumes fail not because of qualifications, but because the parser couldn't find the right keywords, or because formatting choices (tables, text boxes, columns) caused it to misread entire sections. You looked underqualified on paper. You weren't.`,
      mistakeTitle: `The Formatting Mistake That Gets ${roleName} Resumes Auto-Rejected`,
      faqTitle: `Frequently Asked Questions: ${roleName} ATS Resume`,
      ctaHeadline: `See Exactly How Your Resume Scores for ${roleName} Roles`,
    }
  }

  if (slug.startsWith('does-') && slug.endsWith('-use-ats')) {
    return {
      badge: 'Company ATS Intel',
      keywordSectionTitle: `Keywords That Score Highest in ${roleName}'s ATS`,
      keywordIntro: `${roleName}'s ATS is configured to weight these terms heavily. Resumes that include these keywords verbatim — not paraphrased — consistently rank higher in their candidate pipeline.`,
      whyTitle: `How ${roleName} Screens Candidates Before Any Recruiter Is Involved`,
      whyBody: `${roleName} receives thousands of applications per open role. Their ATS applies automated scoring the moment you hit submit — before any human sees your resume. Depending on the role level, 70–90% of applicants are filtered at this stage. The system isn't reading between the lines. It's parsing text, matching keywords, and assigning a score. A candidate who would be a perfect hire gets rejected because their resume used "led cross-functional teams" where the job description said "managed stakeholders." The vocabulary mismatch costs the interview.`,
      mistakeTitle: `The Most Common Mistake When Applying to ${roleName}`,
      faqTitle: `Frequently Asked Questions: Getting Past ${roleName}'s ATS`,
      ctaHeadline: `See How Your Resume Scores for ${roleName} Roles`,
    }
  }

  // how-to-beat-*
  return {
    badge: 'ATS Platform Guide',
    keywordSectionTitle: `Signals ${roleName} Uses to Rank Candidates`,
    keywordIntro: `${roleName} scores resumes against these signals during its automated screening phase. Candidates whose profiles match more of these terms are surfaced to recruiters first — everyone else is buried or discarded.`,
    whyTitle: `Why ${roleName} Rejects Most Resumes Automatically`,
    whyBody: `${roleName} processes applications through a structured scoring pipeline before any recruiter opens a single resume. It evaluates keyword density, section structure, formatting compatibility, and candidate profile completeness. A resume that looks great as a PDF can render as a wall of gibberish inside ${roleName}'s parser if it uses the wrong formatting. Columns, tables, headers and footers, and certain PDF encodings are common culprits. Once rejected by the parser, there's no second chance — the system has already moved on.`,
    mistakeTitle: `The Formatting Error That ${roleName} Penalises Most`,
    faqTitle: `Frequently Asked Questions: Getting Past ${roleName}`,
    ctaHeadline: `See How Your Resume Scores Against ${roleName}`,
  }
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function SeoPage() {
  const { slug } = useParams()
  const page = seoPages.find(p => p.slug === slug)

  if (!page) {
    console.warn(`[SeoPage] No entry found for slug: "${slug}" — redirecting to home`)
    return <Navigate to="/" replace />
  }

  const roleName = getRoleName(page)
  const copy = getPageCopy(page, roleName)

  const keywords = page.top_10_keywords
    .split(',')
    .map(k => k.trim())
    .filter(Boolean)

  const faqs = [1, 2, 3, 4, 5]
    .map(n => ({ q: page[`faq_${n}_question`], a: page[`faq_${n}_answer`] }))
    .filter(f => f.q && f.a)

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const canonicalUrl = `https://www.shortlistr.us/ats-resume/${page.slug}`

  return (
    <>
      <Helmet>
        <title>{page.page_title}</title>
        <meta name="description" content={page.meta_description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={page.page_title} />
        <meta property="og:description" content={page.meta_description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <BlogLayout
        badge={copy.badge}
        title={page.page_title}
        description={page.meta_description}
        readTime="5 min"
      >

        {/* ── TARGET KEYWORD CALLOUT ─────────────────────────────────────── */}
        <div
          className="flex items-center gap-3 rounded-lg px-4 py-3 mb-6"
          style={{ background: '#F5C84212', border: '1px solid #F5C84230' }}
        >
          <span className="text-lg">🎯</span>
          <p className="text-sm font-semibold m-0" style={{ color: '#F5C842' }}>
            The #1 keyword ATS systems look for in this role is{' '}
            <span className="font-black">{page.target_keyword}</span>
          </p>
        </div>

        {/* ── INTRO ─────────────────────────────────────────────────────── */}
        <p>{page.intro_paragraph}</p>

        {/* ── WHY ATS REJECTS ───────────────────────────────────────────── */}
        <h2>{copy.whyTitle}</h2>
        <div
          className="rounded-xl my-6"
          style={{
            background: 'rgba(255, 68, 68, 0.06)',
            border: '1px solid rgba(255, 68, 68, 0.25)',
            borderLeft: '4px solid #FF4444',
            padding: '1.25rem 1.5rem',
          }}
        >
          <p className="flex gap-3 m-0">
            <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
            <span style={{ color: 'rgba(255,255,255,0.82)', lineHeight: '1.75' }}>
              {copy.whyBody}
            </span>
          </p>
        </div>

        {/* ── TOP KEYWORDS ──────────────────────────────────────────────── */}
        <h2>{copy.keywordSectionTitle}</h2>
        <p style={{ color: '#9CA3AF', fontSize: '0.95rem' }}>{copy.keywordIntro}</p>
        <div className="flex flex-wrap gap-2 my-5">
          {keywords.map(kw => (
            <span
              key={kw}
              className="px-3 py-1.5 rounded-full text-sm font-semibold"
              style={{
                background: 'rgba(245, 200, 66, 0.12)',
                color: '#F5C842',
                border: '1px solid rgba(245, 200, 66, 0.3)',
              }}
            >
              {kw}
            </span>
          ))}
        </div>
        <p style={{ color: '#9CA3AF', fontSize: '0.875rem', marginTop: '-0.5rem' }}>
          Copy these terms verbatim into your skills section and work history bullet points.
          Paraphrasing reduces your match score — the parser isn't reading for meaning.
        </p>

        {/* ── COMMON MISTAKES ───────────────────────────────────────────── */}
        <h2>{copy.mistakeTitle}</h2>
        <div
          className="rounded-xl my-6"
          style={{
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderLeft: '4px solid #EF4444',
            padding: '1.25rem 1.5rem',
          }}
        >
          <div className="flex gap-3">
            <span className="text-xl flex-shrink-0 mt-0.5">🚫</span>
            <div>
              <p className="font-semibold text-white mb-1">Don't do this</p>
              <p className="m-0" style={{ color: 'rgba(255,255,255,0.75)', lineHeight: '1.7' }}>
                {page.common_mistakes}
              </p>
            </div>
          </div>
        </div>
        <p>
          This mistake is more costly than it sounds. ATS parsers don't give partial credit — a keyword
          that's buried in a paragraph, listed inside a table, or formatted as an image scores zero.
          The fix is mechanical: put your highest-value terms in the right sections, in plain text, spelled
          exactly the way they appear in the job description.
        </p>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <h2>{copy.faqTitle}</h2>
        <div className="grid gap-3 mt-5">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl p-5"
              style={{ background: '#13131A', border: '1px solid #1E1E2E' }}
            >
              <p className="font-bold text-white mb-2 m-0">{faq.q}</p>
              <p className="m-0" style={{ color: '#9CA3AF', lineHeight: '1.7', marginTop: '0.5rem' }}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        {/* ── INLINE CTA ────────────────────────────────────────────────── */}
        <InlineCTA />

        {/* ── BOTTOM CTA ────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-8 text-center mt-8"
          style={{ background: '#13131A', border: '1px solid rgba(245,200,66,0.2)' }}
        >
          <div
            className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
            style={{
              background: 'rgba(245,200,66,0.12)',
              color: '#F5C842',
              border: '1px solid rgba(245,200,66,0.3)',
            }}
          >
            Free to Start
          </div>
          <h2 className="text-2xl font-black text-white mb-3">
            {copy.ctaHeadline}
          </h2>
          <p className="mb-6 max-w-md mx-auto" style={{ color: '#9CA3AF' }}>
            {page.cta}
          </p>
          <a
            href="https://shortlistr.us/auth?mode=signup"
            className="inline-block font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200 hover:opacity-90 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #F5C842, #E6A817)', color: '#0A0A0F' }}
          >
            Scan My Resume Free →
          </a>
          <p className="mt-3 text-xs" style={{ color: '#6B7280' }}>No credit card required</p>
        </div>

        {/* ── INTERNAL LINK ─────────────────────────────────────────────── */}
        <p className="mt-8 text-center text-sm" style={{ color: '#6B7280' }}>
          <Link
            to="/ats-resume"
            style={{ color: '#F5C842', textDecoration: 'underline', textUnderlineOffset: '3px' }}
          >
            Browse all ATS resume guides →
          </Link>
        </p>

      </BlogLayout>
    </>
  )
}
