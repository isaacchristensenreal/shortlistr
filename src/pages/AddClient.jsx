import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function AddClient() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const canSubmit = name.trim().length > 0 && !saving

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit || !user) return
    setSaving(true)
    setError(null)
    const { data, error: insertError } = await supabase
      .from('clients')
      .insert({ coach_id: user.id, name: name.trim(), contact_email: contactEmail.trim() || null })
      .select()
      .single()
    if (insertError) {
      setError('Could not add this client. Please try again.')
      setSaving(false)
      return
    }
    navigate(`/clients/${data.id}`)
  }

  return (
    <AppShell>
      <div className="min-h-screen" style={{ background: '#fafbfc' }}>
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm mb-6 font-medium transition-colors" style={{ color: 'rgba(10,11,13,0.35)' }}>
            <ArrowLeft size={15} />
            Back to roster
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="rounded-2xl border p-6"
            style={{ background: '#ffffff', borderColor: '#e5e7eb' }}
          >
            <h1 className="text-xl font-bold text-white mb-1">Add a client</h1>
            <p className="text-sm mb-6" style={{ color: 'rgba(10,11,13,0.35)' }}>
              Create a workspace for a client you're coaching.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(10,11,13,0.5)' }}>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jordan Lee"
                  autoFocus
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
                  style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.09)', color: '#0a0b0d' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'; e.currentTarget.style.background = 'rgba(59,130,246,0.04)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.09)'; e.currentTarget.style.background = 'rgba(0,0,0,0.02)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(10,11,13,0.5)' }}>Contact email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="jordan@example.com"
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
                  style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.09)', color: '#0a0b0d' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'; e.currentTarget.style.background = 'rgba(59,130,246,0.04)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.09)'; e.currentTarget.style.background = 'rgba(0,0,0,0.02)' }}
                />
              </div>

              {error && <p className="text-xs" style={{ color: '#dc2626' }}>{error}</p>}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full px-5 py-3 rounded-xl font-bold text-sm disabled:opacity-40 transition-all"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#ffffff' }}
              >
                {saving ? 'Adding…' : 'Add Client'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </AppShell>
  )
}
