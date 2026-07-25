import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import axios from 'axios'
import { toast } from 'react-toastify'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function Recovery() {
  const [form, setForm] = useState({ recovery_percentage: 65, energy_level: 6, strength_level: 6, temperature: 37.0, weight: 55, steps_walked: 0, notes: '' })
  const [history, setHistory] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [todayRes, histRes] = await Promise.all([
        axios.get('/api/recovery/today'),
        axios.get('/api/recovery/history?days=30')
      ])
      if (todayRes.data) {
        const { id, logged_at, user_id, date, ...rest } = todayRes.data
        setForm(prev => ({ ...prev, ...rest }))
      }
      setHistory(histRes.data)
    } catch { }
  }

  const saveRecovery = async () => {
    setSaving(true)
    try {
      await axios.post('/api/recovery/log', { date: new Date().toISOString().split('T')[0], ...form })
      toast.success('📈 Recovery logged! Keep going, Asifa ❤️')
      loadData()
    } catch { toast.error('Could not save') }
    finally { setSaving(false) }
  }

  const makeChart = (label, data, color) => ({
    labels: history?.labels || [],
    datasets: [{ label, data: history?.[data] || [], fill: true, borderColor: color, backgroundColor: `${color}20`, pointBackgroundColor: color, pointRadius: 4, tension: 0.4 }]
  })

  const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { font: { family: 'Nunito', size: 10 }, color: '#9B8AAA' } }, y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: 'Nunito', size: 10 }, color: '#9B8AAA' } } } }

  return (
    <div className="page-container fade-in-up">
      <h1 className="gradient-text" style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
        📈 Recovery Progress
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '28px' }}>
        Track your healing journey step by step ❤️
      </p>

      {/* Log form + Circular bars */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '20px', color: 'var(--text-primary)' }}>Log Today</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: '💪 Recovery %', key: 'recovery_percentage', min: 0, max: 100, step: 1, unit: '%' },
              { label: '⚡ Energy Level', key: 'energy_level', min: 1, max: 10, step: 1, unit: '/10' },
              { label: '💪 Strength Level', key: 'strength_level', min: 1, max: 10, step: 1, unit: '/10' },
              { label: '🌡️ Temperature', key: 'temperature', min: 35, max: 42, step: 0.1, unit: '°C' },
              { label: '⚖️ Weight', key: 'weight', min: 30, max: 150, step: 0.5, unit: 'kg' },
              { label: '👟 Steps', key: 'steps_walked', min: 0, max: 20000, step: 100, unit: '' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>{f.label}</span>
                  <span style={{ color: 'var(--primary)' }}>{form[f.key]}{f.unit}</span>
                </label>
                <input type="range" min={f.min} max={f.max} step={f.step} value={form[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: Number(e.target.value) }))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }} />
              </div>
            ))}
            <div>
              <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Notes</label>
              <textarea className="input-glass" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} style={{ resize: 'vertical' }} placeholder="How are you feeling today?" />
            </div>
            <button onClick={saveRecovery} disabled={saving} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
              {saving ? '❤️ Saving...' : '💾 Log Recovery'}
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '24px', color: 'var(--text-primary)' }}>Today's Status</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {[
              { label: 'Recovery', value: form.recovery_percentage, max: 100, color: '#FF6B9D' },
              { label: 'Energy', value: (form.energy_level / 10) * 100, max: 100, color: '#81C784', text: `${form.energy_level}/10` },
              { label: 'Strength', value: (form.strength_level / 10) * 100, max: 100, color: '#4FC3F7', text: `${form.strength_level}/10` },
              { label: 'Temp', value: ((form.temperature - 36) / (40 - 36)) * 100, max: 100, color: form.temperature > 37.5 ? '#EF5350' : '#81C784', text: `${form.temperature}°C` },
            ].map(p => (
              <div key={p.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 80, height: 80 }}>
                  <CircularProgressbar value={Math.max(0, Math.min(100, p.value))} text={p.text || `${p.value}%`}
                    styles={buildStyles({ textSize: '18px', pathColor: p.color, textColor: p.color, trailColor: `${p.color}18`, pathTransitionDuration: 1 })} />
                </div>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.label}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(255,107,157,0.08)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>BMI</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)' }}>
              {(form.weight / (1.62 * 1.62)).toFixed(1)}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Based on 162cm height</div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      {history && history.labels.length > 0 && (
        <div className="grid-2">
          {[
            { title: '📈 Recovery %', data: 'recovery', color: '#FF6B9D' },
            { title: '🌡️ Temperature', data: 'temperature', color: '#EF5350' },
            { title: '⚡ Energy Level', data: 'energy', color: '#81C784' },
            { title: '⚖️ Weight (kg)', data: 'weight', color: '#7E57C2' },
          ].map((chart, i) => (
            <motion.div key={chart.data} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
              className="glass-card" style={{ padding: '22px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
                {chart.title}
              </h3>
              <div style={{ height: 160 }}>
                <Line data={makeChart(chart.title, chart.data, chart.color)} options={chartOpts} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
