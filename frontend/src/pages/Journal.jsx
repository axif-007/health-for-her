import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-toastify'

const JOURNAL_QUESTIONS = [
  { key: 'how_feel', emoji: '💭', question: 'How do you feel today?' },
  { key: 'what_made_smile', emoji: '😊', question: 'What made you smile today?' },
  { key: 'grateful_for', emoji: '🙏', question: 'What are you thankful for today?' },
  { key: 'todays_notes', emoji: '📝', question: "Today's notes & thoughts" },
]

export default function Journal() {
  const [form, setForm] = useState({})
  const [history, setHistory] = useState([])
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [todayRes, histRes] = await Promise.all([
        axios.get('/api/journal/today'),
        axios.get('/api/journal/history')
      ])
      if (todayRes.data) {
        const { id, created_at, user_id, date, ...rest } = todayRes.data
        setForm(rest)
      }
      setHistory(histRes.data)
    } catch { }
  }

  const saveJournal = async () => {
    setSaving(true)
    try {
      await axios.post('/api/journal/entry', { date: new Date().toISOString().split('T')[0], ...form })
      toast.success('📖 Journal saved! Thank you for sharing ❤️')
      loadData()
    } catch { toast.error('Could not save journal') }
    finally { setSaving(false) }
  }

  return (
    <div className="page-container fade-in-up">
      <h1 className="gradient-text" style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
        📖 Health Journal
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '28px' }}>
        Your daily reflection space — write freely, feel freely ❤️
      </p>

      {/* Today's Journal */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '28px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <div style={{ width: 42, height: 42, borderRadius: '12px', background: 'rgba(255,107,157,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📖</div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              Today's Journal
            </h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {JOURNAL_QUESTIONS.map(q => (
            <div key={q.key}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.9rem',
                color: 'var(--text-secondary)', marginBottom: '8px'
              }}>
                <span>{q.emoji}</span>
                <span>{q.question}</span>
              </label>
              <textarea
                className="input-glass"
                value={form[q.key] || ''}
                onChange={e => setForm(f => ({ ...f, [q.key]: e.target.value }))}
                rows={3}
                placeholder={`Write your thoughts here...`}
                style={{ resize: 'vertical' }}
              />
            </div>
          ))}
        </div>

        <button onClick={saveJournal} disabled={saving} className="btn-primary" style={{ marginTop: '20px', width: '100%', justifyContent: 'center', padding: '14px' }}>
          {saving ? '❤️ Saving your thoughts...' : '💾 Save Journal Entry'}
        </button>
      </motion.div>

      {/* Journal History */}
      {history.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '16px' }}>
            📚 Past Journal Entries
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {history.map(entry => (
              <div key={entry.id}
                onClick={() => setSelected(selected?.id === entry.id ? null : entry)}
                className="glass-card"
                style={{ padding: '18px', cursor: 'pointer', transition: 'all 0.3s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>
                    📅 {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selected?.id === entry.id ? '▲' : '▼'}</span>
                </div>
                {entry.how_feel && (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic' }}>
                    "{entry.how_feel.substring(0, 80)}{entry.how_feel.length > 80 ? '...' : ''}"
                  </p>
                )}
                {selected?.id === entry.id && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,107,157,0.15)' }}>
                    {JOURNAL_QUESTIONS.map(q => entry[q.key] ? (
                      <div key={q.key} style={{ marginBottom: '12px' }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '4px' }}>{q.emoji} {q.question}</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{entry[q.key]}</div>
                      </div>
                    ) : null)}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
