import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { FiMenu } from 'react-icons/fi'

function Clock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--primary)', fontSize: '0.9rem' }}>
      {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
    </span>
  )
}

export default function TopBar({ onMenuClick }) {
  const { user } = useAuth()
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={onMenuClick}
          style={{
            border: 'none', background: 'transparent', cursor: 'pointer',
            fontSize: '1.4rem', color: 'var(--primary)', padding: '6px',
            borderRadius: '8px', display: 'flex', alignItems: 'center',
            minHeight: '36px', minWidth: '36px', justifyContent: 'center'
          }}
          aria-label="Menu"
        >
          <FiMenu />
        </button>
        <div>
          <div style={{ fontFamily: 'var(--font-script)', fontSize: isMobile ? '1rem' : '1.1rem', color: 'var(--primary)', lineHeight: 1 }}>
            {isMobile ? `Hi, ${user?.full_name || 'Asifa'} ❤️` : `${greeting}, ${user?.full_name || 'Asifa'} ❤️`}
          </div>
          {!isMobile && (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '16px' }}>
        <Clock />
        {/* Weather — hidden on very small phones */}
        {!isMobile && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', background: 'rgba(255,107,157,0.1)',
            borderRadius: 'var(--radius-full)', fontSize: '0.85rem',
            fontFamily: 'var(--font-body)', color: 'var(--text-secondary)',
            fontWeight: 500
          }}>
            <span>🌤️</span>
            <span>28°C</span>
          </div>
        )}
        {/* Avatar */}
        <div style={{
          width: isMobile ? 34 : 40, height: isMobile ? 34 : 40, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontFamily: 'var(--font-heading)', fontWeight: 700,
          fontSize: isMobile ? '0.85rem' : '1rem', boxShadow: '0 2px 10px rgba(255,107,157,0.35)',
          cursor: 'pointer', flexShrink: 0
        }}>
          {(user?.full_name || 'A').charAt(0)}
        </div>
      </div>
    </header>
  )
}
