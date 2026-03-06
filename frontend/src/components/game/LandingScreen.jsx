import { useState, useEffect, useRef, useCallback } from 'react'
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

export default function LandingScreen() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  // Typing effect
  const [wordIndex, setWordIndex] = useState(0)
  const [text, setText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

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
