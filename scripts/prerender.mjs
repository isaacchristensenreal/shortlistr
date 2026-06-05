/**
 * Post-build prerender script
 * Copies dist/index.html to dist/<route>.html for each public route,
 * injecting the correct page title, meta description, and canonical URL.
 * This lets Google index each page without JavaScript execution.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')
const base = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8')

// Load pSEO pages if the data file exists
const seoPagesDataPath = path.join(__dirname, '..', 'src', 'data', 'seoPages.json')
const seoPagesData = fs.existsSync(seoPagesDataPath)
  ? JSON.parse(fs.readFileSync(seoPagesDataPath, 'utf-8'))
  : []

const pages = [
  {
    route: '/features',
    title: 'ShortListr Features — ATS Optimizer, AI Bullet Rewriter & Cover Letter Generator',
    description: 'See every tool ShortListr offers: ATS keyword scoring, AI bullet point rewriting, cover letter generation, rejection reason reports, and before/after scorecards. Beat ATS filters and get more interviews.',
    canonical: 'https://www.shortlistr.us/features',
  },
  {
    route: '/pricing',
    title: 'ShortListr Pricing — $10/month for Unlimited AI Resume Optimization',
    description: 'ShortListr Pro is $10/month or $149 once for lifetime access. Unlimited ATS resume optimization, AI bullet rewrites, cover letter generation, and more.',
    canonical: 'https://www.shortlistr.us/pricing',
  },
  {
    route: '/auth',
    title: 'Sign In or Create Your ShortListr Account',
    description: 'Log in or sign up to ShortListr — the AI resume optimizer that tailors your resume to any job in 90 seconds and helps you beat ATS filters.',
    canonical: 'https://www.shortlistr.us/auth',
  },
  {
    route: '/terms',
    title: 'Terms of Service — ShortListr',
    description: 'Read the ShortListr terms of service.',
    canonical: 'https://www.shortlistr.us/terms',
  },
  {
    route: '/privacy',
    title: 'Privacy Policy — ShortListr',
    description: 'Read the ShortListr privacy policy.',
    canonical: 'https://www.shortlistr.us/privacy',
  },
  {
    route: '/contact',
    title: 'Contact ShortListr',
    description: 'Get in touch with the ShortListr team.',
    canonical: 'https://www.shortlistr.us/contact',
  },
  {
    route: '/disclaimer',
    title: 'Disclaimer — ShortListr',
    description: 'ShortListr disclaimer.',
    canonical: 'https://www.shortlistr.us/disclaimer',
  },
  {
    route: '/acceptable-use',
    title: 'Acceptable Use Policy — ShortListr',
    description: 'ShortListr acceptable use policy.',
    canonical: 'https://www.shortlistr.us/acceptable-use',
  },
  {
    route: '/cookie-policy',
    title: 'Cookie Policy — ShortListr',
    description: 'ShortListr cookie policy.',
    canonical: 'https://www.shortlistr.us/cookie-policy',
  },
  {
    route: '/copyright',
    title: 'Copyright — ShortListr',
    description: 'ShortListr copyright information.',
    canonical: 'https://www.shortlistr.us/copyright',
  },
  {
    route: '/ats-resume-checker',
    title: 'Free ATS Resume Checker: See Your Score in 60 Seconds | ShortListr',
    description: 'Most ATS resume checkers are fake — they give you a score but tell you nothing useful. Learn what a real ATS checker does and how ShortListr gives you actionable fixes.',
    canonical: 'https://www.shortlistr.us/ats-resume-checker',
  },
  {
    route: '/ats-score',
    title: 'What Is an ATS Score and Why It\'s Destroying Your Job Search | ShortListr',
    description: 'Your ATS score determines whether a human ever reads your resume. Learn exactly how ATS scoring works, what tanks it, and how to improve it for every job you apply to.',
    canonical: 'https://www.shortlistr.us/ats-score',
  },
  {
    route: '/how-to-get-more-job-interviews',
    title: 'How to Get More Job Interviews (The ATS Problem Nobody Tells You About) | ShortListr',
    description: 'The real reason you\'re not getting interviews isn\'t your experience — it\'s how your resume communicates it. Learn how to fix keyword gaps, tailoring, and ATS filters.',
    canonical: 'https://www.shortlistr.us/how-to-get-more-job-interviews',
  },
  {
    route: '/job-description-keywords',
    title: 'How to Find the Right Keywords in Any Job Description | ShortListr',
    description: 'A step-by-step method for extracting the exact keywords from any job description and adding them to your resume naturally to pass ATS filters and get more interviews.',
    canonical: 'https://www.shortlistr.us/job-description-keywords',
  },
  {
    route: '/no-experience-resume',
    title: 'How to Write a Resume With No Experience That Actually Gets Interviews | ShortListr',
    description: 'No work experience doesn\'t mean no resume. Learn how to build a skills-based resume that passes ATS, highlights transferable skills, and gets you callbacks for entry-level roles.',
    canonical: 'https://www.shortlistr.us/no-experience-resume',
  },
  {
    route: '/overqualified-resume',
    title: 'How to Write a Resume When You\'re Overqualified | ShortListr',
    description: 'Being overqualified is a solvable problem. Learn how to position your resume strategically, what to cut, what to emphasize, and how ATS handles overqualified candidates.',
    canonical: 'https://www.shortlistr.us/overqualified-resume',
  },
  {
    route: '/rejected-from-every-job',
    title: 'Rejected From Every Job You Apply To? Here\'s the Real Reason | ShortListr',
    description: 'Getting rejected from every job application is a fixable problem. Learn the most common reasons — ATS filters, untailored resumes, formatting failures — and how to fix each one.',
    canonical: 'https://www.shortlistr.us/rejected-from-every-job',
  },
  {
    route: '/resume-ats-test',
    title: 'The ATS Resume Test: Is Your Resume Being Filtered Out? | ShortListr',
    description: 'Take the ATS resume test. Learn exactly what ATS software looks for, how to test your resume before you submit, and what common ATS failures look like.',
    canonical: 'https://www.shortlistr.us/resume-ats-test',
  },
  {
    route: '/resume-for-first-job',
    title: 'How to Write Your First Resume That Actually Gets Callbacks | ShortListr',
    description: 'Writing your first resume is intimidating, but there\'s a proven formula. Learn what to include, how to structure it, and how to pass ATS filters even with limited experience.',
    canonical: 'https://www.shortlistr.us/resume-for-first-job',
  },
  {
    route: '/resume-for-remote-jobs',
    title: 'How to Optimize Your Resume for Remote Jobs in 2026 | ShortListr',
    description: 'Remote job listings are more competitive than ever. Learn the specific keywords, signals, and ATS strategies that help your resume stand out for remote-first roles in 2026.',
    canonical: 'https://www.shortlistr.us/resume-for-remote-jobs',
  },
  {
    route: '/resume-help',
    title: 'Resume Help: The Complete Guide to Getting More Interviews in 2026 | ShortListr',
    description: 'Everything you need to know about writing, formatting, and optimizing a resume in 2026. Covers ATS, keywords, formatting, bullet points, and the full tailoring process.',
    canonical: 'https://www.shortlistr.us/resume-help',
  },
  {
    route: '/resume-not-getting-callbacks',
    title: 'Your Resume Is Not Getting Callbacks — Here\'s Exactly Why | ShortListr',
    description: 'If your resume isn\'t getting callbacks, there are specific, diagnosable reasons. Learn how to identify whether it\'s ATS filtering, keyword gaps, formatting, or targeting — and how to fix it.',
    canonical: 'https://www.shortlistr.us/resume-not-getting-callbacks',
  },
  {
    route: '/resume-tips-for-career-changers',
    title: 'Resume Tips for Career Changers: How to Make the Transition | ShortListr',
    description: 'Changing careers means your resume needs to work differently. Learn how to surface transferable skills, reframe your experience, and pass ATS filters when switching industries.',
    canonical: 'https://www.shortlistr.us/resume-tips-for-career-changers',
  },
  {
    route: '/tech-resume-ats',
    title: 'How to Write a Tech Resume That Passes ATS in 2026 | ShortListr',
    description: 'Tech resumes face specific ATS challenges around skills sections, project formatting, GitHub links, and rapidly changing toolsets. Here\'s how to optimize your tech resume for 2026.',
    canonical: 'https://www.shortlistr.us/tech-resume-ats',
  },
  {
    route: '/why-am-i-not-getting-interviews',
    title: 'Why Am I Not Getting Interviews? The Answer Is Probably Your Resume | ShortListr',
    description: 'If you\'re not getting interviews, there\'s a specific reason. This diagnostic guide walks through the most common causes — ATS filtering, tailoring, formatting, targeting — and how to fix each one.',
    canonical: 'https://www.shortlistr.us/why-am-i-not-getting-interviews',
  },
  // Tool pages
  {
    route: '/tools/cover-letter-first-paragraph-generator',
    title: 'Cover Letter Opening Paragraph Generator — 3 Options, Free',
    description: 'The hardest sentence to write. Get 3 cover letter opening paragraphs tailored to your role — direct, story-driven, or question-based. No signup.',
    canonical: 'https://www.shortlistr.us/tools/cover-letter-first-paragraph-generator',
  },
  {
    route: '/tools/resume-bullet-rewriter',
    title: 'Free Resume Bullet Point Rewriter — Stronger Bullets in Seconds',
    description: 'Paste a weak resume bullet and get 3 rewritten versions with strong action verbs and ATS-friendly phrasing. Free, instant, no signup.',
    canonical: 'https://www.shortlistr.us/tools/resume-bullet-rewriter',
  },
  {
    route: '/tools/resume-keyword-extractor',
    title: 'Free Resume Keyword Extractor — Find the Exact ATS Keywords for Any Job',
    description: 'Paste a job posting and get the exact keywords ATS systems scan for. Free tool, instant results, no account needed.',
    canonical: 'https://www.shortlistr.us/tools/resume-keyword-extractor',
  },
  {
    route: '/tools/ats-score-checker',
    title: 'Free ATS Score Checker — See How Your Resume Ranks',
    description: 'Paste your resume and job description. Get an instant ATS match score, missing keywords, and a plain-English verdict. Free, no signup.',
    canonical: 'https://www.shortlistr.us/tools/ats-score-checker',
  },
  // pSEO index page
  {
    route: '/ats-resume',
    title: 'ATS Resume Guides by Job Title — ShortListr',
    description: 'Free ATS resume guides for 50+ job titles, 50 top companies, and every major ATS platform. Learn which keywords pass the filter and what formatting mistakes get you auto-rejected.',
    canonical: 'https://www.shortlistr.us/ats-resume',
  },
  // pSEO detail pages — generated from seoPages.json
  ...seoPagesData.map(p => ({
    route: `/ats-resume/${p.slug}`,
    title: p.page_title,
    description: p.meta_description,
    canonical: `https://www.shortlistr.us/ats-resume/${p.slug}`,
  })),
]

for (const page of pages) {
  let html = base

  // Replace title
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${page.title}</title>`
  )

  // Replace meta description
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${page.description}"`
  )

  // Replace canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${page.canonical}"`
  )

  // Replace og:url
  html = html.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${page.canonical}"`
  )

  // Replace og:title
  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${page.title}"`
  )

  // Replace og:description
  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${page.description}"`
  )

  // Write as a flat or nested .html file.
  // cleanUrls:true serves /foo.html at /foo and /ats-resume/slug.html at /ats-resume/slug.
  const filePath = path.join(distDir, `${page.route}.html`)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, html)
  console.log(`✓ Pre-rendered ${page.route}`)
}

console.log(`\nPre-rendering complete — ${pages.length} pages generated.`)
