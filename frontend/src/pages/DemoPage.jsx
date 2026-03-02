import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import BriefScreen from '../components/game/BriefScreen'
import Layout from '../components/shared/Layout'
import ResultsScreen from '../components/game/ResultsScreen'

export default function DemoPage() {
  const { problemId: urlProblemId } = useParams()
  const resolvedProblemId = urlProblemId || 'rq-delayed-jobs'

  const { view, beginSession, selectProblem, problemId, isProblemLoading } = useSession()
  const started = useRef(false)
  const problemLoaded = useRef(false)
  const [failed, setFailed] = useState(false)

  // Load problem data when component mounts or problemId changes
  useEffect(() => {
    if (problemId !== resolvedProblemId && !problemLoaded.current) {
      problemLoaded.current = true
      selectProblem(resolvedProblemId).catch(() => setFailed(true))
    }
  }, [resolvedProblemId, problemId, selectProblem])

  // Auto-start session once problem is loaded and we're idle
  useEffect(() => {
    if (view === 'idle') {
      started.current = false
    }
    if (!started.current && view === 'idle' && problemId === resolvedProblemId && !isProblemLoading) {
      started.current = true
      setFailed(false)
      beginSession('Guest').catch(() => setFailed(true))
    }
  }, [view, beginSession, problemId, resolvedProblemId, isProblemLoading])

  if (view === 'idle') {
    if (failed) {
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: 'var(--bg-root)', color: 'var(--text-dim)' }}>
          <p>Could not start session.</p>
          <button
            onClick={() => { started.current = false; problemLoaded.current = false; setFailed(false) }}
            style={{
              padding: '8px 20px',
              background: 'var(--green-dark)',
              color: 'var(--cream)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )
    }
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-root)', color: 'var(--text-dim)' }}>
        Loading challenge...
      </div>
    )
  }

  if (view === 'brief') return <BriefScreen />
  if (view === 'results') return <ResultsScreen />

  return <Layout />
}
