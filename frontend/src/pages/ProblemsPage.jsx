import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchProblems } from '../api/client'
import Navbar from '../components/shared/Navbar'

const langColors = { python: '#3776AB' }
const diffColors = { beginner: '#52b788', intermediate: '#e9c46a', advanced: '#e76f51' }

function ChallengeCard({ problem, onClick }) {
  return (
    <div className="challenge-card" onClick={onClick}>
      <div className="challenge-card-top">
        <span
          className="challenge-card-lang"
          style={{ background: langColors[problem.language] || '#666' }}
        >
          {problem.language}
        </span>
        <span
          className="challenge-card-diff"
          style={{ color: diffColors[problem.difficulty] || 'var(--text-dim)' }}
        >
          {problem.difficulty}
        </span>
      </div>
      <h3 className="challenge-card-title">{problem.title}</h3>
      <p className="challenge-card-desc">{problem.description}</p>
      <div className="challenge-card-footer">
        <span className="challenge-card-time">
          {Math.floor(problem.time_limit_seconds / 60)} min
        </span>
        <span className="challenge-card-arrow">&rarr;</span>
      </div>
    </div>
  )
}

function ComingSoonCard() {
  return (
    <div className="challenge-card challenge-card--soon">
      <div className="challenge-card-top">
        <span className="challenge-card-lang" style={{ background: '#444' }}>coming soon</span>
      </div>
      <h3 className="challenge-card-title" style={{ opacity: 0.4 }}>More challenges on the way</h3>
      <p className="challenge-card-desc" style={{ opacity: 0.3 }}>
        New problems are being added regularly. Stay tuned.
      </p>
    </div>
  )
}

export default function ProblemsPage() {
  const navigate = useNavigate()
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProblems()
      .then(setProblems)
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="problems-page">
      <Navbar />

      <main className="problems-main">
        <div className="problems-meta">
          <span className="problems-label">CHALLENGES</span>
        </div>

        <h1 className="problems-title">Pick a challenge</h1>
        <p className="problems-desc">
          Drop into a real codebase, collaborate with an AI assistant, and get scored on how well you use AI — not whether the code compiles.
        </p>

        <div className="problems-divider" />

        {loading ? (
          <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Loading challenges...</p>
        ) : (
          <div className="problems-grid">
            {problems.map((p) => (
              <ChallengeCard
                key={p.id}
                problem={p}
                onClick={() => navigate(`/demo/${p.id}`)}
              />
            ))}
            <ComingSoonCard />
          </div>
        )}
      </main>
    </div>
  )
}
