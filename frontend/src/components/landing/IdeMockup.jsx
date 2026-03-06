import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

/* ═══════════════════════════════════════════════
   Inline SVG icons matching production UI
   ═══════════════════════════════════════════════ */
const PythonIcon = () => (
    <img src="/icons/python.svg" alt="" className="ide-filetype-icon" style={{ width: 10, height: 10 }} />
)

const FolderIcon = ({ open }) => (
    <svg viewBox="0 0 16 16" className="ide-filetype-icon" style={{ width: 10, height: 10 }}>
        {open ? (
            <path d="M1.5 3h4l1 1h6v1H5.5l-1-1H2.5v8l1.5-5h11l-2 6h-11z" fill="#c09553" />
        ) : (
            <path d="M1.5 3h4l1 1h7v9h-12z" fill="#c09553" />
        )}
    </svg>
)

const YamlIcon = () => (
    <svg viewBox="0 0 16 16" className="ide-filetype-icon" style={{ width: 10, height: 10 }}>
        <rect x="1" y="1" width="14" height="14" rx="2" fill="none" stroke="#d19a66" strokeWidth="1.5" />
        <path d="M4 5l2.5 3v3M12 5l-2.5 3v3" stroke="#d19a66" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
)

const MdIcon = () => (
    <svg viewBox="0 0 16 16" className="ide-filetype-icon" style={{ width: 10, height: 10 }}>
        <rect x="1" y="2" width="14" height="12" rx="2" fill="none" stroke="#61afef" strokeWidth="1.5" />
        <path d="M3.5 10V6l2 2.5L7.5 6v4M9.5 10V6l3 4V6" stroke="#61afef" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

const TestIcon = () => (
    <svg viewBox="0 0 16 16" className="ide-filetype-icon" style={{ width: 10, height: 10 }}>
        <path d="M5 2v3l-3 5c-.5 1 .2 2 1.2 2h9.6c1 0 1.7-1 1.2-2L11 5V2" stroke="#52b788" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M5 2h6" stroke="#52b788" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="7" cy="9.5" r="1" fill="#52b788" />
        <circle cx="10" cy="8" r=".8" fill="#52b788" />
    </svg>
)

/* section header icon — small panel/terminal icon like production */
const ProblemIcon = () => (
    <svg viewBox="0 0 16 16" className="ide-filetype-icon" style={{ width: 9, height: 9, opacity: 0.7 }}>
        <rect x="1" y="2" width="14" height="12" rx="2" fill="none" stroke="#9a958e" strokeWidth="1.5" />
        <path d="M1 5h14" stroke="#9a958e" strokeWidth="1.2" />
        <circle cx="3.5" cy="3.5" r=".7" fill="#9a958e" />
        <circle cx="5.5" cy="3.5" r=".7" fill="#9a958e" />
    </svg>
)

const ExplorerIcon = () => (
    <svg viewBox="0 0 16 16" className="ide-filetype-icon" style={{ width: 9, height: 9, opacity: 0.7 }}>
        <path d="M2 2h5l1.5 1.5H14v10H2z" fill="none" stroke="#9a958e" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
)

const ChevronIcon = ({ up }) => (
    <svg viewBox="0 0 16 16" style={{ width: 9, height: 9, opacity: 0.5, transform: up ? 'rotate(0)' : 'rotate(180deg)' }}>
        <path d="M4 10l4-4 4 4" stroke="#9a958e" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

/* ═══════════════════════════════════════════════
   Fake code tokens — deployment orchestrator
   ═══════════════════════════════════════════════ */
const FAKE_CODE = [
    { text: 'from', color: '#c678dd' },
    { text: ' sponge.deploy ', color: '#e0ddd7' },
    { text: 'import', color: '#c678dd' },
    { text: ' Pipeline, Stage\n', color: '#e5c07b' },
    { text: 'from', color: '#c678dd' },
    { text: ' sponge.monitor ', color: '#e0ddd7' },
    { text: 'import', color: '#c678dd' },
    { text: ' HealthCheck\n\n', color: '#e5c07b' },
    { text: 'class', color: '#c678dd' },
    { text: ' DeployOrchestrator', color: '#e5c07b' },
    { text: ':\n', color: '#e0ddd7' },
    { text: '    ', color: '' },
    { text: 'def', color: '#c678dd' },
    { text: ' __init__', color: '#61afef' },
    { text: '(self, config):\n', color: '#e0ddd7' },
    { text: '        self.pipeline = Pipeline(\n', color: '#e0ddd7' },
    { text: '            ', color: '' },
    { text: 'stages', color: '#d19a66' },
    { text: '=', color: '#56b6c2' },
    { text: '[\n', color: '#e0ddd7' },
    { text: '                Stage(', color: '#e0ddd7' },
    { text: '"build"', color: '#98c379' },
    { text: ', timeout=', color: '#e0ddd7' },
    { text: '300', color: '#d19a66' },
    { text: '),\n', color: '#e0ddd7' },
    { text: '                Stage(', color: '#e0ddd7' },
    { text: '"test"', color: '#98c379' },
    { text: ', parallel=', color: '#e0ddd7' },
    { text: 'True', color: '#d19a66' },
    { text: '),\n', color: '#e0ddd7' },
    { text: '                Stage(', color: '#e0ddd7' },
    { text: '"deploy"', color: '#98c379' },
    { text: ', rollback=', color: '#e0ddd7' },
    { text: 'True', color: '#d19a66' },
    { text: ')\n', color: '#e0ddd7' },
    { text: '            ]\n', color: '#e0ddd7' },
    { text: '        )\n\n', color: '#e0ddd7' },
    { text: '    ', color: '' },
    { text: 'async def', color: '#c678dd' },
    { text: ' execute', color: '#61afef' },
    { text: '(self, service):\n', color: '#e0ddd7' },
    { text: '        ', color: '' },
    { text: '# Auto-rollback on failure\n', color: '#6a737d' },
    { text: '        ', color: '' },
    { text: 'async with', color: '#c678dd' },
    { text: ' self.pipeline.run(service) ', color: '#e0ddd7' },
    { text: 'as', color: '#c678dd' },
    { text: ' ctx:\n', color: '#e0ddd7' },
    { text: '            ', color: '' },
    { text: 'await', color: '#c678dd' },
    { text: ' ctx.build()\n', color: '#e0ddd7' },
    { text: '            ', color: '' },
    { text: 'await', color: '#c678dd' },
    { text: ' ctx.verify()', color: '#e0ddd7' },
]

/* File tree with icons matching file types */
const FILE_TREE = [
    { name: 'sponge', type: 'folder', indent: 0 },
    { name: '__init__.py', type: 'python', indent: 1 },
    { name: 'deploy.py', type: 'python', indent: 1, active: true },
    { name: 'monitor.py', type: 'python', indent: 1 },
    { name: 'pipeline.py', type: 'python', indent: 1 },
    { name: 'stages.py', type: 'python', indent: 1 },
    { name: 'tests', type: 'folder', indent: 0 },
    { name: 'test_deploy.py', type: 'python', indent: 1 },
    { name: 'config.yaml', type: 'yaml', indent: 0 },
    { name: 'README.md', type: 'md', indent: 0 },
]

const FileIcon = ({ type }) => {
    switch (type) {
        case 'python': return <PythonIcon />
        case 'folder': return <FolderIcon />
        case 'test': return <TestIcon />
        case 'yaml': return <YamlIcon />
        case 'md': return <MdIcon />
        default: return <PythonIcon />
    }
}

const AI_MESSAGES = [
    {
        role: 'user',
        text: 'How should I handle rollbacks on partial deploy failures?',
    },
    {
        role: 'assistant',
        text: 'Wrap each stage in a transaction context using `ctx.checkpoint()` between stages. This way, if the deploy stage fails, the pipeline can roll back to the last clean state automatically...',
    },
]

export default function IdeMockup() {
    /* ── Countdown timer ── */
    const [timeLeft, setTimeLeft] = useState(59 * 60 + 45) // 59:45

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((t) => (t > 0 ? t - 1 : 0))
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0')
    const secs = (timeLeft % 60).toString().padStart(2, '0')

    /* ── AI typing animation ── */
    const [aiText, setAiText] = useState('')
    const [showCursor, setShowCursor] = useState(true)
    const [isThinking, setIsThinking] = useState(true)

    useEffect(() => {
        const fullText = AI_MESSAGES[1].text
        let i = 0
        const thinkTimeout = setTimeout(() => {
            setIsThinking(false)
            const interval = setInterval(() => {
                if (i <= fullText.length) {
                    setAiText(fullText.substring(0, i))
                    i++
                } else {
                    clearInterval(interval)
                    setTimeout(() => {
                        setAiText('')
                        setIsThinking(true)
                        i = 0
                    }, 5000)
                }
            }, 25)
            return () => clearInterval(interval)
        }, 1800)
        return () => clearTimeout(thinkTimeout)
    }, [isThinking && aiText === ''])

    useEffect(() => {
        const interval = setInterval(() => setShowCursor((p) => !p), 530)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="ide-mockup">
            {/* ═══ TOP TOOLBAR ═══ */}
            <div className="ide-toolbar">
                <div className="ide-toolbar-left">
                    <img src="/brand/logo-full.png" alt="Sponge" className="ide-toolbar-logo-full" />
                    <span className="ide-toolbar-divider" />
                    <span className="ide-toolbar-subtitle">Deploy Pipeline</span>
                </div>
                <div className="ide-toolbar-center">
                    <div className="ide-timer">
                        <span className="ide-timer-icon">⏱</span>
                        <span className="ide-timer-text">{mins}:{secs}</span>
                    </div>
                    <div className="ide-toolbar-progress">
                        <div className="ide-toolbar-progress-fill" />
                    </div>
                </div>
                <div className="ide-toolbar-right">
                    <button className="ide-toolbar-btn">Save</button>
                    <button className="ide-toolbar-btn">History</button>
                    <button className="ide-toolbar-btn ide-toolbar-btn--run">
                        <span className="ide-btn-icon">▶</span> Run
                    </button>
                    <button className="ide-toolbar-btn ide-toolbar-btn--submit">Submit</button>
                </div>
            </div>

            {/* ═══ MAIN BODY ═══ */}
            <div className="ide-body">
                {/* ── Left Sidebar: Task + Explorer ── */}
                <div className="ide-sidebar">
                    {/* Task panel */}
                    <div className="ide-task-panel">
                        <div className="ide-task-header">
                            <ProblemIcon />
                            <span className="ide-task-label">PROBLEM</span>
                            <ChevronIcon up />
                        </div>
                        <div className="ide-task-title">Build Deploy Pipeline</div>
                        <div className="ide-task-section">
                            <span className="ide-task-label">CONTEXT</span>
                            <p className="ide-task-desc">
                                Implement a deployment orchestrator that manages build, test,
                                and deploy stages with automatic rollback on failure.
                            </p>
                        </div>
                        <div className="ide-task-section">
                            <span className="ide-task-label">TASK</span>
                            <p className="ide-task-desc">
                                Extend the pipeline to checkpoint between stages.
                            </p>
                        </div>
                    </div>

                    {/* Explorer */}
                    <div className="ide-explorer">
                        <div className="ide-sidebar-header">
                            <ExplorerIcon />
                            <span>EXPLORER</span>
                        </div>
                        <div className="ide-file-tree">
                            {FILE_TREE.map((f, i) => (
                                <div
                                    key={i}
                                    className={`ide-file-item${f.active ? ' ide-file-item--active' : ''}`}
                                    style={{ paddingLeft: 12 + f.indent * 14 }}
                                >
                                    {f.type === 'folder' && (
                                        <span className="ide-folder-arrow">▸</span>
                                    )}
                                    <FileIcon type={f.type} />
                                    <span className="ide-file-name">{f.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Main Content: Editor + Bottom AI ── */}
                <div className="ide-main">
                    {/* Editor */}
                    <div className="ide-editor">
                        <div className="ide-editor-tabs">
                            <div className="ide-tab ide-tab--active">
                                <PythonIcon />
                                deploy.py
                                <span className="ide-tab-close">×</span>
                            </div>
                            <div className="ide-tab">
                                <PythonIcon />
                                pipeline.py
                            </div>
                        </div>
                        <div className="ide-code">
                            <div className="ide-line-numbers">
                                {Array.from({ length: 24 }, (_, i) => (
                                    <div key={i} className="ide-line-num">{i + 1}</div>
                                ))}
                            </div>
                            <pre className="ide-code-content">
                                {FAKE_CODE.map((tok, i) => (
                                    <span key={i} style={{ color: tok.color || 'inherit' }}>{tok.text}</span>
                                ))}
                            </pre>
                        </div>
                    </div>

                    {/* ── Bottom AI Assistant Panel ── */}
                    <div className="ide-bottom-panel">
                        <div className="ide-bottom-tabs">
                            <div className="ide-bottom-tab ide-bottom-tab--active">
                                <div className="ide-assistant-pulse" />
                                <span>AI ASSISTANT</span>
                            </div>
                            <div className="ide-bottom-tab">
                                <TestIcon />
                                <span>TESTS</span>
                            </div>
                            <div className="ide-bottom-tab-spacer" />
                            <span className="ide-model-label">
                                Model: Kimi K2.5 <ChevronIcon />
                            </span>
                        </div>
                        <div className="ide-assistant-chat">
                            {/* User message */}
                            <div className="ide-chat-msg ide-chat-msg--user">
                                <div className="ide-chat-avatar ide-chat-avatar--user">
                                    <img src="/brand/favicon-48x48.png" alt="User" className="ide-chat-user-icon" />
                                </div>
                                <p className="ide-chat-text">{AI_MESSAGES[0].text}</p>
                            </div>
                            {/* AI response */}
                            <div className="ide-chat-msg ide-chat-msg--ai">
                                <div className="ide-chat-avatar ide-chat-avatar--ai">
                                    <img src="/logos/kimi.svg" alt="Kimi" className="ide-chat-ai-icon" />
                                </div>
                                <div className="ide-chat-text">
                                    {isThinking ? (
                                        <span className="ide-thinking-dots">
                                            <span className="ide-thinking-dot" />
                                            <span className="ide-thinking-dot" />
                                            <span className="ide-thinking-dot" />
                                        </span>
                                    ) : (
                                        <>
                                            {aiText}
                                            <span className={`ide-chat-cursor ${showCursor ? '' : 'ide-chat-cursor--hidden'}`}>▎</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Input bar */}
                        <div className="ide-chat-input">
                            <span className="ide-chat-input-text">Ask the AI for help...</span>
                            <div className="ide-chat-input-send">↑</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
