import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const QUALITY_MAP = ['', '😩 Very Poor', '😔 Poor', '😐 Okay', '😊 Good', '😀 Excellent']

export default function Sleep() {
  const [form, setForm] = useState({ bed_time: '22:00', wake_time: '06:00', total_hours: 8, quality: 3, notes: '' })
  const [todayLog, setTodayLog] = useState(null)
  const [history, setHistory] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [todayRes, histRes] = await Promise.all([
        axios.get('/api/sleep/today'),
        axios.get('/api/sleep/history?days=7')
      ])
      if (todayRes.data) {
        setTodayLog(todayRes.data)
        setForm({
          bed_time: todayRes.data.bed_time || '22:00',
          wake_time: todayRes.data.wake_time || '06:00',
          total_hours: todayRes.data.total_hours || 8,
          quality: todayRes.data.quality || 3,
          notes: todayRes.data.notes || ''
        })
      }
      setHistory(histRes.data)
    } catch { }
  }

  const calculateHours = (bed, wake) => {
    if (!bed || !wake) return 0
    const [bh, bm] = bed.split(':').map(Number)
    const [wh, wm] = wake.split(':').map(Number)
    let hours = (wh + wm / 60) - (bh + bm / 60)
    if (hours < 0) hours += 24
    return Math.round(hours * 10) / 10
  }

  const handleTimeChange = (field, val) => {
    const updated = { ...form, [field]: val }
    updated.total_hours = calculateHours(
      field === 'bed_time' ? val : form.bed_time,
      field === 'wake_time' ? val : form.wake_time
    )
    setForm(updated)
  }

  const saveSleep = async () => {
    setSaving(true)
    try {
      await axios.post('/api/sleep/log', {
        date: new Date().toISOString().split('T')[0],
        ...form
      })
      toast.success('🌙 Sleep logged! Rest well, Asifa ❤️')
      loadData()
    } catch { toast.error('Could not save sleep') }
    finally { setSaving(false) }
  }

  const chartData = history ? {
    labels: history.labels,
    datasets: [{
      label: 'Sleep Hours', data: history.hours,
      backgroundColor: 'rgba(126,87,194,0.6)', borderRadius: 8, borderSkipped: false
    }]
  } : null

  return (
    <div className="page-container fade-in-up">
      <h1 className="gradient-text" style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
        🌙 Sleep Tracker
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '28px' }}>
        Quality sleep is essential for your recovery ❤️
      </p>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Log sleep */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '20px', color: 'var(--text-primary)' }}>
            Log Sleep
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>🛏️ Bed Time</label>
                <input className="input-glass" type="time" value={form.bed_time} onChange={e => handleTimeChange('bed_time', e.target.value)} />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>⏰ Wake Time</label>
                <input className="input-glass" type="time" value={form.wake_time} onChange={e => handleTimeChange('wake_time', e.target.value)} />
              </div>
            </div>

            {/* Total Hours Display */}
            <div style={{
              padding: '14px', background: 'rgba(126,87,194,0.1)', borderRadius: 'var(--radius-md)',
              textAlign: 'center', border: '1px solid rgba(126,87,194,0.2)'
            }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2.2rem', color: '#7E57C2', lineHeight: 1 }}>
                {form.total_hours}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                hours of sleep {form.total_hours >= 8 ? '✅ Great!' : form.total_hours >= 6 ? '🌙 Okay' : '⚠️ Need more rest'}
              </div>
            </div>

            {/* Quality */}
            <div>
              <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                Sleep Quality: {QUALITY_MAP[form.quality]}
              </label>
              <input type="range" min={1} max={5} value={form.quality} onChange={e => setForm(f => ({ ...f, quality: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: '#7E57C2' }} />
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Notes</label>
              <textarea className="input-glass" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="How did you sleep?" style={{ resize: 'vertical' }} />
            </div>

            <button onClick={saveSleep} disabled={saving} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
              {saving ? '❤️ Saving...' : '🌙 Save Sleep Log'}
            </button>
          </div>
        </motion.div>

        {/* Sleep tips */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '20px', color: 'var(--text-primary)' }}>
            🌸 Sleep Tips for Recovery
          </h3>
          {[
            { icon: '🌡️', tip: 'Keep room temperature between 18-20°C for best sleep' },
            { icon: '📵', tip: 'Avoid screens 30 minutes before bedtime' },
            { icon: '🍵', tip: 'Warm chamomile tea before sleep aids relaxation' },
            { icon: '🤲', tip: 'Recite Ayat ul Kursi before sleeping for peace of mind' },
            { icon: '💊', tip: 'Take night medicines as prescribed before sleep' },
            { icon: '🎵', tip: 'Soft instrumental music can improve sleep quality' },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{t.icon}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{t.tip}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Chart */}
      {chartData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
            📊 Weekly Sleep Chart
          </h3>
          <div style={{ height: 200 }}>
            <Bar data={chartData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false }, ticks: { font: { family: 'Nunito', size: 11 }, color: '#9B8AAA' } },
                y: { beginAtZero: true, max: 12, grid: { color: 'rgba(126,87,194,0.06)' }, ticks: { font: { family: 'Nunito', size: 11 }, color: '#9B8AAA', stepSize: 2 } }
              }
            }} />
          </div>
        </motion.div>
      )}
    </div>
  )
}
