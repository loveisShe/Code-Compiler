import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.port === '5173' ? '/api/auth' : 'http://localhost:5001/api/auth')

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('codeTrackUser')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('codeTrackToken') || null)
  const [loading, setLoading] = useState(true)

  // Verify token on mount with /api/auth/getme
  useEffect(() => {
    async function verifyAuth() {
      const storedToken = localStorage.getItem('codeTrackToken')
      if (!storedToken) {
        setUser(null)
        setToken(null)
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${API_URL}/getme`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        })

        if (res.ok) {
          const data = await res.json()
          if (data.success && data.user) {
            setUser(data.user)
            localStorage.setItem('codeTrackUser', JSON.stringify(data.user))
          } else {
            logout()
          }
        } else {
          // Token expired or invalid
          logout()
        }
      } catch (err) {
        // If server is temporarily unreachable, maintain cached user session
        console.warn('Backend reachability check warning:', err.message)
      } finally {
        setLoading(false)
      }
    }

    verifyAuth()
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Invalid email or password',
        }
      }

      const receivedToken = data.token
      const receivedUser = data.user

      setToken(receivedToken)
      setUser(receivedUser)
      localStorage.setItem('codeTrackToken', receivedToken)
      localStorage.setItem('codeTrackUser', JSON.stringify(receivedUser))

      return { success: true, user: receivedUser }
    } catch (err) {
      console.error('Login error:', err)
      return {
        success: false,
        message: 'Could not connect to backend server. Make sure port 5000 is running.',
      }
    }
  }, [])

  const signup = useCallback(async (name, email, password) => {
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Signup failed',
        }
      }

      const receivedToken = data.token
      const receivedUser = data.user

      if (receivedToken) {
        setToken(receivedToken)
        setUser(receivedUser)
        localStorage.setItem('codeTrackToken', receivedToken)
        localStorage.setItem('codeTrackUser', JSON.stringify(receivedUser))
      }

      return { success: true, user: receivedUser, token: receivedToken }
    } catch (err) {
      console.error('Signup error:', err)
      return {
        success: false,
        message: 'Could not connect to backend server. Make sure port 5000 is running.',
      }
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('codeTrackToken')
    localStorage.removeItem('codeTrackUser')
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

