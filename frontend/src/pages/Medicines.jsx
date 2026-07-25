import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const TIME_COLORS = { morning: '#FF8F00', afternoon: '#4FC3F7', night: '#7E57C2' }
const TIME_ICONS = { morning: '🌅', afternoon: '☀️', night: '🌙' }

export default function Medicines() {
  const [medicines, setMedicines] = useState([])
  const [todayLogs, setTodayLogs] = useState([])
  const [weeklyStats, setWeeklyStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', dosage: '', instructions: '', time_of_day: 'morning', reminder_time: '' })
  const [activeTab, setActiveTab] = useState('today')

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    try {
      const [logsRes, statsRes] = await Promise.all([
        axios.get('/api/medicines/logs/today'),
        axios.get('/api/medicines/stats/weekly')
      ])
      setTodayLogs(logsRes.data)
      setWeeklyStats(statsRes.data)
      const medsRes = await axios.get('/api/medicines/')
      setMedicines(medsRes.data)
    } catch { toast.error('Could not load medicine data') }
    finally { setLoading(false) }
  }

  const takeMedicine = async (medicineId, name) => {
    try {
      await axios.post(`/api/medicines/logs/take/${medicineId}`)
      toast.success(`💊 ${name} marked as taken! ❤️`)
      loadAll()
    } catch { toast.error('Could not mark medicine') }
  }

  const addMedicine = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/medicines/', form)
      toast.success('✅ Medicine added!')
      setShowForm(false)
      setForm({ name: '', dosage: '', instructions: '', time_of_day: 'morning', reminder_time: '' })
      loadAll()
    } catch { toast.error('Could not add medicine') }
  }

  const deleteMedicine = async (id, name) => {
    try {
      await axios.delete(`/api/medicines/${id}`)
      toast.success(`❌ ${name} removed`)
      loadAll()
    } catch { toast.error('Could not remove medicine') }
  }

  const groupByTime = (logs) => {
    const g = { morning: [], afternoon: [], night: [] }
    logs.forEach(l => {
      const time = l.medicine?.time_of_day || 'morning'
      if (g[time]) g[time].push(l)
    })
    return g
  }

  const grouped = groupByTime(todayLogs)

  const chartData = weeklyStats ? {
    labels: weeklyStats.labels,
    datasets: [
      { label: 'Taken', data: weeklyStats.taken, backgroundColor: 'rgba(255,107,157,0.7)', borderRadius: 8, borderSkipped: false },
      { label: 'Total', data: weeklyStats.taken.map(() => weeklyStats.total_per_day), backgroundColor: 'rgba(255,107,157,0.15)', borderRadius: 8, borderSkipped: false }
    ]
  } : null

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div style={{ fontSize: '2.5rem', animation: 'pulse-soft 1.5s infinite' }}>💊</div></div>

  return (
    <div className="page-container fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="gradient-text" style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>
            💊 Medicine Tracker
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Track your daily medicines with love and care</p>
        </div>
        <button onClick={() => setShowForm(p => !p)} className="btn-primary">
          {showForm ? '✕ Close' : '+ Add Medicine'}
        </button>
      </div>

      {/* Add Medicine Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '16px', color: 'var(--primary)' }}>➕ Add New Medicine</h3>
          <form onSubmit={addMedicine} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Medicine Name *</label>
              <input className="input-glass" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Paracetamol 500mg" required />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Dosage</label>
              <input className="input-glass" value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} placeholder="e.g., 1 tablet" />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Time of Day</label>
              <select className="input-glass" value={form.time_of_day} onChange={e => setForm(f => ({ ...f, time_of_day: e.target.value }))}>
                <option value="morning">🌅 Morning</option>
                <option value="afternoon">☀️ Afternoon</option>
                <option value="night">🌙 Night</option>
              </select>
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Instructions</label>
              <input className="input-glass" value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} placeholder="e.g., After meals" />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn-glass">Cancel</button>
              <button type="submit" className="btn-primary">💊 Add Medicine</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['today', 'medicines', 'stats'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 20px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.85rem',
            background: activeTab === tab ? 'var(--primary)' : 'rgba(255,107,157,0.1)',
            color: activeTab === tab ? 'white' : 'var(--primary)',
            transition: 'all 0.3s ease'
          }}>
            {tab === 'today' ? "📋 Today's Doses" : tab === 'medicines' ? '💊 My Medicines' : '📊 Weekly Stats'}
          </button>
        ))}
      </div>

      {/* Today Tab */}
      {activeTab === 'today' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {['morning', 'afternoon', 'night'].map(period => {
            const logs = grouped[period]
            const color = TIME_COLORS[period]
            const icon = TIME_ICONS[period]
            return (
              <motion.div key={period} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {icon} {period.charAt(0).toUpperCase() + period.slice(1)} Medicines
                  <span style={{ background: `${color}22`, color, padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem' }}>
                    {logs.filter(l => l.taken).length}/{logs.length} taken
                  </span>
                </h3>
                {logs.length === 0 ? (
                  <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '0.88rem', fontStyle: 'italic' }}>
                    No medicines for {period}
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {logs.map(log => (
                      <div key={log.medicine?.id} style={{
                        display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
                        background: log.taken ? 'rgba(255,107,157,0.05)' : 'rgba(255,255,255,0.6)',
                        borderRadius: 'var(--radius-md)',
                        border: log.taken ? '1.5px solid rgba(255,107,157,0.25)' : '1px solid rgba(255,255,255,0.5)',
                        opacity: log.taken ? 0.8 : 1
                      }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                          background: log.taken ? 'rgba(255,107,157,0.15)' : `${color}15`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                        }}>
                          {log.taken ? '✅' : '💊'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                            {log.medicine?.name}
                          </div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.77rem', color: 'var(--text-muted)' }}>
                            {log.medicine?.dosage} {log.medicine?.instructions ? `• ${log.medicine?.instructions}` : ''}
                          </div>
                          {log.taken_at && (
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--primary)', marginTop: '2px' }}>
                              ✓ Taken at {new Date(log.taken_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                        {!log.taken && (
                          <button onClick={() => takeMedicine(log.medicine?.id, log.medicine?.name)} className="btn-primary"
                            style={{ padding: '8px 18px', fontSize: '0.8rem' }}>
                            Mark Taken ✓
                          </button>
                        )}
                        {log.taken && (
                          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.8rem', color: 'var(--primary)' }}>
                            ❤️ Done
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* All Medicines Tab */}
      {activeTab === 'medicines' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {medicines.length === 0 ? (
            <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💊</div>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}>No medicines added yet. Click "Add Medicine" to get started.</p>
            </div>
          ) : medicines.map(med => (
            <motion.div key={med.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card"
              style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
                background: `${TIME_COLORS[med.time_of_day]}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem'
              }}>
                {TIME_ICONS[med.time_of_day]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{med.name}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {med.dosage && `${med.dosage} • `}{med.instructions} • {med.time_of_day}
                </div>
              </div>
              <button onClick={() => deleteMedicine(med.id, med.name)} style={{
                border: 'none', background: 'rgba(239,83,80,0.1)', color: '#EF5350',
                borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'var(--font-heading)', fontWeight: 600
              }}>Remove</button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && weeklyStats && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>
            📊 Weekly Medicine Adherence
          </h3>
          <div style={{ height: 250 }}>
            <Bar data={chartData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { position: 'top', labels: { font: { family: 'Nunito', size: 11 } } } },
              scales: {
                x: { grid: { display: false }, ticks: { font: { family: 'Nunito', size: 11 } } },
                y: { beginAtZero: true, grid: { color: 'rgba(255,107,157,0.06)' }, ticks: { font: { family: 'Nunito', size: 11 }, stepSize: 1 } }
              }
            }} />
          </div>
        </motion.div>
      )}
    </div>
  )
}
