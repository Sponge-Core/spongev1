import Navbar from '../components/shared/Navbar'

export default function EnterprisePage() {
    return (
        <div className="page-shell">
            <Navbar />
            <main className="page-placeholder">
                <span className="page-placeholder-badge">ENTERPRISE</span>
                <h1 className="page-placeholder-title">Hire with Sponge</h1>
                <p className="page-placeholder-desc">
                    Replace outdated coding interviews. Screen candidates on how they collaborate with AI in real-world codebases.
                </p>
            </main>
        </div>
    )
}
