import { useSession } from '../../hooks/useSession'

export default function ProblemStatement({ onCollapse }) {
  const { problemData } = useSession()
  const brief = problemData?.brief || {}

  return (
    <div className="problem-statement">
      <div className="problem-header">
        <div className="problem-header-left">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>Problem</span>
        </div>
        {onCollapse && (
          <button className="panel-collapse-btn" onClick={onCollapse} title="Collapse problem panel">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M4 10l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
      <h3 className="problem-title">{brief.title || 'Challenge'}</h3>

      {brief.context && (
        <div className="problem-context">
          <h4>Context</h4>
          <p>{brief.context}</p>
        </div>
      )}

      <div className="problem-requirements">
        <h4>Task</h4>
        <p>{brief.objective || ''}</p>
        {brief.requirements?.length > 0 && (
          <ul>
            {brief.requirements.map((req, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: req }} />
            ))}
          </ul>
        )}
      </div>

      {brief.constraints?.length > 0 && (
        <div className="problem-requirements">
          <h4>Expected Behavior</h4>
          <ul>
            {brief.constraints.map((c, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: c }} />
            ))}
          </ul>
        </div>
      )}

      {brief.footer_note && (
        <div className="problem-footer">
          {brief.footer_note}
        </div>
      )}
    </div>
  )
}
