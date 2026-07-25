import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const QUOTES = [
  { text: "Every step forward is a step toward healing.", emoji: "🌸" },
  { text: "Your strength is greater than your struggle.", emoji: "💪" },
  { text: "Allah is with you, and so am I.", emoji: "🤲" },
  { text: "Healing is a journey, not a destination.", emoji: "✨" },
  { text: "You are loved more than words can say.", emoji: "❤️" },
  { text: "إِنَّ مَعَ الْعُسْرِ يُسْرًا — With hardship comes ease.", emoji: "🌟" },
]

const HEARTS_CONFIG = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  size: `${0.8 + Math.random() * 1.4}rem`,
  duration: `${6 + Math.random() * 10}s`,
  delay: `${Math.random() * 12}s`,
  symbol: ['❤️', '🩷', '💕', '💗', '🌸', '✨'][Math.floor(Math.random() * 6)]
}))

export default function Landing() {
  const navigate = useNavigate()
  const [quoteIndex, setQuoteIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % QUOTES.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFE4F0 0%, #F0E6FF 35%, #E6F0FF 65%, #FFE4F7 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      padding: '20px'
    }}>
      {/* Animated background blobs */}
      <div style={{
        position: 'absolute', top: '-100px', left: '-100px',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(255,107,157,0.18), transparent 70%)',
        borderRadius: '50%', animation: 'pulse-soft 4s ease infinite'
      }} />
      <div style={{
        position: 'absolute', bottom: '-80px', right: '-80px',
        width: 350, height: 350,
        background: 'radial-gradient(circle, rgba(200,162,200,0.2), transparent 70%)',
        borderRadius: '50%', animation: 'pulse-soft 5s ease infinite 1s'
      }} />

      {/* Floating hearts */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {HEARTS_CONFIG.map(h => (
          <div key={h.id} className="floating-heart"
            style={{ left: h.left, fontSize: h.size, animationDuration: h.duration, animationDelay: h.delay }}>
            {h.symbol}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ textAlign: 'center', position: 'relative', zIndex: 2, maxWidth: 680 }}
      >
        {/* Logo / Hero Illustration */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
          style={{ fontSize: '6rem', marginBottom: '20px', display: 'block', lineHeight: 1 }}
        >
          🌸
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            fontFamily: 'var(--font-script)',
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            background: 'linear-gradient(135deg, #FF6B9D, #B76E79, #C8A2C8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px',
            lineHeight: 1.2
          }}
        >
          Asifa ❤️
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            fontFamily: 'var(--font-heading)', fontWeight: 500,
            fontSize: '1.1rem', color: 'var(--text-secondary)',
            marginBottom: '32px', letterSpacing: '0.5px'
          }}
        >
          My Recovery Companion
        </motion.p>

        {/* Quote Slider */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,107,157,0.25)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px 36px',
            marginBottom: '40px',
            boxShadow: '0 8px 40px rgba(255,107,157,0.15)',
            minHeight: '120px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center'
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={quoteIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>
                {QUOTES[quoteIndex].emoji}
              </div>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '1.05rem',
                color: 'var(--text-primary)', fontWeight: 500,
                fontStyle: 'italic', lineHeight: 1.6
              }}>
                "{QUOTES[quoteIndex].text}"
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '16px' }}>
            {QUOTES.map((_, i) => (
              <div key={i} onClick={() => setQuoteIndex(i)} style={{
                width: i === quoteIndex ? 24 : 8, height: 8,
                borderRadius: 4,
                background: i === quoteIndex ? 'var(--primary)' : 'rgba(255,107,157,0.25)',
                transition: 'all 0.3s ease', cursor: 'pointer'
              }} />
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{
            display: 'flex', gap: '12px', justifyContent: 'center',
            flexWrap: 'wrap', marginBottom: '40px'
          }}
        >
          {[
            { icon: '💊', label: 'Medicine Tracker' },
            { icon: '💧', label: 'Water Tracker' },
            { icon: '📈', label: 'Recovery' },
            { icon: '😊', label: 'Mood Tracker' },
            { icon: '📖', label: 'Journal' },
            { icon: '🏆', label: 'Achievements' },
          ].map(f => (
            <div key={f.label} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,107,157,0.2)',
              borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-body)', fontSize: '0.8rem',
              color: 'var(--text-secondary)', fontWeight: 600,
              backdropFilter: 'blur(8px)'
            }}>
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0, type: 'spring', stiffness: 200 }}
        >
          <button
            onClick={() => navigate('/login')}
            className="btn-primary pulse-soft"
            style={{ fontSize: '1.05rem', padding: '16px 40px', gap: '10px' }}
          >
            <span>Start Your Recovery Journey</span>
            <span>❤️</span>
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{
            marginTop: '20px', fontFamily: 'var(--font-body)',
            fontSize: '0.85rem', color: 'var(--text-muted)'
          }}
        >
          Made with ❤️ just for you, Asifa
        </motion.p>
      </motion.div>

      {/* Animated clouds */}
      {[{ top: '8%', left: '-5%', delay: 0 }, { top: '12%', right: '-5%', delay: 5 }, { top: '5%', left: '40%', delay: 2.5 }].map((c, i) => (
        <motion.div
          key={i}
          animate={{ x: [0, 30, 0] }}
          transition={{ duration: 12 + i * 3, ease: 'easeInOut', repeat: Infinity, delay: c.delay }}
          style={{
            position: 'absolute', fontSize: 'clamp(2rem, 4vw, 3rem)',
            opacity: 0.5, ...c, pointerEvents: 'none'
          }}
        >
          ☁️
        </motion.div>
      ))}
    </div>
  )
}
