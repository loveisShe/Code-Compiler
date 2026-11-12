import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import './ProblemDetailsPage.css'

const STARTER_TEMPLATES = {
  javascript: `function solve(input) {
    // Write your solution here

}

console.log(solve("test"));`,

  python: `def solve(input):
    # Write your solution here
    pass


print(solve("test"))`,

  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Write your solution here
    }
}`,

  cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Write your solution here

    return 0;
}`,
}

export default function ProblemDetailsPage() {
  const { id } = useParams()
  const [problem, setProblem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState(STARTER_TEMPLATES.javascript)
  const [output, setOutput] = useState('Your output will appear here.')

  useEffect(() => {
    async function load() {
      try {
        const numId = Number(id)
        if (!Number.isInteger(numId) || numId <= 0) throw new Error('Invalid question ID.')

        const res = await fetch('/data/questions.json')
        if (!res.ok) throw new Error('Unable to load questions.json.')
        const questions = await res.json()
        const q = questions.find(item => item.id === numId)
        if (!q) throw new Error('Question not found.')
        setProblem(q)
        document.title = `CodeTrack | ${q.title}`
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleLanguageChange = (e) => {
    const lang = e.target.value
    setLanguage(lang)
    setCode(STARTER_TEMPLATES[lang] || '')
    setOutput('Your output will appear here.')
  }

  const handleRunCode = () => {
    setOutput(`Demo mode: Actual ${language} code execution is not enabled yet.`)
  }

  const getDiffClass = (diff) => diff?.toLowerCase() || ''

  return (
    <>
      {/* Problem Details Navbar */}
      <header className="pd-navbar">
        <Link to="/problems" className="pd-logo">
          <span className="pd-logo-icon">&lt;/&gt;</span>
          CodeTrack
        </Link>
        <nav>
          <Link to="/problems" className="pd-nav-link">← Problems</Link>
        </nav>
      </header>

      <main className="details-container">
        {/* Left Panel: Problem Description */}
        <section id="problemDetails">
          {loading && <p style={{ color: 'var(--text-muted-alt)' }}>Loading problem...</p>}
          {error && <p style={{ color: 'var(--color-red)' }}>{error}</p>}
          {problem && (
            <>
              <h2>{problem.id}. {problem.title}</h2>
              <div className="problem-meta">
                <span className={`difficulty ${getDiffClass(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
                <span className="meta-tag">{problem.topic}</span>
              </div>
              <p>{problem.description}</p>

              <h3>Examples</h3>
              {(problem.examples || []).map((ex, i) => (
                <div className="example-box" key={i}>
                  <h4>Example {i + 1}</h4>
                  <pre>Input: {ex.input}</pre>
                  <pre>Output: {ex.output}</pre>
                  {ex.explanation && <p>Explanation: {ex.explanation}</p>}
                </div>
              ))}

              <h3>Constraints</h3>
              <ul>
                {(problem.constraints || []).map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </>
          )}
        </section>

        {/* Right Panel: Code Editor */}
        <section className="editor-section">
          <h2>Your Solution</h2>

          <label htmlFor="language">Language</label>
          <select id="language" value={language} onChange={handleLanguageChange}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>

          <textarea
            id="codeEditor"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            placeholder="Write your solution here..."
            value={code}
            onChange={e => setCode(e.target.value)}
          />

          <button id="runButton" type="button" onClick={handleRunCode}>
            ▶ Run Code
          </button>

          <h3>Output</h3>
          <pre id="output">{output}</pre>
        </section>
      </main>
    </>
  )
}

