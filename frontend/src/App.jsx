import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SessionProvider } from './hooks/useSession'
import LandingScreen from './components/game/LandingScreen'
import ProblemsPage from './pages/ProblemsPage'
import RoadmapPage from './pages/RoadmapPage'
import EnterprisePage from './pages/EnterprisePage'
import DemoPage from './pages/DemoPage'
import ErrorBanner from './components/ErrorBanner'
import ErrorBoundary from './components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SessionProvider>
          <ErrorBanner />
          <Routes>
            <Route path="/" element={<LandingScreen />} />
            <Route path="/problems" element={<ProblemsPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/enterprise" element={<EnterprisePage />} />
            <Route path="/demo/:problemId?" element={<DemoPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SessionProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
