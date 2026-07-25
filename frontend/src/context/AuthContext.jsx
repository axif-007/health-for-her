import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

// In production (Render), VITE_API_URL = "https://your-backend.onrender.com"
// In dev, it defaults to the local proxy
const API_BASE = import.meta.env.VITE_API_URL || ''
if (API_BASE) {
  axios.defaults.baseURL = API_BASE
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('asifa_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchMe()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchMe = async () => {
    try {
      const res = await axios.get('/api/auth/me')
      setUser(res.data)
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    const res = await axios.post('/api/auth/login-json', { username, password })
    const { access_token } = res.data
    localStorage.setItem('asifa_token', access_token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
    setToken(access_token)
    const me = await axios.get('/api/auth/me')
    setUser(me.data)
    return me.data
  }

  const logout = () => {
    localStorage.removeItem('asifa_token')
    delete axios.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
