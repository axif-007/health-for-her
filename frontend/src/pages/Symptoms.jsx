import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-toastify'

const SYMPTOMS = [
  { key: 'fever', label: 'Fever 🌡️' },
  { key: 'headache', label: 'Headache 🤕' },
  { key: 'weakness', label: 'Weakness 😩' },
  { key: 'vomiting', label: 'Vomiting 🤢' },
  { key: 'loose_motion', label: 'Loose Motion 💨' },
  { key: 'body_pain', label: 'Body Pain 🦴' },
  { key: 'appetite', label: 'Appetite 🍽️' },
  { key: 'sleep_quality', label: 'Sleep Quality 😴' },
]

const SEVERITIES = [
  { key: 'none', label: 'None', color: '#9B8AAA' },
  { key: 'mild', label: 'Mild', color: '#81C784' },
  { key: 'moderate', label: 'Moderate', color: '#FFD54F' },
  { key: 'severe', label: 'Severe', color: '#EF5350' },
]

export default function Symptoms() {
  const [form, setForm] = useState({})
  const [notes, setNotes] = useState('')
  const [history, setHistory] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [todayRes, histRes] = await Promise.all([
        axios.get('/api/symptoms/today'),
        axios.get('/api/symptoms/history?days=7')
      ])
      if (todayRes.data) {
        const { id, logged_at, user_id, notes: n, ...rest } = todayRes.data
        setForm(rest)
        setNotes(n || '')
      }
      setHistory(histRes.data)
    } catch { }
  }

  const saveSymptoms = async () => {
    setSaving(true)
    try {
      await axios.post('/api/symptoms/log', {
        date: new Date().toISOString().split('T')[0],
        ...form, notes
      })
      toast.success('✅ Symptoms logged! Thank you for tracking ❤️')
      loadData()
    } catch { toast.error('Could not save') }
    finally { setSaving(false) }
  }

  const setSymptom = (key, val) => setForm(f => ({ ...f, [key]: val }))

  return (
    <div className="page-container fade-in-up">
      <h1 className="gradient-text" style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
        🌡️ Symptom Tracker
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '28px' }}>
        Track your symptoms to understand your recovery better
      </p>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '22px', color: 'var(--text-primary)' }}>
          Today's Symptoms — {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          {SYMPTOMS.map(symptom => (
            <div key={symptom.key}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                {symptom.label}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {SEVERITIES.map(sev => (
                  <button key={sev.key} onClick={() => setSymptom(symptom.key, sev.key === 'none' ? null : sev.key)}
                    style={{
                      padding: '6px 14px', borderRadius: 'var(--radius-full)',
                      border: `2px solid ${(form[symptom.key] || 'none') === sev.key ? sev.color : 'rgba(200,200,200,0.4)'}`,
                      background: (form[symptom.key] || 'none') === sev.key ? `${sev.color}20` : 'rgba(255,255,255,0.6)',
                      color: (form[symptom.key] || 'none') === sev.key ? sev.color : 'var(--text-muted)',
                      cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.78rem',
                      transition: 'all 0.2s ease'
                    }}>
                    {sev.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
            📝 Additional Notes
          </label>
          <textarea className="input-glass" value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            placeholder="Any other symptoms or notes?" style={{ resize: 'vertical' }} />
        </div>

        <button onClick={saveSymptoms} disabled={saving} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
          {saving ? '❤️ Saving...' : '💾 Save Symptoms'}
        </button>
      </motion.div>

      {/* History */}
      {history.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
            📋 Recent Symptom History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {history.map(log => (
              <div key={log.id} style={{
                padding: '14px 16px', background: 'rgba(255,255,255,0.6)',
                borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,107,157,0.1)'
              }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {SYMPTOMS.map(s => log[s.key] && log[s.key] !== 'none' ? (
                    <span key={s.key} className="badge" style={{
                      background: log[s.key] === 'severe' ? 'rgba(239,83,80,0.15)' : log[s.key] === 'moderate' ? 'rgba(255,213,79,0.2)' : 'rgba(129,199,132,0.15)',
                      color: log[s.key] === 'severe' ? '#EF5350' : log[s.key] === 'moderate' ? '#E65100' : '#2E7D32',
                    }}>
                      {s.label.split(' ')[0]}: {log[s.key]}
                    </span>
                  ) : null)}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
