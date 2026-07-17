import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Leaf, Map, Tags, LogOut, Shield, Users } from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('bioma_admin_token');
    localStorage.removeItem('bioma_admin_name');
    navigate('/admin/login');
  };

  const adminName = localStorage.getItem('bioma_admin_name') || 'Admin';

  return (
    <div className="admin-container">
      <nav className="sidebar">
        <div className="sidebar-logo" style={{ color: 'var(--accent-primary)' }}>
          <Shield size={24} />
          <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.5px' }}>Bioma Admin</span>
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <NavLink to="/admin/dashboard" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/admin/organisms" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Leaf size={18} /> Organisms & Sightings
          </NavLink>
          <NavLink to="/admin/reserves" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Map size={18} /> Reserves & Threats
          </NavLink>
          <NavLink to="/admin/tags" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Tags size={18} /> Global Tags
          </NavLink>
          <NavLink to="/admin/users" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Users size={18} /> System Users
          </NavLink>
        </div>

        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
          <div style={{ marginBottom: '0.75rem', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
            Signed in as <strong style={{color: 'var(--text-secondary)'}}>{adminName}</strong>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
