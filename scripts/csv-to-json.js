/**
 * Converts "MONTH 1 PSEO CVS 150.csv" → src/data/seoPages.json
 * Handles RFC 4180 quoted fields (commas and quotes inside fields).
 * Run: node scripts/csv-to-json.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function parseCSV(text) {
  const rows = []
  let row = [], field = '', inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]

    if (ch === '"') {
      if (inQuotes && next === '"') { field += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      row.push(field.trim())
      field = ''
    } else if ((ch === '\n' || (ch === '\r' && next === '\n')) && !inQuotes) {
      if (ch === '\r') i++ // consume \n after \r
      row.push(field.trim())
      if (row.some(f => f !== '')) rows.push(row)
      row = []
      field = ''
    } else if (ch === '\r') {
      // bare \r — skip
    } else {
      field += ch
    }
  }
  // flush last row
  row.push(field.trim())
  if (row.some(f => f !== '')) rows.push(row)

  return rows
}

const csvPath = path.join(__dirname, '..', 'MONTH 1 PSEO CVS 150.csv')
const raw = fs.readFileSync(csvPath, 'utf-8')
const rows = parseCSV(raw)

const headers = rows[0]
console.log(`Columns detected (${headers.length}):`, headers)

const data = rows.slice(1).map((row, i) => {
  if (row.length !== headers.length) {
    console.warn(`  ⚠  Row ${i + 2} has ${row.length} fields, expected ${headers.length} — skipping`)
    return null
  }
  const obj = {}
  headers.forEach((h, idx) => { obj[h] = row[idx] ?? '' })
  return obj
}).filter(Boolean).filter(r => r.slug)

const outPath = path.join(__dirname, '..', 'src', 'data', 'seoPages.json')
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8')

console.log(`\n✅  Wrote ${data.length} entries → src/data/seoPages.json`)
console.log(`   First slug : ${data[0]?.slug}`)
console.log(`   Last slug  : ${data[data.length - 1]?.slug}`)
