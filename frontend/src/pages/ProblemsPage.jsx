import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import './ProblemsPage.css'

export default function ProblemsPage() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [topicFilter, setTopicFilter] = useState('All')
  const [diffFilter, setDiffFilter] = useState('All')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/data/questions.json')
        if (!res.ok) throw new Error('Unable to load questions.')
        const data = await res.json()
        if (!Array.isArray(data)) throw new Error('Questions data must be an array.')
        setQuestions(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const topics = useMemo(() => {
    const set = new Set(questions.map(q => q.topic).filter(Boolean))
    return ['All', ...Array.from(set).sort()]
  }, [questions])

  const filtered = useMemo(() => {
    return questions.filter(q => {
      const matchSearch =
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        (q.topic && q.topic.toLowerCase().includes(search.toLowerCase()))
      const matchTopic = topicFilter === 'All' || q.topic === topicFilter
      const matchDiff = diffFilter === 'All' || q.difficulty === diffFilter
      return matchSearch && matchTopic && matchDiff
    })
  }, [questions, search, topicFilter, diffFilter])

  const counts = useMemo(() => ({
    total: questions.length,
    easy: questions.filter(q => q.difficulty?.toLowerCase() === 'easy').length,
    medium: questions.filter(q => q.difficulty?.toLowerCase() === 'medium').length,
    hard: questions.filter(q => q.difficulty?.toLowerCase() === 'hard').length,
  }), [questions])

  const getDiffClass = (diff) => {
    const d = diff?.toLowerCase()
    if (d === 'easy') return 'easy'
    if (d === 'medium') return 'medium'
    if (d === 'hard') return 'hard'
    return ''
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content-area">
        <main className="container">

          {/* Page Heading */}
          <section className="page-heading">
            <p className="eyebrow">PRACTICE. IMPROVE. REPEAT.</p>
            <h1>Problem Set</h1>
            <p className="subtitle">Sharpen your problem-solving skills, one question at a time.</p>
          </section>

          {/* Stats Row */}
          <section className="stats-row">
            <div className="stat-box">
              <span className="stat-label">Total Problems</span>
              <span className="stat-value">{loading ? '--' : counts.total}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Easy</span>
              <span className="stat-value easy-text">{loading ? '--' : counts.easy}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Medium</span>
              <span className="stat-value medium-text">{loading ? '--' : counts.medium}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Hard</span>
              <span className="stat-value hard-text">{loading ? '--' : counts.hard}</span>
            </div>
          </section>

          {/* Problem Panel */}
          <section className="problem-panel">
            {/* Filter Bar */}
            <div className="filter-bar">
              <div className="search-box">
                <span className="search-icon">⚲</span>
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select
                value={topicFilter}
                onChange={e => setTopicFilter(e.target.value)}
                aria-label="Filter by topic"
              >
                {topics.map(t => (
                  <option key={t} value={t}>{t === 'All' ? 'All Topics' : t}</option>
                ))}
              </select>
              <select
                value={diffFilter}
                onChange={e => setDiffFilter(e.target.value)}
                aria-label="Filter by difficulty"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* List Heading */}
            <div className="list-heading">
              <span className="section-label">QUESTIONS</span>
              <span>
                {loading
                  ? 'Loading problems...'
                  : error
                  ? 'Error loading questions.'
                  : `${filtered.length} problem${filtered.length === 1 ? '' : 's'} found`}
              </span>
            </div>

            {/* Table */}
            <div className="problem-table-wrapper">
              <table className="problem-table">
                <thead>
                  <tr>
                    <th className="status-column">#</th>
                    <th>Title</th>
                    <th>Difficulty</th>
                    <th>Topic</th>
                    <th className="action-column">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="empty-state">Loading questions...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="empty-state">
                        {error} Check your JSON file and backend server.
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty-state">No questions found. Try another search.</td>
                    </tr>
                  ) : (
                    filtered.map(q => (
                      <tr key={q.id}>
                        <td className="problem-number">{q.id}</td>
                        <td>
                          <Link
                            to={`/problems/${q.id}`}
                            className="problem-title"
                          >
                            {q.title}
                          </Link>
                        </td>
                        <td>
                          <span className={`difficulty ${getDiffClass(q.difficulty)}`}>
                            {q.difficulty}
                          </span>
                        </td>
                        <td>
                          <span className="topic-tag">{q.topic}</span>
                        </td>
                        <td>
                          <Link
                            to={`/problems/${q.id}`}
                            className="solve-link"
                          >
                            Solve →
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="page-footer">
            Built for consistent practice. One problem at a time.
          </footer>
        </main>
      </div>
    </div>
  )
}

