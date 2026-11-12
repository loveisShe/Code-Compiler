import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#07080a',
        color: '#fff',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(245, 158, 11, 0.2)',
          borderTopColor: '#f59e0b',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '16px'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#a1a1aa', fontSize: '14px' }}>Authenticating session...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirect to home and trigger the login modal
    return <Navigate to="/?auth=required" state={{ from: location }} replace />
  }

  return children
}

