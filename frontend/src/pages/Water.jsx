import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const GLASS_AMOUNTS = [150, 200, 250, 300, 500]

export default function Water() {
  const [data, setData] = useState(null)
  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [customAmount, setCustomAmount] = useState(250)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    try {
      const [todayRes, histRes] = await Promise.all([
        axios.get('/api/water/today'),
        axios.get('/api/water/history?days=7')
      ])
      setData(todayRes.data)
      setHistory(histRes.data)
    } catch { toast.error('Could not load water data') }
    finally { setLoading(false) }
  }

  const addWater = async (amount) => {
    setAdding(true)
    try {
      await axios.post('/api/water/add', { date: new Date().toISOString().split('T')[0], amount_ml: amount })
      toast.success(`💧 +${amount}ml logged! Keep hydrating, beautiful!`)
      loadAll()
    } catch { toast.error('Could not log water') }
    finally { setAdding(false) }
  }

  const pct = data ? Math.min(100, (data.total_ml / data.goal_ml) * 100) : 0
  const fillHeight = `${pct}%`

  const chartData = history ? {
    labels: history.labels,
    datasets: [{
      label: 'Water (ml)', data: history.amounts,
      fill: true, borderColor: '#4FC3F7',
      backgroundColor: 'rgba(79,195,247,0.15)',
      pointBackgroundColor: '#4FC3F7', pointRadius: 5, tension: 0.4
    }]
  } : null

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div style={{ fontSize: '3rem', animation: 'pulse-soft 1.5s infinite' }}>💧</div></div>

  return (
    <div className="page-container fade-in-up">
      <h1 className="gradient-text" style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>💧 Water Tracker</h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '28px' }}>
        Stay hydrated, stay healthy ❤️ Goal: {((data?.goal_ml || 3000) / 1000).toFixed(0)}L daily
      </p>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Water Bottle */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 120, height: 280, marginBottom: '20px' }}>
            {/* Bottle outline */}
            <div style={{
              width: '100%', height: '100%',
              border: '3px solid rgba(79,195,247,0.5)',
              borderRadius: '20px 20px 28px 28px',
              overflow: 'hidden', background: 'rgba(240,248,255,0.8)',
              position: 'relative'
            }}>
              {/* Water fill */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: fillHeight }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(180deg, rgba(79,195,247,0.6), rgba(3,155,229,0.8))',
                  borderRadius: '0 0 26px 26px',
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '6px'
                }}
              >
                {pct > 15 && (
                  <span style={{ fontSize: '0.75rem', color: 'white', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                    {pct.toFixed(0)}%
                  </span>
                )}
              </motion.div>
              {/* Bottle level marks */}
              {[25, 50, 75].map(p => (
                <div key={p} style={{
                  position: 'absolute', bottom: `${p}%`, left: '8px', right: '8px',
                  height: 1, background: 'rgba(79,195,247,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '4px'
                }}>
                  <span style={{ fontSize: '0.6rem', color: 'rgba(79,195,247,0.7)', fontFamily: 'var(--font-heading)' }}>{p}%</span>
                </div>
              ))}
            </div>
            {/* Bottle cap */}
            <div style={{
              position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
              width: 50, height: 20, background: 'rgba(79,195,247,0.6)',
              borderRadius: '8px 8px 0 0'
            }} />
          </div>

          {/* Stats */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2rem', color: '#0288D1' }}>
              {((data?.total_ml || 0) / 1000).toFixed(2)}L
            </div>
            <div style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              of {((data?.goal_ml || 3000) / 1000).toFixed(0)}L goal
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#4FC3F7', marginTop: '6px', fontWeight: 600 }}>
              🥃 {data?.glasses || 0} glasses drunk
            </div>
            {pct >= 100 && (
              <div style={{ marginTop: '10px', fontFamily: 'var(--font-script)', color: 'var(--primary)', fontSize: '1rem' }}>
                🎉 Goal Complete! Amazing Asifa!
              </div>
            )}
          </div>
        </motion.div>

        {/* Add Water */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '20px', color: 'var(--text-primary)' }}>
            ➕ Log Water Intake
          </h3>

          {/* Quick amounts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
            {GLASS_AMOUNTS.map(amt => (
              <button key={amt} onClick={() => addWater(amt)} disabled={adding}
                className="btn-glass"
                style={{ flexDirection: 'column', padding: '14px 8px', gap: '6px',
                  border: '1.5px solid rgba(79,195,247,0.4)', color: '#0288D1' }}>
                <span style={{ fontSize: '1.4rem' }}>💧</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{amt}ml</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{amt >= 250 ? 'Glass' : 'Sip'}</span>
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Custom Amount (ml)
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input className="input-glass" type="number" min={50} max={2000} step={50}
                value={customAmount} onChange={e => setCustomAmount(Number(e.target.value))}
                style={{ flex: 1 }} />
              <button onClick={() => addWater(customAmount)} disabled={adding} className="btn-primary" style={{ padding: '12px 20px' }}>
                +
              </button>
            </div>
          </div>

          {/* Reminder note */}
          <div style={{
            padding: '14px', background: 'rgba(79,195,247,0.08)',
            borderRadius: 'var(--radius-md)', border: '1px solid rgba(79,195,247,0.2)',
            fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#0288D1'
          }}>
            💕 "Drink some water, beautiful. Every sip is healing."
          </div>
        </motion.div>
      </div>

      {/* History chart */}
      {chartData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
            📈 Weekly Water History
          </h3>
          <div style={{ height: 220 }}>
            <Line data={chartData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false }, ticks: { font: { family: 'Nunito', size: 11 }, color: '#9B8AAA' } },
                y: { beginAtZero: true, grid: { color: 'rgba(79,195,247,0.1)' }, ticks: { font: { family: 'Nunito', size: 11 }, color: '#9B8AAA' } }
              }
            }} />
          </div>
        </motion.div>
      )}
    </div>
  )
}
