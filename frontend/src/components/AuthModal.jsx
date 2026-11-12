import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthModal({ isOpen, initialMode = 'login', onClose, promptMessage = '' }) {
  const [mode, setMode] = useState(initialMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Sync mode when prop changes
  useEffect(() => {
    setMode(initialMode)
    setError('')
  }, [initialMode, isOpen])

  // Close on Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && isOpen) onClose()
  }, [isOpen, onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const result = await login(email, password)
        if (!result.success) {
          setError(result.message)
          setLoading(false)
          return
        }
      } else {
        if (!name.trim()) {
          setError('Please provide your full name')
          setLoading(false)
          return
        }
        const result = await signup(name, email, password)
        if (!result.success) {
          setError(result.message)
          setLoading(false)
          return
        }
      }

      setLoading(false)
      onClose()

      // Redirect to the originally intended path or /dashboard
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  const overlayClass = `modal-overlay${isOpen ? ' active' : ''}`

  return (
    <div
      className={overlayClass}
      aria-hidden={!isOpen}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        <div className="modal-tabs">
          <button
            type="button"
            className={`tab-btn${mode === 'login' ? ' active' : ''}`}
            onClick={() => { setMode('login'); setError('') }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`tab-btn${mode === 'signup' ? ' active' : ''}`}
            onClick={() => { setMode('signup'); setError('') }}
          >
            Create Account
          </button>
        </div>

        <h3 className="modal-title" id="modalTitle">
          {mode === 'login' ? 'Welcome back' : 'Create an account'}
        </h3>
        <p className="modal-subtitle">
          {promptMessage || (mode === 'login'
            ? 'Sign in to access your dashboard, code compiler, and progress.'
            : 'Register to start tracking your DSA journey and solve challenges.')}
        </p>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#f87171',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '16px',
            lineHeight: 1.4
          }}>
            ⚠️ {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label htmlFor="userName">Full Name</label>
              <input
                type="text"
                id="userName"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Alex Sharma"
                required={mode === 'signup'}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="userEmail">Email Address</label>
            <input
              type="email"
              id="userEmail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="userPassword">Password</label>
            <input
              type="password"
              id="userPassword"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading
              ? 'Verifying with server...'
              : mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>
        </form>

        <p className="modal-footer-note">
          By continuing, you agree to CodeTrack's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
