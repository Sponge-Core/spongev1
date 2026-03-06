import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import IdeMockup from '../landing/IdeMockup'
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/newsreader/400.css'
import '@fontsource/newsreader/400-italic.css'

const ROTATING_WORDS = [
  'workflow.',
  'ecosystem.',
  'stack.',
  'craft.',
  'environment.',
  'platform.',
  'future.'
]

const COMPANIES = [
  { name: 'Google', logo: '/logos/google.svg' },
  { name: 'Meta', logo: '/logos/meta.svg' },
  { name: 'OpenAI', logo: '/logos/openai.svg' },
  { name: 'Shopify', logo: '/logos/shopify.svg' },
  { name: 'Nvidia', logo: '/logos/nvidia.svg' },
  { name: 'Canva', logo: '/logos/canva.svg' },
  { name: 'Oracle', logo: '/logos/oracle.svg' },
]

const SCROLL_ITEMS = [
  {
    title: 'Real-World Problems',
    desc: 'Production-grade challenges designed by engineers from top companies. No toy examples — build deployment pipelines, design APIs, and architect systems.',
  },
  {
    title: 'AI Pair Programming',
    desc: 'Work side-by-side with an AI copilot that understands your codebase. Learn to prompt, delegate, and verify — the skills that matter most.',
  },
  {
    title: 'Instant Feedback',
    desc: 'Automated test suites validate your solutions in real time. Get detailed breakdowns of what passed, what failed, and why.',
  },
]

const FEATURES = [
  { icon: '⚡', label: 'REAL-TIME TESTING' },
  { icon: '🔍', label: 'CODE REVIEW' },
  { icon: '🔀', label: 'BRANCHING CHALLENGES' },
  { icon: '⏱', label: 'TIMED SESSIONS' },
  { icon: '🧩', label: 'MODULAR PROBLEMS' },
  { icon: '📊', label: 'PROGRESS TRACKING' },
]

export default function LandingScreen() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  // Typing effect
  const [wordIndex, setWordIndex] = useState(0)
  const [text, setText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  // Sticky scroll section
  const [activeScrollItem, setActiveScrollItem] = useState(0)
  const scrollSectionRef = useRef(null)
  const triggerRefs = useRef([])

  useEffect(() => {
    let timeout
    const currentWord = ROTATING_WORDS[wordIndex]
    if (isDeleting) {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(currentWord.substring(0, text.length - 1)), 40)
      } else {
        setIsDeleting(false)
        setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length)
        timeout = setTimeout(() => { }, 200)
      }
    } else {
      if (text.length < currentWord.length) {
        timeout = setTimeout(() => setText(currentWord.substring(0, text.length + 1)), 70)
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 2000)
      }
    }
    return () => clearTimeout(timeout)
  }, [text, isDeleting, wordIndex])

  // Scroll-driven active item detection
  useEffect(() => {
    const triggers = triggerRefs.current
    if (!triggers.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.index)
            setActiveScrollItem(idx)
          }
        })
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    )

    triggers.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleStart = () => {
    setLoading(true)
    setTimeout(() => navigate('/problems'), 400)
  }

  return (
    <div
      className="lp"
      style={loading ? { opacity: 0, transition: 'opacity 0.4s ease-out', pointerEvents: 'none' } : undefined}
    >
      {/* ─── NAVBAR ─── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-nav-left">
            <img
              src="/brand/logo-full-dark.png"
              alt="Sponge"
              className="lp-nav-logo"
              onClick={() => navigate('/')}
            />
            <div className="lp-nav-links">
              <button onClick={() => navigate('/roadmap')}>Roadmap</button>
              <button onClick={() => navigate('/problems')}>Explore</button>
              <button onClick={() => navigate('/enterprise')}>Enterprise</button>
            </div>
          </div>
          <div className="lp-nav-right">
            <button className="lp-nav-signin">Sign In</button>
            <Button className="lp-nav-cta" onClick={handleStart}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="lp-hero">
        <div className="lp-hero-left">
          <h1 className="lp-hero-h1">
            Master the<br />
            <span className="lp-hero-italic">
              <span style={{ whiteSpace: 'nowrap' }}>AI-native</span>{' '}
              <span className="lp-hero-typing">{text}</span>
              <span className="lp-hero-cursor">|</span>
            </span>
          </h1>
        </div>
        <div className="lp-hero-right">
          <p className="lp-hero-desc">
            Practice building real-world software side-by-side
            with an AI pair programmer. Stop memorizing syntax.
            Start architecting systems.
          </p>
          <div className="lp-hero-ctas">
            <Button className="lp-hero-btn-primary" onClick={handleStart}>
              Get Started ↗
            </Button>
            <Button variant="outline" className="lp-hero-btn-secondary" onClick={() => navigate('/problems')}>
              Browse Challenges
            </Button>
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF ─── */}
      <section className="lp-logos">
        <p className="lp-logos-label">Companies adopting AI-assisted interviews:</p>
        <div className="lp-logos-marquee">
          <div className="lp-logos-track">
            {COMPANIES.map((c, i) => (
              <div key={i} className="lp-logos-item">
                <img src={c.logo} alt={`${c.name}`} className="lp-logos-img" style={c.imgStyle} />
              </div>
            ))}
            {COMPANIES.map((c, i) => (
              <div key={`dup-${i}`} className="lp-logos-item">
                <img src={c.logo} alt={`${c.name}`} className="lp-logos-img" style={c.imgStyle} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRODUCT SHOWCASE ─── */}
      <section className="lp-product-showcase">
        <div className="lp-product-wrapper">
          <img src="/hero.png" alt="" className="lp-product-bg" />
          <div className="lp-product-overlay">
            <IdeMockup />
          </div>
        </div>
      </section>

      {/* ─── FILMSTRIP DIVIDER ─── */}
      <div className="lp-filmstrip">
        <div className="lp-filmstrip-bar">
          <span className="lp-filmstrip-label">FIG 001</span>
          <div className="lp-filmstrip-ticks">
            {Array.from({ length: 60 }).map((_, i) => (
              <div key={i} className="lp-filmstrip-tick" />
            ))}
          </div>
          <span className="lp-filmstrip-label">FIG 003</span>
        </div>
      </div>

      {/* ─── STICKY SCROLL SECTION ─── */}
      <section className="lp-scroll-section" ref={scrollSectionRef}>
        <div className="lp-scroll-sticky">
          {/* Left: heading + items */}
          <div className="lp-scroll-left">
            <h2 className="lp-scroll-heading">
              Everything you need to{' '}
              <span className="lp-scroll-heading-accent">master coding</span>
            </h2>

            <div className="lp-scroll-items">
              {/* Progress line */}
              <div className="lp-scroll-progress">
                <div
                  className="lp-scroll-progress-dot lp-scroll-progress-dot--top"
                  style={{ background: activeScrollItem >= 0 ? '#e0a030' : '#ccc' }}
                />
                <div className="lp-scroll-progress-line">
                  <div
                    className="lp-scroll-progress-fill"
                    style={{ height: `${(activeScrollItem / (SCROLL_ITEMS.length - 1)) * 100}%` }}
                  />
                </div>
                <div
                  className="lp-scroll-progress-dot lp-scroll-progress-dot--bottom"
                  style={{ background: activeScrollItem >= SCROLL_ITEMS.length - 1 ? '#e0a030' : '#ccc' }}
                />
              </div>

              <div className="lp-scroll-items-list">
                {SCROLL_ITEMS.map((item, i) => (
                  <div
                    key={i}
                    className={`lp-scroll-item ${activeScrollItem === i ? 'lp-scroll-item--active' : ''}`}
                  >
                    <h3 className="lp-scroll-item-title">{item.title}</h3>
                    {activeScrollItem === i && (
                      <p className="lp-scroll-item-desc">{item.desc}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: visual placeholder that changes per item */}
          <div className="lp-scroll-right">
            <div className="lp-scroll-visual" key={activeScrollItem}>
              <div className="lp-scroll-fig-label">FIG. {String(activeScrollItem + 1).padStart(3, '0')}</div>
              <div className="lp-scroll-placeholder">
                <div className="lp-scroll-placeholder-icon">
                  {activeScrollItem === 0 && (
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                      <rect x="8" y="8" width="48" height="48" rx="8" stroke="#1a1a1a" strokeWidth="2" fill="none" />
                      <path d="M20 32h24M32 20v24" stroke="#e0a030" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                  {activeScrollItem === 1 && (
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                      <circle cx="32" cy="32" r="24" stroke="#1a1a1a" strokeWidth="2" fill="none" />
                      <circle cx="32" cy="32" r="14" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
                      <circle cx="32" cy="32" r="6" fill="#e0a030" />
                    </svg>
                  )}
                  {activeScrollItem === 2 && (
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                      <rect x="8" y="14" width="48" height="36" rx="4" stroke="#1a1a1a" strokeWidth="2" fill="none" />
                      <path d="M8 24h48" stroke="#1a1a1a" strokeWidth="1.5" />
                      <rect x="14" y="30" width="16" height="4" rx="2" fill="#e0a030" />
                      <rect x="14" y="38" width="10" height="4" rx="2" fill="#ccc" />
                      <rect x="34" y="30" width="16" height="12" rx="2" fill="none" stroke="#ccc" strokeWidth="1.5" />
                    </svg>
                  )}
                </div>
                <span className="lp-scroll-placeholder-label">
                  {['Challenge workspace preview', 'AI collaboration diagram', 'Live test results view'][activeScrollItem]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Invisible scroll triggers */}
        <div className="lp-scroll-triggers">
          {SCROLL_ITEMS.map((_, i) => (
            <div
              key={i}
              className="lp-scroll-trigger"
              ref={(el) => (triggerRefs.current[i] = el)}
              data-index={i}
            />
          ))}
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section className="lp-features">
        <div className="lp-features-header">
          <span className="lp-features-badge">FEATURES</span>
          <h2 className="lp-features-heading">
            Building blocks for{' '}
            <span className="lp-features-heading-accent">growth and mastery</span>
          </h2>
          <p className="lp-features-subtext">
            Real-world coding challenges with AI pair programming,
            instant feedback, and structured learning paths you can run at your own pace.
          </p>
        </div>

        <div className="lp-features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="lp-feature-card">
              <span className="lp-feature-icon">{f.icon}</span>
              <span className="lp-feature-label">{f.label}</span>
              <span className="lp-feature-num">NO. {i + 1}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="lp-cta">
        <div className="lp-cta-inner">
          <h2 className="lp-cta-heading">
            Get started in{' '}
            <span className="lp-cta-accent">minutes</span>
          </h2>
          <p className="lp-cta-desc">
            Try our playground, and start with free challenges
            to level up your AI-native engineering skills.
          </p>
          <div className="lp-cta-buttons">
            <Button className="lp-hero-btn-primary" onClick={handleStart}>
              Get Started ↗
            </Button>
            <Button variant="outline" className="lp-hero-btn-secondary" onClick={() => navigate('/problems')}>
              Browse Challenges ↗
            </Button>
          </div>
        </div>
        <div className="lp-cta-image">
          <img src="/hero.png" alt="" />
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <img src="/brand/logo-full-dark.png" alt="Sponge" className="lp-footer-logo" />
          <div className="lp-footer-links">
            <button onClick={() => navigate('/roadmap')}>Roadmap</button>
            <button onClick={() => navigate('/problems')}>Explore</button>
            <button onClick={() => navigate('/enterprise')}>Enterprise</button>
          </div>
          <p className="lp-footer-copy">© 2025 Sponge</p>
        </div>
      </footer>
    </div>
  )
}
