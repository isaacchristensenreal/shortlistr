import * as pdfjsLib from 'pdfjs-dist'
import { jsPDF } from 'jspdf'

// Use CDN worker to avoid Vite bundling complexity
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

/**
 * Extract plain text from a PDF File object.
 * Returns the full text content as a string.
 */
export async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const pages = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map((item) => item.str).join(' ')
    pages.push(pageText)
  }

  return pages.join('\n\n')
}

/**
 * Fetch the text content of a URL via the Jina Reader API.
 * Returns clean plain text suitable for pasting into the job description field.
 */
export async function fetchJobDescriptionFromURL(url) {
  const res = await fetch(`https://r.jina.ai/${url}`, {
    headers: { Accept: 'text/plain' },
  })
  if (!res.ok) throw new Error(`Failed to fetch URL (${res.status})`)
  const text = await res.text()
  // Trim and return up to 8000 chars (enough for any job description)
  return text.trim().slice(0, 8000)
}

/**
 * Download text content as a formatted PDF file.
 */
export function downloadAsPDF(text, filename = 'optimized-resume.pdf') {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })

  const margin = 54          // 0.75 inch
  const pageWidth  = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const maxWidth   = pageWidth - margin * 2
  const lineHeight = 13

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(30, 30, 30)

  // Split text into lines that respect the page width
  const lines = doc.splitTextToSize(text, maxWidth)
  let y = margin

  lines.forEach((line) => {
    if (y + lineHeight > pageHeight - margin) {
      doc.addPage()
      y = margin
    }
    doc.text(line, margin, y)
    y += lineHeight
  })

  doc.save(filename)
}
