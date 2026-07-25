import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'

const MOTIVATIONAL_QUOTES = [
  "Every morning is a fresh start ❤️",
  "Your recovery is our priority 🌸",
  "Healing takes time — be patient 🤲",
  "You are stronger than you think 💪",
  "Allah is with you always 🌟",
]

function TypingText({ texts, speed = 80 }) {
  const [displayed, setDisplayed] = useState('')
  const [textIdx, setTextIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = texts[textIdx]
    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplayed(current.substring(0, charIdx + 1))
        if (charIdx + 1 === current.length) {
          setTimeout(() => setDeleting(true), 1800)
        } else {
          setCharIdx(c => c + 1)
        }
      } else {
        setDisplayed(current.substring(0, charIdx - 1))
        if (charIdx - 1 === 0) {
          setDeleting(false)
          setTextIdx(i => (i + 1) % texts.length)
          setCharIdx(0)
        } else {
          setCharIdx(c => c - 1)
        }
      }
    }, deleting ? speed / 2 : speed)
    return () => clearTimeout(timeout)
  }, [charIdx, deleting, textIdx, texts, speed])

  return (
    <span>
      {displayed}
      <span style={{ animation: 'pulse-soft 1s ease infinite', color: 'var(--primary)' }}>|</span>
    </span>
  )
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      toast.error('Please enter your credentials 🌸')
      return
    }
    setLoading(true)
    try {
      await login(form.username, form.password)
      toast.success('Welcome back, Asifa ❤️ So happy to see you!')
      navigate('/dashboard')
    } catch (err) {
      toast.error('Incorrect credentials. Please try again 💕')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFE4F0 0%, #F0E6FF 40%, #E6F0FF 70%, #FFE4F7 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative', overflow: 'hidden'
    }}>
      {/* Background blobs */}
      <div style={{ position: 'absolute', top: '-120px', left: '-120px', width: 450, height: 450, background: 'radial-gradient(circle, rgba(255,107,157,0.15), transparent 70%)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: 380, height: 380, background: 'radial-gradient(circle, rgba(200,162,200,0.18), transparent 70%)', borderRadius: '50%' }} />

      {/* Floating hearts */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {Array.from({ length: 14 }, (_, i) => (
          <div key={i} className="floating-heart" style={{
            left: `${Math.random() * 100}%`,
            fontSize: `${0.8 + Math.random() * 1.2}rem`,
            animationDuration: `${8 + Math.random() * 10}s`,
            animationDelay: `${Math.random() * 12}s`
          }}>
            {['❤️', '🩷', '💕', '🌸'][Math.floor(Math.random() * 4)]}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '60px', alignItems: 'center', width: '100%', maxWidth: 1000, position: 'relative', zIndex: 2 }}>
        {/* Left illustration */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          style={{ flex: 1, textAlign: 'center', display: 'none' }}
          className="login-illustration"
        >
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
            style={{ fontSize: '8rem', lineHeight: 1, marginBottom: '24px' }}
          >
            🌸
          </motion.div>
          <h2 style={{ fontFamily: 'var(--font-script)', fontSize: '2rem', color: 'var(--primary)', marginBottom: '12px' }}>
            Your healing journey awaits
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
            Every day is a new opportunity<br />to get stronger. We're here for you.
          </p>
        </motion.div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{
            flex: 1, maxWidth: 440, margin: '0 auto',
            background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,107,157,0.25)',
            borderRadius: '28px',
            padding: '44px 40px',
            boxShadow: '0 20px 60px rgba(255,107,157,0.18), 0 8px 20px rgba(0,0,0,0.06)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 3 }}
              style={{ fontSize: '3rem', marginBottom: '12px' }}
            >
              ❤️
            </motion.div>
            <h1 style={{
              fontFamily: 'var(--font-script)',
              fontSize: '2rem',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', marginBottom: '8px'
            }}>
              Welcome Back Asifa ❤️
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.9rem',
              color: 'var(--text-muted)', minHeight: '22px'
            }}>
              <TypingText texts={MOTIVATIONAL_QUOTES} />
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Username */}
            <div>
              <label style={{
                display: 'block', fontFamily: 'var(--font-heading)', fontSize: '0.85rem',
                fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '7px'
              }}>
                👤 Username
              </label>
              <input
                id="login-username"
                className="input-glass"
                type="text"
                placeholder="asifa"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: 'block', fontFamily: 'var(--font-heading)', fontSize: '0.85rem',
                fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '7px'
              }}>
                🔒 Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  className="input-glass"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem'
                  }}
                >
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Remember me + forgot */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <input type="checkbox" style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
                Remember me
              </label>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
                Forgot Password?
              </span>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              id="login-submit"
              className="btn-primary"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%', justifyContent: 'center',
                padding: '15px', fontSize: '1rem',
                opacity: loading ? 0.8 : 1
              }}
            >
              {loading ? (
                <>
                  <span style={{ animation: 'pulse-soft 1s ease infinite' }}>❤️</span>
                  Logging you in...
                </>
              ) : (
                <>❤️ Login to Your Recovery Journey</>
              )}
            </motion.button>
          </form>

          {/* Bottom hint */}
          <div style={{
            marginTop: '24px', textAlign: 'center',
            padding: '14px', background: 'rgba(255,107,157,0.07)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--text-muted)'
          }}>
            💕 This app is made exclusively for you, with love.
          </div>
        </motion.div>
      </div>

      {/* Animated clouds */}
      {[{ top: '6%', left: '-3%' }, { top: '10%', right: '-3%' }].map((c, i) => (
        <motion.div key={i} animate={{ x: [0, 25, 0] }} transition={{ duration: 10 + i * 4, ease: 'easeInOut', repeat: Infinity }}
          style={{ position: 'absolute', fontSize: '2.5rem', opacity: 0.4, pointerEvents: 'none', ...c }}>
          ☁️
        </motion.div>
      ))}
    </div>
  )
}
