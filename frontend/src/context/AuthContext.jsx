import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const payload = {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      }
      const { data } = await api.post('/auth/login', payload)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.utilisateur))
      setUser(data.utilisateur)
      return data.utilisateur
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try { await api.post('/auth/logout') } catch { }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  const isRole = (...roles) => roles.includes(user?.role)

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isRole, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
