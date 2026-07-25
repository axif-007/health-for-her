import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-toastify'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function Reports() {
  const [period, setPeriod] = useState('weekly')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const reportRef = React.useRef()

  useEffect(() => { generateReport() }, [period])

  const generateReport = async () => {
    setLoading(true)
    const days = period === 'daily' ? 1 : period === 'weekly' ? 7 : 30
    try {
      const [waterRes, moodRes, medicineRes, sleepRes] = await Promise.all([
        axios.get(`/api/water/history?days=${days}`),
        axios.get(`/api/mood/history?days=${days}`),
        axios.get(`/api/medicines/stats/weekly`),
        axios.get(`/api/sleep/history?days=${days}`)
      ])
      setData({ water: waterRes.data, mood: moodRes.data, medicine: medicineRes.data, sleep: sleepRes.data })
    } catch { }
    finally { setLoading(false) }
  }

  const exportPDF = async () => {
    try {
      toast.info('📋 Generating PDF...')
      const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: '#fff' })
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgData = canvas.toDataURL('image/png')
      const w = pdf.internal.pageSize.getWidth()
      const h = (canvas.height * w) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, w, h)
      pdf.save(`Asifa-Recovery-Report-${period}-${new Date().toISOString().split('T')[0]}.pdf`)
      toast.success('✅ PDF exported successfully!')
    } catch { toast.error('PDF export failed') }
  }

  const avgWater = data?.water ? Math.round(data.water.amounts.reduce((a, b) => a + b, 0) / data.water.amounts.length) : 0
  const avgSleep = data?.sleep ? (data.sleep.hours.reduce((a, b) => a + b, 0) / data.sleep.hours.filter(h => h > 0).length || 0).toFixed(1) : 0

  return (
    <div className="page-container fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="gradient-text" style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>
            📊 Health Reports
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Your recovery summary in one place
          </p>
        </div>
        <button onClick={exportPDF} className="btn-primary">
          📄 Export PDF
        </button>
      </div>

      {/* Period tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['daily', 'weekly', 'monthly'].map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{
            padding: '8px 22px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.85rem',
            background: period === p ? 'var(--primary)' : 'rgba(255,107,157,0.1)',
            color: period === p ? 'white' : 'var(--primary)', transition: 'all 0.3s'
          }}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '3rem', animation: 'pulse-soft 1.5s infinite' }}>📊</div>
        </div>
      ) : (
        <div ref={reportRef}>
          {/* Report header */}
          <div style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(255,107,157,0.1), rgba(200,162,200,0.1))', borderRadius: 'var(--radius-lg)', marginBottom: '20px', border: '1px solid rgba(255,107,157,0.2)' }}>
            <h2 style={{ fontFamily: 'var(--font-script)', fontSize: '1.6rem', color: 'var(--primary)', marginBottom: '4px' }}>
              Asifa ❤️ – Recovery Report
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {period.charAt(0).toUpperCase() + period.slice(1)} Report • Generated {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Summary stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Avg. Water', value: `${(avgWater / 1000).toFixed(1)}L/day`, icon: '💧', color: '#4FC3F7' },
              { label: 'Avg. Sleep', value: `${avgSleep}h/night`, icon: '🌙', color: '#7E57C2' },
              { label: 'Med. Adherence', value: data?.medicine ? `${Math.round((data.medicine.taken.reduce((a, b) => a + b, 0) / (data.medicine.total_per_day * data.medicine.taken.length)) * 100)}%` : '—', icon: '💊', color: '#FF6B9D' },
            ].map(s => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="stat-card" style={{ padding: '18px' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{s.icon}</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: s.color }}>{s.value}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Water table */}
          {data?.water && (
            <div className="glass-card" style={{ padding: '22px', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: '14px', color: '#0288D1' }}>
                💧 Water Intake
              </h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {data.water.labels.map((label, i) => (
                  <div key={i} style={{ flex: '1 1 80px', padding: '10px', background: 'rgba(79,195,247,0.08)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid rgba(79,195,247,0.2)' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', color: '#0288D1' }}>{(data.water.amounts[i] / 1000).toFixed(1)}L</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mood table */}
          {data?.mood && (
            <div className="glass-card" style={{ padding: '22px', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: '14px', color: 'var(--primary)' }}>
                😊 Mood History
              </h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {data.mood.labels.map((label, i) => {
                  const moodEmojis = ['', '🤒', '😔', '😐', '😊', '😀']
                  const val = data.mood.values[i]
                  return (
                    <div key={i} style={{ flex: '1 1 60px', padding: '10px', background: 'rgba(255,107,157,0.06)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.4rem' }}>{val > 0 ? moodEmojis[val] : '—'}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Love signature */}
          <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'var(--font-script)', fontSize: '1.2rem', color: 'var(--primary)', opacity: 0.7 }}>
            Made with ❤️ for Asifa's recovery journey
          </div>
        </div>
      )}
    </div>
  )
}
