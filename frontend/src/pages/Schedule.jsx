import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ReactConfetti from 'react-confetti'
import axios from 'axios'
import { toast } from 'react-toastify'

const PERIOD_COLORS = {
  morning: { bg: 'rgba(255,224,102,0.15)', border: 'rgba(255,193,7,0.3)', color: '#F59E0B', label: '🌅 Morning' },
  day: { bg: 'rgba(79,195,247,0.12)', border: 'rgba(79,195,247,0.3)', color: '#0288D1', label: '☀️ Daytime' },
  evening: { bg: 'rgba(149,117,205,0.12)', border: 'rgba(149,117,205,0.3)', color: '#7E57C2', label: '🌙 Evening' },
}

export default function Schedule() {
  const [data, setData] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const res = await axios.get('/api/schedule/today')
      setData(res.data)
      if (res.data.percentage === 100) setShowConfetti(true)
    } catch {
      toast.error('Could not load schedule')
    } finally {
      setLoading(false)
    }
  }

  const toggleTask = async (taskId) => {
    try {
      const res = await axios.put(`/api/schedule/complete/${taskId}`)
      toast.success(res.data.is_completed ? '✅ Task completed! Great job!' : '↩️ Task unchecked')
      load()
    } catch {
      toast.error('Could not update task')
    }
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div style={{ fontSize: '2.5rem', animation: 'pulse-soft 1.5s infinite' }}>📅</div></div>

  const allDone = data?.percentage === 100
  const tasks = data?.tasks || {}

  return (
    <div className="page-container fade-in-up">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={300} colors={['#FF6B9D', '#C8A2C8', '#FFB6C1', '#E6E6FA', '#BFEFFF']} onConfettiComplete={() => setShowConfetti(false)} />}

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 className="gradient-text" style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>
          📅 Today's Schedule
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Progress summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card" style={{ padding: '22px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              Daily Progress
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {data?.completed || 0} of {data?.total || 0} tasks completed
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-heading)', fontWeight: 800,
            fontSize: '2rem', color: 'var(--primary)'
          }}>
            {data?.percentage || 0}%
          </div>
        </div>
        <div className="progress-bar" style={{ height: 14 }}>
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${data?.percentage || 0}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ height: '100%' }}
          />
        </div>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              marginTop: '16px', padding: '16px',
              background: 'linear-gradient(135deg, rgba(255,107,157,0.12), rgba(200,162,200,0.12))',
              borderRadius: 'var(--radius-md)', textAlign: 'center',
              border: '1px solid rgba(255,107,157,0.25)'
            }}>
            <p style={{ fontFamily: 'var(--font-script)', fontSize: '1.2rem', color: 'var(--primary)', lineHeight: 1.5 }}>
              🎉 Congratulations Asifa ❤️<br />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                You completed today's recovery journey. Every little step brings you closer to good health. I'm so proud of you.
              </span>
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Timeline by period */}
      {['morning', 'day', 'evening'].map(period => {
        const periodTasks = tasks[period] || []
        if (periodTasks.length === 0) return null
        const { bg, border, color, label } = PERIOD_COLORS[period]
        return (
          <motion.div key={period} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: period === 'morning' ? 0.2 : period === 'day' ? 0.3 : 0.4 }}
            className="glass-card" style={{ marginBottom: '20px', padding: '22px', background: bg, border: `1px solid ${border}` }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color, marginBottom: '16px' }}>
              {label}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {periodTasks.map((task, i) => (
                <motion.div key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px 16px',
                    background: task.is_completed ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)',
                    borderRadius: 'var(--radius-md)',
                    border: task.is_completed ? '1.5px solid rgba(255,107,157,0.3)' : '1px solid rgba(255,255,255,0.5)',
                    transition: 'all 0.3s ease',
                    opacity: task.is_completed ? 0.85 : 1,
                  }}>
                  {/* Checkbox */}
                  <button onClick={() => toggleTask(task.id)} style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${task.is_completed ? 'var(--primary)' : color}`,
                    background: task.is_completed ? 'var(--primary)' : 'transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s ease', fontSize: '0.9rem'
                  }}>
                    {task.is_completed ? '✓' : ''}
                  </button>
                  {/* Icon */}
                  <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{task.icon}</span>
                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.92rem',
                      color: task.is_completed ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: task.is_completed ? 'line-through' : 'none'
                    }}>
                      {task.title}
                    </div>
                    {task.description && (
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.77rem', color: 'var(--text-muted)' }}>
                        {task.description}
                      </div>
                    )}
                  </div>
                  {/* Time */}
                  <div style={{
                    fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.8rem',
                    color, background: `${color}18`, padding: '4px 10px', borderRadius: 'var(--radius-full)',
                    flexShrink: 0
                  }}>
                    {task.time_label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
