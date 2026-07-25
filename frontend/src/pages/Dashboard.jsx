import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler)

const MOOD_EMOJIS = { excellent: '😀', happy: '😊', normal: '😐', sad: '😔', weak: '🤒' }
const MOOD_COLORS = { excellent: '#4FC3F7', happy: '#81C784', normal: '#FFD54F', sad: '#FF8A65', weak: '#EF5350' }

function StatCard({ icon, label, value, sub, color, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="stat-card"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-heading)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
          <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: color || 'var(--text-primary)', marginTop: '4px', lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-body)' }}>{sub}</div>}
        </div>
        <div style={{
          width: 46, height: 46, borderRadius: '14px',
          background: `linear-gradient(135deg, ${color || 'var(--primary)'}22, ${color || 'var(--primary)'}44)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem'
        }}>
          {icon}
        </div>
      </div>
      {children}
    </motion.div>
  )
}

function MiniProgressBar({ value, color = 'var(--primary)' }) {
  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${Math.min(100, value)}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [waterHistory, setWaterHistory] = useState(null)
  const [moodHistory, setMoodHistory] = useState(null)
  const [fitMetrics, setFitMetrics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    try {
      const [statsRes, waterRes, moodRes, fitRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/water/history?days=7'),
        axios.get('/api/mood/history?days=7'),
        user?.google_fit_refresh_token ? axios.get('/api/fit/metrics') : Promise.resolve({ data: [] })
      ])
      setStats(statsRes.data)
      setWaterHistory(waterRes.data)
      setMoodHistory(moodRes.data)
      setFitMetrics(fitRes.data)
    } catch (err) {
      toast.error('Could not load dashboard data. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '3rem', animation: 'pulse-soft 1.5s ease infinite' }}>❤️</div>
      <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>Loading your health data...</p>
    </div>
  )

  const waterPct = stats ? Math.min(100, (stats.water_today_ml / stats.water_goal_ml) * 100) : 0
  const medPct = stats ? (stats.medicines_total > 0 ? (stats.medicines_taken / stats.medicines_total) * 100 : 0) : 0
  const todayFit = fitMetrics && fitMetrics.length > 0 ? fitMetrics[0] : null

  const waterChartData = waterHistory ? {
    labels: waterHistory.labels,
    datasets: [{
      label: 'Water (ml)',
      data: waterHistory.amounts,
      fill: true,
      borderColor: '#4FC3F7',
      backgroundColor: 'rgba(79,195,247,0.15)',
      pointBackgroundColor: '#4FC3F7',
      pointRadius: 5,
      tension: 0.4,
    }]
  } : null

  const moodChartData = moodHistory ? {
    labels: moodHistory.labels,
    datasets: [{
      label: 'Mood Level',
      data: moodHistory.values,
      fill: true,
      borderColor: 'var(--primary)',
      backgroundColor: 'rgba(255,107,157,0.12)',
      pointBackgroundColor: 'var(--primary)',
      pointRadius: 5,
      tension: 0.4,
    }]
  } : null

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Nunito', size: 11 }, color: '#9B8AAA' } },
      y: { grid: { color: 'rgba(255,107,157,0.06)' }, ticks: { font: { family: 'Nunito', size: 11 }, color: '#9B8AAA' } }
    }
  }

  return (
    <div className="page-container fade-in-up">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '28px' }}
      >
        <h1 style={{ fontFamily: 'var(--font-script)', fontSize: '2.2rem', color: 'var(--primary)', lineHeight: 1.2 }}>
          {stats?.greeting || 'Good Morning'}, {user?.full_name || 'Asifa'} ❤️
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          {stats?.date} • {stats?.time}
        </p>

        {/* Daily Quote */}
        {stats?.daily_quote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              marginTop: '14px', padding: '14px 20px',
              background: 'rgba(255,107,157,0.08)',
              border: '1px solid rgba(255,107,157,0.18)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-body)', fontStyle: 'italic',
              color: 'var(--text-secondary)', fontSize: '0.9rem',
              borderLeft: '4px solid var(--primary)',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}
          >
            <span>✨</span>
            <span>"{stats.daily_quote}"</span>
          </motion.div>
        )}

        {/* Love message */}
        {stats?.love_message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              marginTop: '10px', padding: '12px 18px',
              background: 'linear-gradient(135deg, rgba(255,107,157,0.12), rgba(200,162,200,0.12))',
              border: '1px solid rgba(255,107,157,0.2)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-body)',
              color: 'var(--primary)', fontSize: '0.88rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            ❤️ {stats.love_message}
          </motion.div>
        )}
      </motion.div>

      {/* Top Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        {/* Recovery */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 20px' }}>
          <div style={{ width: 100, height: 100, marginBottom: '12px' }}>
            <CircularProgressbar
              value={stats?.recovery_percentage || 65}
              text={`${stats?.recovery_percentage || 65}%`}
              styles={buildStyles({
                textSize: '18px',
                pathColor: 'url(#recoveryGradient)',
                textColor: 'var(--primary)',
                trailColor: 'rgba(255,107,157,0.1)',
                pathTransitionDuration: 1.5,
              })}
            />
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Recovery Progress
          </div>
        </motion.div>

        {/* Health Score */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="stat-card"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 20px' }}>
          <div style={{ width: 100, height: 100, marginBottom: '12px' }}>
            <CircularProgressbar
              value={stats?.health_score || 0}
              maxValue={100}
              text={`${(stats?.health_score || 0).toFixed(0)}`}
              styles={buildStyles({
                textSize: '22px',
                pathColor: '#81C784',
                textColor: '#4CAF50',
                trailColor: 'rgba(129,199,132,0.12)',
                pathTransitionDuration: 1.5,
              })}
            />
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Health Score
          </div>
        </motion.div>

        {/* Water */}
        <StatCard icon="💧" label="Water Today" value={`${((stats?.water_today_ml || 0) / 1000).toFixed(1)}L`}
          sub={`Goal: ${((stats?.water_goal_ml || 3000) / 1000).toFixed(0)}L`} color="#4FC3F7" delay={0.2}>
          <MiniProgressBar value={waterPct} color="#4FC3F7" />
          <div style={{ fontSize: '0.72rem', color: '#4FC3F7', marginTop: '6px', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
            {waterPct.toFixed(0)}% of goal
          </div>
        </StatCard>

        {/* Medicines */}
        <StatCard icon="💊" label="Medicine" value={`${stats?.medicines_taken || 0}/${stats?.medicines_total || 0}`}
          sub="Doses today" color="var(--primary)" delay={0.25}>
          <MiniProgressBar value={medPct} color="var(--primary)" />
        </StatCard>

        {/* Google Fit Stats */}
        {user?.google_fit_refresh_token && (
          <>
            <StatCard icon="👣" label="Steps" value={todayFit?.steps || 0}
              sub="Today via Google Fit" color="#F59E0B" delay={0.3} />
            
            <StatCard icon="🔥" label="Calories" value={todayFit?.calories ? todayFit.calories.toFixed(0) : 0}
              sub="Kcal burned" color="#EF4444" delay={0.35} />
              
            <StatCard icon="🏃‍♀️" label="Active" value={`${todayFit?.active_minutes || 0}m`}
              sub="Activity time" color="#8B5CF6" delay={0.4} />
          </>
        )}

        {/* Mood */}
        <StatCard icon={MOOD_EMOJIS[stats?.mood_today] || '😐'} label="Mood Today"
          value={stats?.mood_today ? stats.mood_today.charAt(0).toUpperCase() + stats.mood_today.slice(1) : '—'}
          color={MOOD_COLORS[stats?.mood_today] || '#FFD54F'} delay={0.3} />

        {/* Sleep */}
        <StatCard icon="🌙" label="Sleep" value={stats?.sleep_hours ? `${stats.sleep_hours}h` : '—'}
          sub="Last night" color="#7E57C2" delay={0.35} />

        {/* Calories */}
        <StatCard icon="🔥" label="Calories" value={stats?.calories_today ? `${stats.calories_today.toFixed(0)}` : '—'}
          sub="kcal today" color="#FF8A65" delay={0.4} />

        {/* Steps */}
        <StatCard icon="👟" label="Steps" value={stats?.steps_today?.toLocaleString() || '—'}
          sub="walked today" color="#66BB6A" delay={0.45} />
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Water chart */}
        {waterChartData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="glass-card" style={{ padding: '22px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              💧 Weekly Water Intake
            </h3>
            <div style={{ height: 180 }}>
              <Line data={waterChartData} options={chartOptions} />
            </div>
          </motion.div>
        )}

        {/* Mood chart */}
        {moodChartData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            className="glass-card" style={{ padding: '22px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              😊 Weekly Mood Trend
            </h3>
            <div style={{ height: 180 }}>
              <Line data={moodChartData} options={{ ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, min: 0, max: 5, ticks: { ...chartOptions.scales.y.ticks, stepSize: 1 } } } }} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="glass-card" style={{ padding: '22px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
          ⚡ Quick Actions
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { label: 'Log Water', icon: '💧', href: '/water', color: '#4FC3F7' },
            { label: 'Take Medicine', icon: '💊', href: '/medicines', color: 'var(--primary)' },
            { label: 'Log Mood', icon: '😊', href: '/mood', color: '#FFD54F' },
            { label: 'Today\'s Schedule', icon: '📅', href: '/schedule', color: '#9C27B0' },
            { label: 'Write Journal', icon: '📖', href: '/journal', color: '#FF8A65' },
            { label: 'AI Assistant', icon: '🤖', href: '/ai-assistant', color: '#00BCD4' },
          ].map(a => (
            <a key={a.label} href={a.href} className="btn-glass" style={{ border: `1.5px solid ${a.color}33`, color: a.color }}>
              <span>{a.icon}</span>
              <span style={{ fontSize: '0.85rem' }}>{a.label}</span>
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
