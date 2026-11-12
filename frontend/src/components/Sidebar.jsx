import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const displayName = user?.name || 'Developer'
  const displayEmail = user?.email || 'coder'
  const displayInitial = (displayName.charAt(0) || 'D').toUpperCase()

  const handleLogout = (e) => {
    e.preventDefault()
    logout()
    navigate('/', { replace: true })
  }

  return (
    <aside className="ct-sidebar" aria-label="Main Navigation">
      <div className="sidebar-top">
        {/* Logo */}
        <NavLink to="/dashboard" className="sidebar-brand" title="CodeTrack">
          <span className="brand-code-icon">&lt;/&gt;</span>
          <span>CodeTrack</span>
        </NavLink>

        {/* Nav Links */}
        <nav>
          <ul className="sidebar-nav-menu">
            <li>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  'sidebar-item-link' + (isActive ? ' active' : '')
                }
              >
                <span className="sidebar-icon">📊</span>
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/problems"
                className={({ isActive }) =>
                  'sidebar-item-link' + (isActive ? ' active' : '')
                }
              >
                <span className="sidebar-icon">⚡</span>
                <span>Problems</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/history"
                className={({ isActive }) =>
                  'sidebar-item-link' + (isActive ? ' active' : '')
                }
              >
                <span className="sidebar-icon">📈</span>
                <span>Progress</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>

      {/* User Profile Badge & Logout Button at Bottom */}
      <div className="sidebar-bottom">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="sidebar-user-card" title={`${displayName} (${displayEmail})`}>
            <div className="sidebar-avatar">{displayInitial}</div>
            <div className="sidebar-user-details">
              <span className="sidebar-user-name">{displayName}</span>
              <span className="sidebar-user-handle">{displayEmail}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171',
              borderRadius: '8px',
              padding: '7px 12px',
              fontSize: '12.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '100%',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)'
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.45)'
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)'
            }}
          >
            <span>⎋</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
