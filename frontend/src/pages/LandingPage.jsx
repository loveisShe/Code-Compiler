import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthModal from '../components/AuthModal'
import './LandingPage.css'

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('login')
  const [promptMessage, setPromptMessage] = useState('')

  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // If redirected with ?auth=required, automatically pop open login modal
  useEffect(() => {
    if (searchParams.get('auth') === 'required' && !isAuthenticated) {
      setModalMode('login')
      setPromptMessage('Please sign in or register first. Dashboard is protected.')
      setModalOpen(true)
      // clear the param from URL
      searchParams.delete('auth')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, isAuthenticated, setSearchParams])

  const openLogin = (e) => {
    if (e) e.preventDefault()
    setModalMode('login')
    setPromptMessage('')
    setModalOpen(true)
  }

  const openSignup = (e) => {
    if (e) e.preventDefault()
    setModalMode('signup')
    setPromptMessage('')
    setModalOpen(true)
  }

  const handleDashboardClick = (e) => {
    e.preventDefault()
    if (isAuthenticated) {
      navigate('/dashboard')
    } else {
      setModalMode('login')
      setPromptMessage('Please sign in or create an account to open the Dashboard.')
      setModalOpen(true)
    }
  }

  const handleProblemsClick = (e) => {
    e.preventDefault()
    if (isAuthenticated) {
      navigate('/problems')
    } else {
      setModalMode('signup')
      setPromptMessage('Create an account or sign in to practice DSA challenges.')
      setModalOpen(true)
    }
  }

  return (
    <>
      {/* Header */}
      <header className="site-header">
        <div className="nav-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <Link to="/" className="brand-logo">
              <span className="brand-symbol">&lt;/&gt;</span>
              CodeTrack
            </Link>
            <nav>
              <ul className="nav-links">
                <li>
                  <a href="#dashboard" onClick={handleDashboardClick} className="nav-link">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="#problems" onClick={handleProblemsClick} className="nav-link">
                    Problems
                  </a>
                </li>
                <li>
                  <a href="#history" onClick={handleDashboardClick} className="nav-link">
                    Progress
                  </a>
                </li>
              </ul>
            </nav>
          </div>
          <div className="auth-actions">
            {isAuthenticated ? (
              <>
                <span style={{ fontSize: '13px', color: '#a1a1aa' }}>
                  Hi, <strong style={{ color: '#fff' }}>{user?.name}</strong>
                </span>
                <Link
                  to="/dashboard"
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                >
                  Dashboard →
                </Link>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={logout}
                  style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button type="button" className="btn-ghost" onClick={openLogin}>
                  Log In
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleDashboardClick}
                >
                  Dashboard →
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-pill">
            <span className="dot"></span>
            The Modern Coding &amp; Analytics Suite
          </div>
          <h1 className="hero-title">
            Master Problem Solving.<br />
            Track Your <span className="highlight">True Growth</span>.
          </h1>
          <p className="hero-desc">
            An elegant code compiler, curated algorithmic challenges, and deep submission analytics — engineered with pure black aesthetics for focused developers.
          </p>
          <div className="hero-cta-group">
            <button
              type="button"
              onClick={handleDashboardClick}
              className="btn-hero-primary"
            >
              Open Dashboard →
            </button>
            <button
              type="button"
              onClick={handleProblemsClick}
              className="btn-hero-secondary"
            >
              Browse Problems
            </button>
          </div>
        </section>

        {/* Metrics Section */}
        <section className="metrics-section">
          <div className="metrics-container">
            {[
              { num: '4', suffix: '+', label: 'Languages (JS, Python, Java, C++)' },
              { num: '100', suffix: '%', label: 'Dynamic Progress Tracking' },
              { num: 'DSA', suffix: '', label: 'Topic-Wise Categorization' },
              { num: '0', suffix: 's', label: 'Distraction-Free Dark Experience' },
            ].map(({ num, suffix, label }) => (
              <div className="metric-item" key={label}>
                <div className="metric-number">{num}<span>{suffix}</span></div>
                <div className="metric-label">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section" id="features">
          <div className="section-header">
            <p className="section-tag">BUILT FOR DEVELOPERS</p>
            <h2 className="section-title">Everything you need to improve</h2>
            <p className="section-desc">Clean, fast, and unified. No unnecessary complexity or distracting clutter.</p>
          </div>
          <div className="features-grid">
            {[
              {
                icon: '⚡',
                title: 'Curated Problem Set',
                desc: 'Explore hand-crafted DSA problems filtered by Easy, Medium, or Hard difficulty and core topics like Arrays, DP, and Searching.',
                onClick: handleProblemsClick,
                action: 'Browse Problems →',
              },
              {
                icon: '⌨️',
                title: 'In-Browser Code Editor',
                desc: 'Write code in JavaScript, Python, Java, or C++ with language starter templates, syntax-ready dark backgrounds, and clean execution output.',
                onClick: handleProblemsClick,
                action: 'Open Compiler →',
              },
              {
                icon: '📊',
                title: 'Deep Progress Analytics',
                desc: 'Visualize your acceptance rates, topic-wise strengths, active coding streaks, and detailed submission history tables.',
                onClick: handleDashboardClick,
                action: 'View Analytics →',
              },
            ].map(({ icon, title, desc, onClick, action }) => (
              <article className="feature-card" key={title}>
                <div className="card-icon">{icon}</div>
                <h3 className="card-title">{title}</h3>
                <p className="card-desc">{desc}</p>
                <button
                  type="button"
                  onClick={onClick}
                  className="card-action"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                >
                  {action}
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* Workflow Section */}
        <section className="workflow-section">
          <div className="workflow-container">
            <div className="workflow-info">
              <p className="section-tag">FOCUSED WORKFLOW</p>
              <h3>Solve. Run. Analyze.</h3>
              <p>Designed around a seamless feedback loop so you can identify weak areas and build consistency without friction.</p>
              <div className="workflow-steps">
                {[
                  { n: '1', title: 'Select a Challenge', desc: 'Filter by topic and difficulty to find your next goal.' },
                  { n: '2', title: 'Write Clean Code', desc: 'Utilize language templates and run your solution.' },
                  { n: '3', title: 'Inspect Analytics', desc: 'Review your streak, acceptance rate, and submissions.' },
                ].map(({ n, title, desc }) => (
                  <div className="workflow-step" key={n}>
                    <span className="step-number">{n}</span>
                    <div className="step-text">
                      <strong>{title}</strong>
                      <span>{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="code-mockup">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span></span><span></span><span></span>
                </div>
                <span>Solution.js</span>
              </div>
              <pre className="mockup-body"><code>
{`// Optimal Two-Sum with Hash Map
`}<span style={{color:'#71717a'}}>{'// Optimal Two-Sum with Hash Map'}</span>{`
`}<span style={{color:'#f59e0b'}}>function</span>{` `}<span style={{color:'#22c55e'}}>twoSum</span>{`(nums, target) {
    `}<span style={{color:'#f59e0b'}}>const</span>{` map = `}<span style={{color:'#f59e0b'}}>new</span>{` Map();
    `}<span style={{color:'#f59e0b'}}>for</span>{` (`}<span style={{color:'#f59e0b'}}>let</span>{` i = 0; i < nums.length; i++) {
        `}<span style={{color:'#f59e0b'}}>const</span>{` complement = target - nums[i];
        `}<span style={{color:'#f59e0b'}}>if</span>{` (map.has(complement)) {
            `}<span style={{color:'#f59e0b'}}>return</span>{` [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    `}<span style={{color:'#f59e0b'}}>return</span>{` [];
}`}
              </code></pre>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-container">
          <p className="footer-copy">&copy; 2026 CodeTrack. Engineered with pure dark aesthetics.</p>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><a href="#dashboard" onClick={handleDashboardClick}>Dashboard</a></li>
            <li><a href="#problems" onClick={handleProblemsClick}>Problems</a></li>
            <li><a href="#history" onClick={handleDashboardClick}>Analytics</a></li>
            <li>
              {isAuthenticated ? (
                <a href="#logout" onClick={logout}>Sign Out</a>
              ) : (
                <a href="#login" onClick={openLogin}>Sign In</a>
              )}
            </li>
          </ul>
        </div>
      </footer>

      <AuthModal
        isOpen={modalOpen}
        initialMode={modalMode}
        promptMessage={promptMessage}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
