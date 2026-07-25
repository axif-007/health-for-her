import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout/Layout'
import FloatingHearts from './components/FloatingHearts'

// Lazy load pages
const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Schedule = lazy(() => import('./pages/Schedule'))
const Medicines = lazy(() => import('./pages/Medicines'))
const Water = lazy(() => import('./pages/Water'))
const Meals = lazy(() => import('./pages/Meals'))
const Recovery = lazy(() => import('./pages/Recovery'))
const Mood = lazy(() => import('./pages/Mood'))
const Symptoms = lazy(() => import('./pages/Symptoms'))
const Sleep = lazy(() => import('./pages/Sleep'))
const Journal = lazy(() => import('./pages/Journal'))
const Motivation = lazy(() => import('./pages/Motivation'))
const Gallery = lazy(() => import('./pages/Gallery'))
const Timeline = lazy(() => import('./pages/Timeline'))
const Achievements = lazy(() => import('./pages/Achievements'))
const Emergency = lazy(() => import('./pages/Emergency'))
const Reports = lazy(() => import('./pages/Reports'))
const Settings = lazy(() => import('./pages/Settings'))
const About = lazy(() => import('./pages/About'))
const AIAssistant = lazy(() => import('./pages/AIAssistant'))

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
    <div style={{ fontSize: '3rem', animation: 'pulse-soft 1.5s ease infinite' }}>❤️</div>
    <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', fontSize: '1.1rem' }}>Loading with love...</p>
  </div>
)

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={!user ? <Landing /> : <Navigate to="/dashboard" replace />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />

        {/* Protected routes inside layout */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/water" element={<Water />} />
          <Route path="/meals" element={<Meals />} />
          <Route path="/recovery" element={<Recovery />} />
          <Route path="/mood" element={<Mood />} />
          <Route path="/symptoms" element={<Symptoms />} />
          <Route path="/sleep" element={<Sleep />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/motivation" element={<Motivation />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/about" element={<About />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FloatingHearts />
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
