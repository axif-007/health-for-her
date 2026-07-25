import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-toastify'
import ReactConfetti from 'react-confetti'

const ALL_ACHIEVEMENTS = [
  { title: 'First Step', description: 'Logged your first recovery entry', icon: '🌸', badge_type: 'flower', locked: false },
  { title: 'Medicine Hero', description: 'Took all medicines for a full day', icon: '💊', badge_type: 'badge', locked: true },
  { title: 'Water Champion', description: 'Reached 3L water goal', icon: '💧', badge_type: 'star', locked: true },
  { title: 'Sleep Guardian', description: 'Slept 8+ hours for 3 consecutive days', icon: '🌙', badge_type: 'star', locked: true },
  { title: 'Perfect Day', description: 'Completed all daily goals in one day', icon: '⭐', badge_type: 'star', locked: true },
  { title: 'Weekly Champion', description: 'Completed all goals for a full week', icon: '🏆', badge_type: 'badge', locked: true },
  { title: 'Happy Heart', description: 'Logged "Happy" mood 5 days in a row', icon: '😊', badge_type: 'heart', locked: true },
  { title: 'Journal Writer', description: 'Written 7 journal entries', icon: '📖', badge_type: 'badge', locked: true },
  { title: 'Recovery Streak', description: 'Logged recovery for 14 consecutive days', icon: '🔥', badge_type: 'badge', locked: true },
  { title: 'Monthly Champion', description: 'Completed all goals for a full month', icon: '👑', badge_type: 'badge', locked: true },
]

export default function Achievements() {
  const [unlocked, setUnlocked] = useState([])
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    axios.get('/api/achievements/')
      .then(r => setUnlocked(r.data))
      .catch(() => { })
  }, [])

  const unlockedTitles = new Set(unlocked.map(a => a.title))

  const isUnlocked = (title) => unlockedTitles.has(title)

  return (
    <div className="page-container fade-in-up">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={250} colors={['#FF6B9D', '#C8A2C8', '#FFB6C1', '#FFD700']} onConfettiComplete={() => setShowConfetti(false)} />}

      <h1 className="gradient-text" style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
        🏆 Achievements
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
        Every milestone is a victory ❤️
      </p>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card" style={{ padding: '20px', marginBottom: '28px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2rem', color: 'var(--primary)' }}>{unlocked.length}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unlocked</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2rem', color: '#FFD700' }}>{ALL_ACHIEVEMENTS.length - unlocked.length}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Remaining</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            {((unlocked.length / ALL_ACHIEVEMENTS.length) * 100).toFixed(0)}% Complete
          </div>
          <div className="progress-bar">
            <motion.div className="progress-fill" initial={{ width: 0 }}
              animate={{ width: `${(unlocked.length / ALL_ACHIEVEMENTS.length) * 100}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }} style={{ height: '100%' }} />
          </div>
        </div>
      </motion.div>

      {/* Achievement Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {ALL_ACHIEVEMENTS.map((achievement, i) => {
          const unlocked_item = unlocked.find(u => u.title === achievement.title)
          const isUnlock = !!unlocked_item
          return (
            <motion.div key={achievement.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02 }}
              style={{
                padding: '22px', borderRadius: 'var(--radius-lg)',
                background: isUnlock
                  ? 'linear-gradient(135deg, rgba(255,107,157,0.12), rgba(200,162,200,0.12))'
                  : 'rgba(255,255,255,0.5)',
                border: isUnlock ? '1.5px solid rgba(255,107,157,0.35)' : '1px solid rgba(200,200,200,0.3)',
                backdropFilter: 'blur(10px)',
                opacity: isUnlock ? 1 : 0.7,
                filter: isUnlock ? 'none' : 'grayscale(0.3)',
                position: 'relative', overflow: 'hidden'
              }}>
              {/* Lock overlay */}
              {!isUnlock && (
                <div style={{ position: 'absolute', top: 12, right: 12, fontSize: '1rem', opacity: 0.4 }}>🔒</div>
              )}

              <div style={{ fontSize: '2.5rem', marginBottom: '12px', filter: isUnlock ? 'none' : 'grayscale(1)' }}>
                {achievement.icon}
              </div>
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem',
                color: isUnlock ? 'var(--primary)' : 'var(--text-muted)', marginBottom: '6px'
              }}>
                {achievement.title}
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {achievement.description}
              </p>
              {isUnlock && (
                <div style={{
                  marginTop: '12px', padding: '6px 12px', background: 'rgba(255,107,157,0.15)',
                  borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '6px',
                  fontFamily: 'var(--font-heading)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--primary)'
                }}>
                  ✨ Unlocked {unlocked_item?.unlocked_at ? new Date(unlocked_item.unlocked_at).toLocaleDateString() : ''}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
