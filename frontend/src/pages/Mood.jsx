import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-toastify'

const MOODS = [
  { key: 'excellent', emoji: '😀', label: 'Excellent', color: '#4FC3F7' },
  { key: 'happy', emoji: '😊', label: 'Happy', color: '#81C784' },
  { key: 'normal', emoji: '😐', label: 'Normal', color: '#FFD54F' },
  { key: 'sad', emoji: '😔', label: 'Sad', color: '#FF8A65' },
  { key: 'weak', emoji: '🤒', label: 'Weak', color: '#EF5350' },
]

export default function Mood() {
  const [selectedMood, setSelectedMood] = useState(null)
  const [notes, setNotes] = useState('')
  const [energy, setEnergy] = useState(5)
  const [todayLog, setTodayLog] = useState(null)
  const [history, setHistory] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [todayRes, histRes] = await Promise.all([
        axios.get('/api/mood/today'),
        axios.get('/api/mood/history?days=7')
      ])
      if (todayRes.data) {
        setTodayLog(todayRes.data)
        setSelectedMood(todayRes.data.mood)
        setNotes(todayRes.data.notes || '')
        setEnergy(todayRes.data.energy_level || 5)
      }
      setHistory(histRes.data)
    } catch { }
  }

  const saveMood = async () => {
    if (!selectedMood) { toast.error('Please select your mood'); return }
    setSaving(true)
    try {
      await axios.post('/api/mood/log', {
        date: new Date().toISOString().split('T')[0],
        mood: selectedMood, notes, energy_level: energy
      })
      toast.success('😊 Mood logged! Thank you for sharing how you feel ❤️')
      loadData()
    } catch { toast.error('Could not save mood') }
    finally { setSaving(false) }
  }

  return (
    <div className="page-container fade-in-up">
      <h1 className="gradient-text" style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
        😊 Mood Tracker
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '28px' }}>
        How are you feeling today, Asifa? ❤️ Every emotion is valid.
      </p>

      {/* Mood selector */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '20px', color: 'var(--text-primary)', textAlign: 'center' }}>
          How are you feeling right now?
        </h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {MOODS.map(mood => (
            <motion.button key={mood.key} onClick={() => setSelectedMood(mood.key)}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                padding: '16px 20px', borderRadius: 'var(--radius-lg)',
                border: `2px solid ${selectedMood === mood.key ? mood.color : 'rgba(255,255,255,0.5)'}`,
                background: selectedMood === mood.key ? `${mood.color}20` : 'rgba(255,255,255,0.6)',
                cursor: 'pointer', transition: 'all 0.3s ease',
                boxShadow: selectedMood === mood.key ? `0 4px 20px ${mood.color}40` : 'none',
                minWidth: 90
              }}>
              <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{mood.emoji}</span>
              <span style={{
                fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.82rem',
                color: selectedMood === mood.key ? mood.color : 'var(--text-secondary)'
              }}>
                {mood.label}
              </span>
            </motion.button>
          ))}
        </div>

        {selectedMood && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Energy level */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
                ⚡ Energy Level: {energy}/10
              </label>
              <input type="range" min={1} max={10} value={energy} onChange={e => setEnergy(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)', height: 6 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Very Low</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Very High</span>
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                📝 Daily Notes (optional)
              </label>
              <textarea className="input-glass" value={notes} onChange={e => setNotes(e.target.value)}
                rows={3} placeholder="How was your day? Anything you'd like to note?"
                style={{ resize: 'vertical' }} />
            </div>

            <button onClick={saveMood} disabled={saving} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
              {saving ? '❤️ Saving...' : '💾 Save Today\'s Mood'}
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* History chart */}
      {history && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
            📊 Weekly Mood History
          </h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {history.labels.map((label, i) => {
              const val = history.values[i]
              const mood = MOODS[5 - val] || MOODS[2]
              return (
                <div key={label} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  flex: 1, minWidth: 60
                }}>
                  <span style={{ fontSize: '1.6rem' }}>{val > 0 ? MOODS.find((_, mi) => 5 - mi === val)?.emoji || '😐' : '—'}</span>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
