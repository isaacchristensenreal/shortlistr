import { useRef, useState } from 'react'

const THEMES = [
  { id: 'navy',     label: 'Navy',     header: '#1e3a5f', accent: '#1e3a5f', pill: '#eff6ff', pillText: '#1e3a5f', pillBorder: '#bfdbfe' },
  { id: 'slate',    label: 'Slate',    header: '#1e293b', accent: '#334155', pill: '#f1f5f9', pillText: '#334155', pillBorder: '#cbd5e1' },
  { id: 'forest',   label: 'Forest',   header: '#14532d', accent: '#166534', pill: '#f0fdf4', pillText: '#14532d', pillBorder: '#bbf7d0' },
  { id: 'burgundy', label: 'Burgundy', header: '#7f1d1d', accent: '#991b1b', pill: '#fff1f2', pillText: '#7f1d1d', pillBorder: '#fecdd3' },
  { id: 'charcoal', label: 'Charcoal', header: '#111827', accent: '#374151', pill: '#f9fafb', pillText: '#111827', pillBorder: '#d1d5db' },
]

const FONTS = [
  { id: 'sans',  label: 'Modern',      value: "'Helvetica Neue', Arial, sans-serif" },
  { id: 'serif', label: 'Traditional', value: "Georgia, 'Times New Roman', serif" },
]

export default function ResumePreview({ data, atsScore }) {
  const ref = useRef(null)
  const [themeId, setThemeId] = useState('navy')
  const [fontId, setFontId] = useState('sans')
  const theme = THEMES.find(t => t.id === themeId)
  const font = FONTS.find(f => f.id === fontId)

  const handleExport = async () => {
    const el = ref.current
    if (!el) return
    const html2canvas = (await import('html2canvas')).default
    const { jsPDF } = await import('jspdf')

    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pdfW = pdf.internal.pageSize.getWidth()
    const pdfH = (canvas.height * pdfW) / canvas.width
    let yOffset = 0
    const pageH = pdf.internal.pageSize.getHeight()
    while (yOffset < pdfH) {
      if (yOffset > 0) pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, -yOffset, pdfW, pdfH)
      yOffset += pageH
    }
    pdf.save(data.name ? `${data.name.replace(/\s+/g, '_')}_Resume.pdf` : 'Resume.pdf')
  }

  const contactItems = [
    data.email,
    data.phone,
    data.location || null,
    data.linkedin,
  ].filter(Boolean)

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Optimized Resume</label>
          {atsScore !== null && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${
              atsScore >= 85
                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-500/10 dark:border-green-500/30 dark:text-green-400'
                : atsScore >= 70
                ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400'
                : 'bg-red-50 border-red-200 text-red-600 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${atsScore >= 85 ? 'bg-green-500' : atsScore >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} />
              ATS Score: {atsScore}%
            </div>
          )}
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border transition-all bg-slate-50 dark:bg-navy-800 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-electric-500/50 hover:text-electric-600 dark:hover:text-electric-400"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          Download PDF
        </button>
      </div>

      {/* Format customizer */}
      <div className="flex flex-wrap items-center gap-4 p-3.5 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Color</span>
          <div className="flex gap-1.5">
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => setThemeId(t.id)}
                title={t.label}
                className={`w-6 h-6 rounded-full transition-all ${themeId === t.id ? 'ring-2 ring-offset-2 ring-electric-500' : 'hover:scale-110'}`}
                style={{ backgroundColor: t.header }}
              />
            ))}
          </div>
        </div>
        <div className="w-px h-5 bg-slate-200 dark:bg-white/10" />
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Font</span>
          <div className="flex gap-1">
            {FONTS.map(f => (
              <button
                key={f.id}
                onClick={() => setFontId(f.id)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${fontId === f.id ? 'bg-white dark:bg-navy-600 border-electric-500/40 text-slate-800 dark:text-white shadow-sm' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                style={f.id === 'serif' ? { fontFamily: 'Georgia, serif' } : {}}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Document wrapper */}
      <div style={{ background: '#e5e7eb', borderRadius: '12px', padding: '24px', overflowX: 'auto' }}>
        <div
          ref={ref}
          style={{
            fontFamily: font.value,
            backgroundColor: '#ffffff',
            color: '#1f2937',
            width: '794px',
            minWidth: '794px',
            boxSizing: 'border-box',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          }}
        >
          {/* Colored header band */}
          <div style={{ backgroundColor: theme.header, padding: '36px 52px 28px' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#ffffff',
              margin: '0 0 10px',
              letterSpacing: '0.01em',
              lineHeight: '1.1',
            }}>
              {data.name || 'Your Name'}
            </h1>
            {contactItems.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0', fontSize: '12px', color: '#93c5fd' }}>
                {contactItems.map((item, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
                    {i > 0 && <span style={{ margin: '0 10px', color: '#3b82f6', fontSize: '10px' }}>●</span>}
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Body */}
          <div style={{ padding: '32px 52px 44px' }}>

            {/* Summary */}
            {data.summary && (
              <Section title="Summary" accent={theme.accent}>
                <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.7', margin: '0' }}>{data.summary}</p>
              </Section>
            )}

            {/* Experience */}
            {data.experience?.length > 0 && (
              <Section title="Experience" accent={theme.accent}>
                {data.experience.map((job, i) => (
                  <div key={i} style={{ marginBottom: i < data.experience.length - 1 ? '20px' : '0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', lineHeight: '1.3' }}>{job.title}</div>
                        <div style={{ fontSize: '12.5px', color: theme.accent, fontWeight: '600', marginTop: '1px' }}>{job.company}</div>
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap', marginLeft: '12px', marginTop: '2px', fontWeight: '500' }}>{job.dates}</div>
                    </div>
                    <ul style={{ margin: '6px 0 0 0', padding: '0', listStyle: 'none' }}>
                      {job.bullets?.map((b, j) => (
                        <li key={j} style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.65', marginBottom: '4px', paddingLeft: '14px', position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '0', top: '7px', width: '5px', height: '5px', backgroundColor: theme.accent, borderRadius: '50%', display: 'inline-block' }} />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </Section>
            )}

            {/* Education */}
            {data.education?.length > 0 && (
              <Section title="Education" accent={theme.accent}>
                {data.education.map((edu, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: i < data.education.length - 1 ? '12px' : '0' }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#111827' }}>{edu.school}</div>
                      <div style={{ fontSize: '12.5px', color: '#374151', marginTop: '1px' }}>{edu.degree}</div>
                      {edu.details && <div style={{ fontSize: '11.5px', color: '#6b7280', marginTop: '2px' }}>{edu.details}</div>}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap', marginLeft: '12px', marginTop: '2px', fontWeight: '500' }}>{edu.dates}</div>
                  </div>
                ))}
              </Section>
            )}

            {/* Skills */}
            {data.skills?.length > 0 && (
              <Section title="Skills" accent={theme.accent} last>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '4px' }}>
                  {data.skills.map((s, i) => (
                    <span key={i} style={{
                      fontSize: '12px',
                      backgroundColor: theme.pill,
                      color: theme.pillText,
                      border: `1px solid ${theme.pillBorder}`,
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontWeight: '500',
                    }}>{s}</span>
                  ))}
                </div>
              </Section>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children, last, accent }) {
  return (
    <div style={{ marginBottom: last ? '0' : '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{ width: '4px', height: '18px', backgroundColor: accent, borderRadius: '2px', flexShrink: '0' }} />
        <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.14em', textTransform: 'uppercase', color: accent }}>{title}</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
      </div>
      {children}
    </div>
  )
}
