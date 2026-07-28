import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const FLOW_OPTIONS = [
  { id: 'light', label: 'Light', emoji: '💧' },
  { id: 'medium', label: 'Medium', emoji: '💧💧' },
  { id: 'heavy', label: 'Heavy', emoji: '💧💧💧' },
]

const MOOD_OPTIONS = [
  { id: 'calm', label: 'Calm & Rested', emoji: '🌸' },
  { id: 'emotional', label: 'Emotional / Sensitive', emoji: '🥺' },
  { id: 'tired', label: 'Tired & Sleepy', emoji: '😴' },
  { id: 'pain', label: 'In Pain / Cramps', emoji: '😣' },
  { id: 'cozy', label: 'Cozy / Need Hugs', emoji: '🤗' },
]

const SELF_CARE_TIPS = [
  {
    icon: '♨️',
    title: 'Warm Heating Pad',
    desc: 'Place a warm water pouch or heating pad on your lower belly for 15-20 mins to ease muscle cramps.',
    slang: 'Sonparii, heating pad lagao — dard jaldi theek hojayega! ❤️'
  },
  {
    icon: '☕',
    title: 'Warm Chamomile / Ginger Tea',
    desc: 'Sip warm herbal tea to relax uterine muscles and reduce bloating.',
    slang: 'Gudiya jii, garam chai piyoo ba aaram milega! 🍵'
  },
  {
    icon: '🛌',
    title: 'Fetal Position Rest',
    desc: 'Lying on your side with knees pulled up takes pressure off abdominal muscles.',
    slang: 'Guddu jii, soft pillow ke sath cozy hoke sojayo munna! 😴'
  },
  {
    icon: '💧',
    title: 'Hydration & ORS',
    desc: 'Drinking plenty of water prevents headaches and reduces fluid retention.',
    slang: 'Paani piyoo merii sonparii, ek ghanta hua dekhoo log kardoo! 💧'
  },
  {
    icon: '🍫',
    title: 'Dark Chocolate & Comfort',
    desc: 'Dark chocolate increases magnesium and serotonin, boosting mood and easing cramps.',
    slang: 'Munna thoda chocolate khaalo, mood ekdum fresh hojayega! 🍫'
  },
  {
    icon: '🧘‍♀️',
    title: 'Gentle Stretching',
    desc: 'Soft child-pose yoga stretches relieve lower back pressure without strain.',
    slang: 'Halka phulka stretch karoo ba agar comfortable lage toh! 🌸'
  },
]

export default function Period() {
  const [cycleData, setCycleData] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  // Form state for logging period status
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [flowIntensity, setFlowIntensity] = useState('medium')
  const [crampsLevel, setCrampsLevel] = useState(2)
  const [mood, setMood] = useState('tired')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchCycleData = async () => {
    try {
      setLoading(true)
      const [latestRes, historyRes] = await Promise.all([
        axios.get('/api/period/latest'),
        axios.get('/api/period/history')
      ])
      setCycleData(latestRes.data)
      setHistory(historyRes.data)

      if (latestRes.data?.log) {
        setStartDate(latestRes.data.log.start_date || new Date().toISOString().split('T')[0])
        setFlowIntensity(latestRes.data.log.flow_intensity || 'medium')
        setCrampsLevel(latestRes.data.log.cramps_level ?? 2)
        setMood(latestRes.data.log.mood || 'tired')
        setNotes(latestRes.data.log.notes || '')
      }
    } catch (err) {
      toast.error('Failed to load cycle companion data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCycleData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      await axios.post('/api/period/log', {
        start_date: startDate,
        flow_intensity: flowIntensity,
        cramps_level: Number(crampsLevel),
        mood: mood,
        notes: notes,
        cycle_length: 28,
        period_length: 5
      })
      toast.success('Period status logged! Take rest, Gudiya jii ❤️')
      fetchCycleData()
    } catch (err) {
      toast.error('Failed to save period log')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this cycle record?')) return
    try {
      await axios.delete(`/api/period/${id}`)
      toast.info('Record deleted')
      fetchCycleData()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '2.5rem', animation: 'pulse-soft 1.5s ease infinite' }}>🌸</div>
        <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginTop: 12 }}>
          Loading Gudiya's Cycle Companion...
        </p>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.4rem, 4vw, 2rem)', color: 'var(--text-primary)', marginBottom: 6 }}>
          🌸 Women's Health & Cycle Companion
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Merii sonparii, aapka personal period tracker aur self-care guide ❤️
        </p>
      </div>

      {/* Main Period Banner */}
      <div
        className="glass-card"
        style={{
          padding: '24px 24px',
          marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(255,107,157,0.18), rgba(233,30,140,0.12))',
          border: '1.5px solid var(--primary)',
          borderRadius: 'var(--radius-lg)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: '1.5rem' }}>🩸</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary-dark)' }}>
                {cycleData?.phase || 'Menstrual Phase 🌸'}
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: 12, fontWeight: 600 }}>
              {cycleData?.phase_desc || 'Period started today — take plenty of rest & stay warm!'}
            </p>
            <div style={{
              padding: '10px 16px',
              background: 'rgba(255,255,255,0.75)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid var(--primary)',
              fontFamily: 'var(--font-script)',
              fontSize: '1.05rem',
              color: 'var(--primary-dark)',
              lineHeight: 1.4
            }}>
              "{cycleData?.care_tip || 'Merii sonparii, aaj bilkul aaram karoo jii! Hot tea piyoo aur strain nakko lo! ❤️'}"
            </div>
          </div>

          <div style={{ textAlign: 'right', minWidth: 140 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-dark)', lineHeight: 1 }}>
              Day {cycleData?.cycle_day || 1}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Current Cycle Day
            </div>
          </div>
        </div>
      </div>

      {/* Cycle Key Stats Grid */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {/* Next Period */}
        <div className="stat-card">
          <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>📅</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Next Expected Period</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginTop: 2 }}>
            {formatDate(cycleData?.next_period_date)}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginTop: 4 }}>
            In ~{cycleData?.days_until_next || 28} days
          </div>
        </div>

        {/* Estimated Ovulation */}
        <div className="stat-card">
          <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>🌟</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Estimated Ovulation</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginTop: 2 }}>
            {formatDate(cycleData?.estimated_ovulation_date)}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#48CAE4', fontWeight: 600, marginTop: 4 }}>
            Mid-cycle peak
          </div>
        </div>

        {/* Fertile Window */}
        <div className="stat-card">
          <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>💫</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Fertile Window</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginTop: 2 }}>
            {formatDate(cycleData?.fertile_window_start)} – {formatDate(cycleData?.fertile_window_end)}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#7B4F9E', fontWeight: 600, marginTop: 4 }}>
            Estimated 6 days
          </div>
        </div>

        {/* Cycle Length */}
        <div className="stat-card">
          <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>🔄</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Average Cycle</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginTop: 2 }}>
            28 Days
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4 }}>
            5 days period duration
          </div>
        </div>
      </div>

      {/* Interactive Period Tracker Form */}
      <div className="glass-card" style={{ padding: '24px 22px', marginBottom: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          ✍️ Log Period Status & Symptoms
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          Track Gudiya's flow, cramps, and mood to get accurate predictions
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ marginBottom: 20 }}>
            {/* Start Date */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Period Start Date
              </label>
              <input
                type="date"
                className="input-glass"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            {/* Cramp Pain Level */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Cramps Level (0 - 5): <span style={{ color: 'var(--primary-dark)', fontWeight: 700 }}>{crampsLevel}</span>
              </label>
              <input
                type="range"
                min="0"
                max="5"
                value={crampsLevel}
                onChange={(e) => setCrampsLevel(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer', height: 8 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                <span>No cramps (0)</span>
                <span>Mild (2)</span>
                <span>Severe (5)</span>
              </div>
            </div>
          </div>

          {/* Flow Intensity */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Flow Intensity
            </label>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {FLOW_OPTIONS.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFlowIntensity(option.id)}
                  style={{
                    flex: 1,
                    minWidth: 100,
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: flowIntensity === option.id ? '2px solid var(--primary)' : '1px solid rgba(255,107,157,0.2)',
                    background: flowIntensity === option.id ? 'rgba(255,107,157,0.15)' : 'rgba(255,255,255,0.6)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    color: flowIntensity === option.id ? 'var(--primary-dark)' : 'var(--text-secondary)',
                    transition: 'var(--transition)'
                  }}
                >
                  <span style={{ marginRight: 6 }}>{option.emoji}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mood Selection */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              How is Gudiya Feeling Today?
            </label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {MOOD_OPTIONS.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMood(m.id)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: mood === m.id ? '2px solid var(--primary)' : '1px solid rgba(255,107,157,0.2)',
                    background: mood === m.id ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : 'rgba(255,255,255,0.75)',
                    color: mood === m.id ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    transition: 'var(--transition)'
                  }}
                >
                  <span style={{ marginRight: 6 }}>{m.emoji}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Notes & Reminders
            </label>
            <textarea
              className="input-glass"
              rows="2"
              placeholder="e.g. Took heating pad at 4 PM, drank ORS..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {isSubmitting ? 'Saving...' : '💖 Update Period Record'}
          </button>
        </form>
      </div>

      {/* Period Self-Care & Comfort Guide */}
      <div className="glass-card" style={{ padding: '24px 22px', marginBottom: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 6 }}>
          ☕ Gudiya's Period Self-Care & Comfort Guide
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          Sweet ways to make her feel loved, comfortable, and pain-free
        </p>

        <div className="grid-2">
          {SELF_CARE_TIPS.map((tip, idx) => (
            <div
              key={idx}
              style={{
                padding: '16px 18px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255,107,157,0.18)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: '1.4rem' }}>{tip.icon}</span>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {tip.title}
                </h3>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: 8 }}>
                {tip.desc}
              </p>
              <div style={{ fontFamily: 'var(--font-script)', fontSize: '0.95rem', color: 'var(--primary-dark)', fontStyle: 'italic' }}>
                💬 "{tip.slang}"
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cycle History Log */}
      <div className="glass-card" style={{ padding: '24px 22px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 16 }}>
          📜 Logged Cycles History
        </h2>

        {history.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            No previous cycle entries logged yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {history.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.7)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255,107,157,0.15)',
                  flexWrap: 'wrap',
                  gap: 10
                }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                    🌸 Started: {formatDate(item.start_date)}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Flow: <strong style={{ textTransform: 'capitalize' }}>{item.flow_intensity}</strong> | Cramps Level: <strong>{item.cramps_level}/5</strong> {item.mood && `| Mood: ${item.mood}`}
                  </div>
                  {item.notes && (
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      Note: {item.notes}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    border: 'none',
                    background: 'rgba(231,76,60,0.1)',
                    color: '#e74c3c',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
