import { useNavigate } from 'react-router-dom'
import { useSession } from '../../hooks/useSession'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function BriefScreen() {
  const navigate = useNavigate()
  const { timeLeft, totalTime, startCoding, problemData } = useSession()

  const brief = problemData?.brief || {}
  const pct = (timeLeft / totalTime) * 100
  const timerClass = timeLeft <= 10 ? 'timer--critical' : timeLeft <= 60 ? 'timer--urgent' : ''

  return (
    <div className="brief">

      <header className="brief-header">
        <div className="brief-header-left" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img
            src="/brand/logo-full.png"
            alt="Sponge"
            className="nav-logo-img"
            height={20}
          />
        </div>
        <div className="brief-header-right">
          <div className={`timer ${timerClass}`}>
            <span className="timer-text">{formatTime(timeLeft)}</span>
          </div>
          <div className="timer-bar">
            <div className="timer-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </header>

      <main className="brief-main">

        <div className="brief-meta">
          <span className="brief-label">CHALLENGE</span>
          <span className="brief-sep">/</span>
          <span className="brief-time">{formatTime(timeLeft)} remaining</span>
        </div>

        <h1 className="brief-title">
          {brief.title || 'Challenge'}
        </h1>

        <p className="brief-desc">
          {brief.context || ''}
        </p>

        <div className="brief-divider" />

        <div className="brief-grid">

          <section className="brief-col">
            <h2 className="brief-section-label">Objective</h2>
            <p className="brief-section-text">
              {brief.objective || ''}
            </p>

            {brief.requirements?.length > 0 && (
              <>
                <h2 className="brief-section-label brief-section-label--spaced">Requirements</h2>
                <div className="brief-req">
                  {brief.requirements.map((req, i) => (
                    <div key={i} className="brief-req-row">
                      <span className="brief-req-num">{i + 1}</span>
                      <span className="brief-req-text" dangerouslySetInnerHTML={{ __html: req }} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          <section className="brief-col">
            {brief.constraints?.length > 0 && (
              <>
                <h2 className="brief-section-label">Constraints</h2>
                <ul className="brief-constraints">
                  {brief.constraints.map((c, i) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: c }} />
                  ))}
                </ul>
              </>
            )}

            {brief.footer_note && (
              <div className="brief-note">
                {brief.footer_note}
              </div>
            )}
          </section>

        </div>

        <div className="brief-actions">
          <button className="brief-start" onClick={startCoding}>
            Start coding
          </button>
        </div>

      </main>

    </div>
  )
}
