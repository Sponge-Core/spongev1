import Navbar from '../components/shared/Navbar'

export default function RoadmapPage() {
    return (
        <div className="page-shell">
            <Navbar />
            <main className="page-placeholder">
                <span className="page-placeholder-badge">COMING SOON</span>
                <h1 className="page-placeholder-title">The Sponge 75</h1>
                <p className="page-placeholder-desc">
                    A curated roadmap of 75 essential AI collaboration patterns across real-world codebases.
                </p>
            </main>
        </div>
    )
}
