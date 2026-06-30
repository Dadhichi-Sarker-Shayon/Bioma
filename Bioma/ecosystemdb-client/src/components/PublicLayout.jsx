import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const PublicLayout = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Encyclopedia', path: '/encyclopedia' },
    { name: 'Taxonomy Tree', path: '/tree' },
    { name: 'Reserves', path: '/reserves' },
    { name: 'Sightings', path: '/sightings' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Background Effect */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'radial-gradient(circle at top right, rgba(0, 240, 255, 0.05), transparent 40%), radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.05), transparent 40%)',
        zIndex: -1, pointerEvents: 'none'
      }} />

      {/* Header / Navbar */}
      <header style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 50,
        transition: 'var(--transition)',
        background: scrolled ? 'rgba(15, 17, 21, 0.8)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-color)' : '1px solid transparent',
        padding: '1rem 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '2rem' }}>🌿</span>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '1px' }}>
              BIOMA
            </span>
          </Link>

          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                style={{
                  textDecoration: 'none',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  color: location.pathname === link.path ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  transition: 'var(--transition)',
                  position: 'relative'
                }}
                onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'}
                onMouseOut={(e) => e.target.style.color = location.pathname === link.path ? 'var(--accent-primary)' : 'var(--text-secondary)'}
              >
                {link.name}
                {location.pathname === link.path && (
                  <span style={{
                    position: 'absolute',
                    bottom: '-4px',
                    left: 0,
                    width: '100%',
                    height: '2px',
                    background: 'var(--accent-gradient)',
                    borderRadius: '2px',
                    boxShadow: 'var(--shadow-glow)'
                  }} />
                )}
              </Link>
            ))}
            
            <Link to="/admin/login" className="btn btn-secondary" style={{ marginLeft: '1rem', padding: '0.4rem 1rem', fontSize: '0.875rem' }}>
              Admin Portal
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, marginTop: '80px', paddingBottom: '4rem' }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', padding: '3rem 2rem 1.5rem', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🌿</span>
                <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>BIOMA</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '300px', fontSize: '0.875rem' }}>
                The Global Ecosystem Database. Monitoring, preserving, and educating about Earth's biodiversity.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '4rem' }}>
              <div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1rem' }}>Explore</h4>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {navLinks.map(link => (
                    <li key={link.name}>
                      <Link to={link.path} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', transition: 'var(--transition)' }}>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
              &copy; {new Date().getFullYear()} Bioma Database. All rights reserved.
            </p>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
              Dedicated to conservation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
