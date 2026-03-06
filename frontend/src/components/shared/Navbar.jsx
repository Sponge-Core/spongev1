import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()

    const links = [
        { label: 'Roadmap', path: '/roadmap' },
        { label: 'Explore', path: '/problems' },
        { label: 'Enterprise', path: '/enterprise' },
    ]

    return (
        <nav className="site-navbar">
            <div className="site-navbar-inner">
                <div className="site-navbar-left">
                    <div className="site-navbar-logo" onClick={() => navigate('/')} role="button" tabIndex={0}>
                        <img
                            src="/brand/logo-full.png"
                            alt="Sponge"
                            className="site-navbar-logo-img"
                            height={26}
                        />
                    </div>
                    <div className="site-navbar-links">
                        {links.map(({ label, path }) => (
                            <button
                                key={path}
                                className={`site-navbar-link${location.pathname === path ? ' site-navbar-link--active' : ''}`}
                                onClick={() => navigate(path)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="site-navbar-right">
                    <button className="site-navbar-link" onClick={() => { }}>Sign In</button>
                    <button className="site-navbar-cta" onClick={() => navigate('/roadmap')}>
                        Get Started
                    </button>
                </div>
            </div>
        </nav>
    )
}
