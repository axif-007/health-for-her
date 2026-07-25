import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

// Bottom nav items — the 5 most important pages for quick access
const BOTTOM_NAV = [
  { path: '/dashboard', icon: '🏠', label: 'Home' },
  { path: '/medicines', icon: '💊', label: 'Medicine' },
  { path: '/schedule', icon: '📅', label: 'Schedule' },
  { path: '/mood', icon: '😊', label: 'Mood' },
  { path: '/water', icon: '💧', label: 'Water' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
      if (window.innerWidth > 768) setSidebarOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => setSidebarOpen(false)

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Dark overlay behind sidebar on mobile */}
      {sidebarOpen && isMobile && (
        <div
          onClick={handleOverlayClick}
          className="mobile-overlay"
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(45, 27, 51, 0.45)',
            zIndex: 199,
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
          }}
        />
      )}

      <div className="main-content">
        <TopBar onMenuClick={() => setSidebarOpen(prev => !prev)} />
        <main style={{ position: 'relative', zIndex: 1 }}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        {BOTTOM_NAV.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        ))}
        {/* More button opens full sidebar */}
        <button
          className="bottom-nav-more"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="bottom-nav-icon">☰</span>
          <span className="bottom-nav-label" style={{ fontFamily: 'var(--font-heading)', fontSize: '0.62rem', fontWeight: 600 }}>More</span>
        </button>
      </nav>
    </div>
  )
}
