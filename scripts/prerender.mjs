/**
 * Post-build prerender script
 * Copies dist/index.html to dist/<route>/index.html for each public route,
 * injecting the correct page title, meta description, and canonical URL.
 * This lets Google index each page without JavaScript execution.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')
const base = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8')

const pages = [
  {
    route: '/features',
    title: 'ShortListr Features — ATS Optimizer, AI Bullet Rewriter & Cover Letter Generator',
    description: 'See every tool ShortListr offers: ATS keyword scoring, AI bullet point rewriting, cover letter generation, rejection reason reports, and before/after scorecards. Beat ATS filters and get more interviews.',
    canonical: 'https://shortlistr.us/features',
  },
  {
    route: '/pricing',
    title: 'ShortListr Pricing — $10/month for Unlimited AI Resume Optimization',
    description: 'ShortListr Pro is $10/month or $149 once for lifetime access. Unlimited ATS resume optimization, AI bullet rewrites, cover letter generation, and more.',
    canonical: 'https://shortlistr.us/pricing',
  },
  {
    route: '/auth',
    title: 'Sign In or Create Your ShortListr Account',
    description: 'Log in or sign up to ShortListr — the AI resume optimizer that tailors your resume to any job in 90 seconds and helps you beat ATS filters.',
    canonical: 'https://shortlistr.us/auth',
  },
  {
    route: '/terms',
    title: 'Terms of Service — ShortListr',
    description: 'Read the ShortListr terms of service.',
    canonical: 'https://shortlistr.us/terms',
  },
  {
    route: '/privacy',
    title: 'Privacy Policy — ShortListr',
    description: 'Read the ShortListr privacy policy.',
    canonical: 'https://shortlistr.us/privacy',
  },
  {
    route: '/contact',
    title: 'Contact ShortListr',
    description: 'Get in touch with the ShortListr team.',
    canonical: 'https://shortlistr.us/contact',
  },
  {
    route: '/disclaimer',
    title: 'Disclaimer — ShortListr',
    description: 'ShortListr disclaimer.',
    canonical: 'https://shortlistr.us/disclaimer',
  },
  {
    route: '/acceptable-use',
    title: 'Acceptable Use Policy — ShortListr',
    description: 'ShortListr acceptable use policy.',
    canonical: 'https://shortlistr.us/acceptable-use',
  },
  {
    route: '/cookie-policy',
    title: 'Cookie Policy — ShortListr',
    description: 'ShortListr cookie policy.',
    canonical: 'https://shortlistr.us/cookie-policy',
  },
  {
    route: '/copyright',
    title: 'Copyright — ShortListr',
    description: 'ShortListr copyright information.',
    canonical: 'https://shortlistr.us/copyright',
  },
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

  const dir = path.join(distDir, page.route)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), html)
  console.log(`✓ Pre-rendered ${page.route}`)
}

console.log(`\nPre-rendering complete — ${pages.length} pages generated.`)
