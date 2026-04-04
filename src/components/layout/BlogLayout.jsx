import { Link } from 'react-router-dom'
import Layout from './Layout'

function InlineCTA() {
  return (
    <div className="my-8 rounded-xl p-6 text-center" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #13131A 100%)', border: '1px solid #F5C84233' }}>
      <p className="text-white font-semibold mb-1">See how your resume scores right now</p>
      <p className="text-sm mb-4" style={{ color: '#9CA3AF' }}>Get your ATS score, keyword gaps, and fix recommendations in 60 seconds.</p>
      <Link
        to="/auth?mode=signup"
        className="inline-block font-bold px-6 py-3 rounded-lg transition-all duration-200 hover:opacity-90 hover:scale-105"
        style={{ background: 'linear-gradient(135deg, #F5C842, #E6A817)', color: '#0A0A0F' }}
      >
        Scan My Resume Free →
      </Link>
    </div>
  )
}

export default function BlogLayout({ title, description, badge, readTime, children }) {
  return (
    <Layout>
      <div style={{ background: '#0A0A0F', minHeight: '100vh' }}>
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          {/* Header */}
          <header className="mb-8">
            {badge && (
              <span
                className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
                style={{ background: '#3B82F620', color: '#3B82F6', border: '1px solid #3B82F640' }}
              >
                {badge}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">
              {title}
            </h1>
            {description && (
              <p className="text-lg leading-relaxed mb-4" style={{ color: '#9CA3AF' }}>
                {description}
              </p>
            )}
            <div className="flex items-center gap-3 text-sm" style={{ color: '#6B7280' }}>
              {readTime && <span>{readTime} read</span>}
              {readTime && <span>·</span>}
              <span>Updated 2026</span>
            </div>
          </header>

          <hr style={{ borderColor: '#1F2937', marginBottom: '2rem' }} />

          {/* Article body */}
          <div className="blog-content">
            {children}
          </div>

          <hr style={{ borderColor: '#1F2937', margin: '3rem 0' }} />

          {/* Bottom CTA */}
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: '#13131A', border: '1px solid #F5C84233' }}
          >
            <div
              className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
              style={{ background: '#F5C84220', color: '#F5C842', border: '1px solid #F5C84240' }}
            >
              Free to Start
            </div>
            <h2 className="text-2xl font-black text-white mb-3">
              Stop guessing. Start getting interviews.
            </h2>
            <p className="mb-6 max-w-md mx-auto" style={{ color: '#9CA3AF' }}>
              ShortListr scans your resume against any job description and tells you exactly what's missing — keywords, formatting issues, and ATS red flags — in under 60 seconds.
            </p>
            <Link
              to="/auth?mode=signup"
              className="inline-block font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200 hover:opacity-90 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #F5C842, #E6A817)', color: '#0A0A0F' }}
            >
              Scan My Resume Free →
            </Link>
            <p className="mt-3 text-xs" style={{ color: '#6B7280' }}>No credit card required</p>
          </div>
        </article>
      </div>

      <style>{`
        .blog-content p {
          color: rgba(255,255,255,0.80);
          line-height: 1.75;
          margin-bottom: 1.25rem;
        }
        .blog-content h2 {
          color: #ffffff;
          font-weight: 700;
          font-size: 1.5rem;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          line-height: 1.3;
        }
        .blog-content h3 {
          color: #ffffff;
          font-weight: 600;
          font-size: 1.15rem;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }
        .blog-content ul {
          margin-bottom: 1.25rem;
          padding-left: 1.5rem;
        }
        .blog-content ul li {
          color: rgba(255,255,255,0.80);
          line-height: 1.75;
          margin-bottom: 0.4rem;
          list-style-type: disc;
        }
        .blog-content ol {
          margin-bottom: 1.25rem;
          padding-left: 1.5rem;
        }
        .blog-content ol li {
          color: rgba(255,255,255,0.80);
          line-height: 1.75;
          margin-bottom: 0.4rem;
          list-style-type: decimal;
        }
        .blog-content strong {
          color: #ffffff;
          font-weight: 600;
        }
        .blog-content a {
          color: #F5C842;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .blog-content a:hover {
          color: #E6A817;
        }
        .blog-content .highlight-box {
          background: #13131A;
          border: 1px solid #1F2937;
          border-left: 3px solid #3B82F6;
          border-radius: 0.5rem;
          padding: 1rem 1.25rem;
          margin: 1.5rem 0;
        }
        .blog-content .highlight-box p {
          margin-bottom: 0;
        }
      `}</style>
    </Layout>
  )
}

export { InlineCTA }
