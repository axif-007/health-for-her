import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'

// ── Breathing Techniques ────────────────────────────────────────────────────
const TECHNIQUES = [
  {
    id: 'box',
    name: 'Box Breathing',
    emoji: '🟦',
    description: 'Used by Navy SEALs for stress & focus. Perfect for anxiety relief.',
    color: '#6C63FF',
    gradient: 'linear-gradient(135deg, #6C63FF, #48CAE4)',
    phases: [
      { label: 'Inhale',    duration: 4, color: '#6C63FF' },
      { label: 'Hold',      duration: 4, color: '#48CAE4' },
      { label: 'Exhale',    duration: 4, color: '#FF6B9D' },
      { label: 'Hold',      duration: 4, color: '#C8A2C8' },
    ],
    benefit: 'Calms nervous system instantly',
    totalCycle: 16,
  },
  {
    id: '478',
    name: '4-7-8 Breathing',
    emoji: '🌙',
    description: 'The "natural tranquilizer" — helps with sleep and deep relaxation.',
    color: '#7B4F9E',
    gradient: 'linear-gradient(135deg, #7B4F9E, #E91E8C)',
    phases: [
      { label: 'Inhale',    duration: 4,  color: '#7B4F9E' },
      { label: 'Hold',      duration: 7,  color: '#E91E8C' },
      { label: 'Exhale',    duration: 8,  color: '#FF6B9D' },
    ],
    benefit: 'Promotes deep sleep & calm',
    totalCycle: 19,
  },
  {
    id: 'belly',
    name: 'Belly Breathing',
    emoji: '🌸',
    description: 'Diaphragmatic breathing for recovery, healing, and full body relaxation.',
    color: '#FF6B9D',
    gradient: 'linear-gradient(135deg, #FF6B9D, #FFB6C1)',
    phases: [
      { label: 'Inhale',    duration: 5, color: '#FF6B9D' },
      { label: 'Hold',      duration: 2, color: '#C8A2C8' },
      { label: 'Exhale',    duration: 6, color: '#B76E79' },
    ],
    benefit: 'Speeds up healing & recovery',
    totalCycle: 13,
  },
  {
    id: 'energize',
    name: 'Energizing Breath',
    emoji: '⚡',
    description: 'Quick energizing technique when feeling weak or low energy.',
    color: '#F7B731',
    gradient: 'linear-gradient(135deg, #F7B731, #FC5C7D)',
    phases: [
      { label: 'Quick Inhale', duration: 2, color: '#F7B731' },
      { label: 'Quick Exhale', duration: 2, color: '#FC5C7D' },
      { label: 'Deep Inhale',  duration: 4, color: '#F7B731' },
      { label: 'Long Exhale',  duration: 4, color: '#FC5C7D' },
    ],
    benefit: 'Boosts energy & alertness',
    totalCycle: 12,
  },
]

// ── Animated Ring Component ──────────────────────────────────────────────────
function BreathingRing({ phase, progress, technique, isActive }) {
  const maxSize = 220
  const minSize = 100
  const isExpanding = phase?.label?.toLowerCase().includes('inhale')
  const isHolding = phase?.label?.toLowerCase().includes('hold')
  const currentSize = isActive
    ? isExpanding
      ? minSize + (maxSize - minSize) * progress
      : isHolding
        ? maxSize
        : maxSize - (maxSize - minSize) * progress
    : 160

  const numRings = 3
  return (
    <div style={{ position: 'relative', width: maxSize + 60, height: maxSize + 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer pulse rings */}
      {isActive && [0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: currentSize + 20 + i * 20,
            height: currentSize + 20 + i * 20,
            borderRadius: '50%',
            border: `2px solid ${phase?.color || technique.color}`,
            opacity: 0.15 - i * 0.04,
            transition: 'all 0.1s linear',
          }}
        />
      ))}

      {/* Main circle */}
      <div
        style={{
          width: currentSize,
          height: currentSize,
          borderRadius: '50%',
          background: technique.gradient,
          boxShadow: `0 0 ${currentSize * 0.3}px ${phase?.color || technique.color}55, 0 0 ${currentSize * 0.15}px ${phase?.color || technique.color}33`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 6,
          transition: 'all 0.1s linear',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <span style={{ fontSize: isActive ? '2rem' : '2.5rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
          {technique.emoji}
        </span>
        {isActive && (
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.85rem', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.3)', letterSpacing: '0.5px' }}>
            {phase?.label}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function Breathing() {
  const [selectedTechnique, setSelectedTechnique] = useState(TECHNIQUES[0])
  const [isActive, setIsActive] = useState(false)
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)
  const [phaseProgress, setPhaseProgress] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [cycleCount, setCycleCount] = useState(0)
  const [totalSeconds, setTotalSeconds] = useState(0)
  const intervalRef = useRef(null)
  const tickRef = useRef(0) // tracks ms within a phase

  const currentPhase = selectedTechnique.phases[currentPhaseIndex]

  const clearSession = () => {
    clearInterval(intervalRef.current)
    setIsActive(false)
    setCurrentPhaseIndex(0)
    setPhaseProgress(0)
    setSecondsLeft(0)
    tickRef.current = 0
  }

  const startSession = () => {
    if (isActive) { clearSession(); return }
    setIsActive(true)
    setCycleCount(0)
    setTotalSeconds(0)
    setCurrentPhaseIndex(0)
    tickRef.current = 0

    const phaseDuration = selectedTechnique.phases[0].duration * 1000
    setSecondsLeft(selectedTechnique.phases[0].duration)
    setPhaseProgress(0)

    let phaseIdx = 0
    let elapsed = 0

    intervalRef.current = setInterval(() => {
      elapsed += 100
      setTotalSeconds(prev => prev + 0.1)

      const phase = selectedTechnique.phases[phaseIdx]
      const phaseDur = phase.duration * 1000
      const progress = Math.min(elapsed / phaseDur, 1)
      setPhaseProgress(progress)
      setSecondsLeft(Math.max(0, Math.ceil((phaseDur - elapsed) / 1000)))

      if (elapsed >= phaseDur) {
        elapsed = 0
        phaseIdx = (phaseIdx + 1) % selectedTechnique.phases.length
        setCurrentPhaseIndex(phaseIdx)
        if (phaseIdx === 0) setCycleCount(prev => prev + 1)
      }
    }, 100)
  }

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    if (isActive) clearSession()
  }, [selectedTechnique])

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = Math.floor(secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.4rem, 4vw, 2rem)', color: 'var(--text-primary)', marginBottom: 6 }}>
          🌬️ Breathing Exercises
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Merii sonparii, breathe with me — ye exercises aapki recovery mein bahut help karein gi 💕
        </p>
      </div>

      {/* Technique Selector */}
      <div className="grid-2" style={{ marginBottom: 28 }}>
        {TECHNIQUES.map(t => (
          <button
            key={t.id}
            onClick={() => setSelectedTechnique(t)}
            style={{
              padding: '16px 18px',
              background: selectedTechnique.id === t.id ? t.gradient : 'rgba(255,255,255,0.7)',
              border: selectedTechnique.id === t.id ? 'none' : '1.5px solid rgba(255,107,157,0.2)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'var(--transition)',
              boxShadow: selectedTechnique.id === t.id ? `0 8px 24px ${t.color}44` : 'var(--glass-shadow)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{t.emoji}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', color: selectedTechnique.id === t.id ? 'white' : 'var(--text-primary)', marginBottom: 2 }}>
              {t.name}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: selectedTechnique.id === t.id ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)', lineHeight: 1.3 }}>
              {t.benefit}
            </div>
          </button>
        ))}
      </div>

      {/* Main Exercise Area */}
      <div className="glass-card" style={{ padding: '32px 24px', textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 4 }}>
          {selectedTechnique.name}
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 28 }}>
          {selectedTechnique.description}
        </p>

        {/* Animated Ring */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <BreathingRing
            phase={isActive ? currentPhase : null}
            progress={phaseProgress}
            technique={selectedTechnique}
            isActive={isActive}
          />
        </div>

        {/* Phase timer */}
        {isActive && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: currentPhase.color, lineHeight: 1 }}>
              {secondsLeft}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
              seconds remaining
            </div>
          </div>
        )}

        {/* Phase indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {selectedTechnique.phases.map((p, i) => (
            <div
              key={i}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                background: isActive && currentPhaseIndex === i ? p.color : 'rgba(255,107,157,0.08)',
                color: isActive && currentPhaseIndex === i ? 'white' : 'var(--text-secondary)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: '0.78rem',
                transition: 'all 0.3s ease',
                boxShadow: isActive && currentPhaseIndex === i ? `0 4px 12px ${p.color}44` : 'none',
              }}
            >
              {p.label} {p.duration}s
            </div>
          ))}
        </div>

        {/* Start / Stop Button */}
        <button
          onClick={startSession}
          style={{
            padding: '16px 48px',
            background: isActive
              ? 'linear-gradient(135deg, #FF6B6B, #ee0979)'
              : selectedTechnique.gradient,
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '1.05rem',
            cursor: 'pointer',
            boxShadow: `0 8px 28px ${selectedTechnique.color}55`,
            transition: 'var(--transition)',
            letterSpacing: '0.5px',
          }}
        >
          {isActive ? '⏹ Stop Session' : '▶ Start Breathing'}
        </button>

        {/* Live stats */}
        {isActive && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 24 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: selectedTechnique.color }}>
                {cycleCount}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cycles</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: selectedTechnique.color }}>
                {formatTime(totalSeconds)}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Duration</div>
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="glass-card" style={{ padding: '20px 22px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 14 }}>
          💡 Gudiya ke liye Tips
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: '🌅', text: 'Subah uthke pehle 5 minute breathing karo — poora din fresh rahega!' },
            { icon: '😴', text: 'Raat ko neend se pehle 4-7-8 wali try karo — bahut achhi neend aayegi.' },
            { icon: '🏥', text: 'Recovery mein belly breathing sabse best hai — aaram se karein.' },
            { icon: '❤️', text: 'Agar kabhi anxiety feel ho, box breathing try karo — turat better feel hoga.' },
          ].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{tip.icon}</span>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.87rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
