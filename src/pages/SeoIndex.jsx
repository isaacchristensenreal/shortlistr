import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import seoPages from '../data/seoPages.json'

const jobTitlePages = seoPages.filter(p => p.slug.startsWith('ats-resume-'))
const companyPages  = seoPages.filter(p => p.slug.startsWith('does-') && p.slug.endsWith('-use-ats'))
const atsPlatPages  = seoPages.filter(p => p.slug.startsWith('how-to-beat-'))

function GuideGroup({ title, description, pages }) {
  if (!pages.length) return null
  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
      <p className="text-sm mb-5" style={{ color: '#9CA3AF' }}>{description}</p>
      <ul className="grid sm:grid-cols-2 gap-2">
        {pages.map(page => (
          <li key={page.slug}>
            <Link
              to={`/ats-resume/${page.slug}`}
              className="block text-sm px-3 py-2 rounded-lg transition-colors duration-150"
              style={{
                color: '#F5C842',
                background: 'rgba(245,200,66,0.05)',
                border: '1px solid rgba(245,200,66,0.12)',
                textDecoration: 'none',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(245,200,66,0.1)'
                e.currentTarget.style.textDecoration = 'underline'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(245,200,66,0.05)'
                e.currentTarget.style.textDecoration = 'none'
              }}
            >
              {page.page_title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function SeoIndex() {
  return (
    <>
      <Helmet>
        <title>ATS Resume Guides by Job Title — ShortListr</title>
        <meta
          name="description"
          content="Free ATS resume guides for 50+ job titles, 50 top companies, and every major ATS platform. Learn which keywords pass the filter and what formatting mistakes get you auto-rejected."
        />
        <link rel="canonical" href="https://www.shortlistr.us/ats-resume" />
        <meta property="og:title" content="ATS Resume Guides by Job Title — ShortListr" />
        <meta
          property="og:description"
          content="Free ATS resume guides for 50+ job titles, 50 top companies, and every major ATS platform."
        />
        <meta property="og:url" content="https://www.shortlistr.us/ats-resume" />
      </Helmet>

      <Layout>
        <div style={{ background: '#0A0A0F', minHeight: '100vh' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

            {/* ── Header ─────────────────────────────────────────────── */}
            <header className="mb-10">
              <span
                className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
                style={{ background: '#3B82F620', color: '#3B82F6', border: '1px solid #3B82F640' }}
              >
                ATS Resume Library
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">
                ATS Resume Guides by Job Title
              </h1>
              <p className="text-lg leading-relaxed mb-4" style={{ color: '#9CA3AF' }}>
                Most resumes are rejected by software before a recruiter ever reads them.
                These guides cover the exact keywords, formatting rules, and ATS-specific
                tactics for 150 roles, companies, and platforms — all free.{' '}
                <a
                  href="https://shortlistr.us"
                  style={{ color: '#F5C842', textDecoration: 'underline', textUnderlineOffset: '3px' }}
                >
                  ShortListr
                </a>{' '}
                scans your resume against any job description and tells you exactly what's missing.
              </p>
              <div
                className="flex flex-wrap gap-4 text-sm py-3 px-4 rounded-lg"
                style={{ background: '#13131A', border: '1px solid #1E1E2E', color: '#9CA3AF' }}
              >
                <span>📄 {jobTitlePages.length} job title guides</span>
                <span>🏢 {companyPages.length} company ATS guides</span>
                <span>⚙️ {atsPlatPages.length} ATS platform guides</span>
              </div>
            </header>

            <hr style={{ borderColor: '#1F2937', marginBottom: '3rem' }} />

            {/* ── Guide groups ───────────────────────────────────────── */}
            <GuideGroup
              title="Resume Guides by Job Title"
              description="Keyword lists, formatting rules, and ATS tactics for specific roles."
              pages={jobTitlePages}
            />

            <GuideGroup
              title="Does This Company Use ATS?"
              description="Which ATS each major employer uses, and how to pass their specific filters."
              pages={companyPages}
            />

            <GuideGroup
              title="How to Beat Specific ATS Platforms"
              description="Platform-level formatting and keyword strategies for the most common ATS systems."
              pages={atsPlatPages}
            />

            {/* ── Bottom CTA ─────────────────────────────────────────── */}
            <div
              className="rounded-2xl p-8 text-center mt-4"
              style={{ background: '#13131A', border: '1px solid rgba(245,200,66,0.2)' }}
            >
              <h2 className="text-2xl font-black text-white mb-3">
                Don't guess — get your actual ATS score
              </h2>
              <p className="mb-6 max-w-md mx-auto" style={{ color: '#9CA3AF' }}>
                Paste any job description into ShortListr and see exactly which keywords your
                resume is missing, your match percentage, and what to rewrite first.
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

          </div>
        </div>
      </Layout>
    </>
  )
}
