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
      <nav className="sidebar glass-panel">
        <div className="sidebar-logo text-gradient">
          <Shield size={28} />
          Bioma Admin
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavLink to="/admin/dashboard" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/admin/organisms" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Leaf size={20} /> Organisms & Sightings
          </NavLink>
          <NavLink to="/admin/reserves" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Map size={20} /> Reserves & Threats
          </NavLink>
          <NavLink to="/admin/tags" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Tags size={20} /> Global Tags
          </NavLink>
          <NavLink to="/admin/users" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Users size={20} /> System Users
          </NavLink>
        </div>

        <div style={{ paddingTop: '2rem', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
          <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Logged in as <strong style={{color: 'var(--text-primary)'}}>{adminName}</strong>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
            <LogOut size={18} /> Sign Out
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
