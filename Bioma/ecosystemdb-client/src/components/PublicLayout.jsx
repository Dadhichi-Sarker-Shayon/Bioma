import { Outlet, Link, useLocation } from 'react-router-dom';

const PublicLayout = () => {
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Encyclopedia', path: '/encyclopedia' },
    { name: 'Taxonomy Tree', path: '/tree' },
    { name: 'Reserves', path: '/reserves' },
    { name: 'Sightings', path: '/sightings' },
  ];

  return (
    <div className="public-container">
      {/* Header */}
      <header className="public-header">
        <Link to="/" className="public-header-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <img src="/logo-icon.svg" alt="Bioma" style={{ height: '32px', width: '32px' }} />
          <span>BIOMA</span>
        </Link>
        <nav className="public-nav">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={location.pathname === link.path ? 'active' : ''}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/admin/login"
            style={{
              padding: '0.3rem 0.75rem',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '4px',
              marginLeft: '0.5rem',
            }}
          >
            Admin
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="public-main">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="public-footer">
        <span>&copy; {new Date().getFullYear()} Bioma. All rights reserved.</span>
        <span>Wildlife &amp; Conservation Management System</span>
      </footer>
    </div>
  );
};

export default PublicLayout;
