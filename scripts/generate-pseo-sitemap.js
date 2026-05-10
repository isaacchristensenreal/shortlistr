/**
 * Appends all pSEO /ats-resume/[slug] URLs to public/sitemap.xml.
 * Safe to re-run: skips any slug already present in the sitemap.
 * Does not touch the existing 41 entries.
 * Run: node scripts/generate-pseo-sitemap.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml')
const dataPath    = path.join(__dirname, '..', 'src', 'data', 'seoPages.json')

if (!fs.existsSync(dataPath)) {
  console.error('❌  src/data/seoPages.json not found — run csv-to-json.js first')
  process.exit(1)
}

const pages   = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
const today   = new Date().toISOString().split('T')[0]
let sitemap   = fs.readFileSync(sitemapPath, 'utf-8')

let added = 0
let skipped = 0

const newEntries = []

for (const page of pages) {
  const url = `https://www.shortlistr.us/ats-resume/${page.slug}`
  const safeUrl = url.replace(/&/g, '&amp;')
  if (sitemap.includes(safeUrl)) {
    skipped++
    continue
  }
  newEntries.push(`
  <url>
    <loc>${safeUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
  added++
}

if (newEntries.length === 0) {
  console.log(`✅  Sitemap already up to date — ${skipped} URLs already present, nothing added.`)
  process.exit(0)
}

// Insert new entries just before the closing </urlset> tag
sitemap = sitemap.trimEnd().replace(
  /<\/urlset>\s*$/,
  newEntries.join('') + '\n\n</urlset>\n'
)

fs.writeFileSync(sitemapPath, sitemap, 'utf-8')

console.log(`\n✅  Sitemap updated — ${added} URLs added, ${skipped} already existed.`)
console.log(`   Path: public/sitemap.xml`)

// Sanity check
const totalUrls = (sitemap.match(/<loc>/g) || []).length
console.log(`   Total URLs in sitemap now: ${totalUrls}`)
