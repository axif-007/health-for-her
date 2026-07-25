import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/schedule', label: "Today's Schedule", icon: '📅' },
  { path: '/medicines', label: 'Medicine Tracker', icon: '💊' },
  { path: '/water', label: 'Water Tracker', icon: '💧' },
  { path: '/meals', label: 'Meal Planner', icon: '🥗' },
  { path: '/recovery', label: 'Recovery Progress', icon: '📈' },
  { path: '/mood', label: 'Mood Tracker', icon: '😊' },
  { path: '/symptoms', label: 'Symptom Tracker', icon: '🌡️' },
  { path: '/sleep', label: 'Sleep Tracker', icon: '🌙' },
  { path: '/journal', label: 'Health Journal', icon: '📖' },
  { path: '/ai-assistant', label: 'AI Assistant', icon: '🤖' },
  { path: '/reports', label: 'Reports', icon: '📊' },
  { path: '/gallery', label: 'Gallery', icon: '🖼️' },
  { path: '/timeline', label: 'Memory Timeline', icon: '💝' },
  { path: '/motivation', label: 'Motivation ❤️', icon: '🌟' },
  { path: '/achievements', label: 'Achievements', icon: '🏆' },
  { path: '/emergency', label: 'Emergency', icon: '🚨' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
  { path: '/about', label: 'About', icon: 'ℹ️' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Take care, Asifa ❤️ See you soon!')
    navigate('/')
  }

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} style={{ zIndex: 200 }}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF6B9D, #E91E8C)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.3rem', boxShadow: '0 4px 16px rgba(255,107,157,0.4)',
              flexShrink: 0
            }}>
              ❤️
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-script)', fontSize: '1.1rem', color: 'var(--primary)', lineHeight: 1.1 }}>
                Asifa
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Recovery Companion
              </div>
            </div>
          </div>
          {/* Close button — shown on mobile */}
          <button
            onClick={onClose}
            style={{
              border: 'none', background: 'rgba(255,107,157,0.1)', cursor: 'pointer',
              fontSize: '1.1rem', color: 'var(--primary)', padding: '8px',
              borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, flexShrink: 0
            }}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,107,157,0.1)' }}>
        <button
          className="nav-item"
          onClick={handleLogout}
          style={{ color: '#e74c3c', width: '100%' }}
        >
          <span className="nav-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
