import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Leaf, Map, Tags, LogOut, Shield, Users } from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const adminName = localStorage.getItem('bioma_admin_name') || 'Admin';

  const handleLogout = () => {
    localStorage.removeItem('bioma_admin_token');
    localStorage.removeItem('bioma_admin_name');
    navigate('/admin/login');
  };

  return (
    <div className="admin-container">
      {/* Top Header Bar */}
      <header className="admin-header">
        <span className="admin-header-title">Bioma — Conservation Management</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{adminName}</span>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      <div className="admin-body">
        {/* Sidebar */}
        <nav className="sidebar">
          <div className="sidebar-logo">
            <Shield size={18} />
            <span>Bioma</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
            <NavLink to="/admin/dashboard" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={16} /> Dashboard
            </NavLink>
            <NavLink to="/admin/organisms" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Leaf size={16} /> Organisms
            </NavLink>
            <NavLink to="/admin/reserves" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Map size={16} /> Reserves
            </NavLink>
            <NavLink to="/admin/tags" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Tags size={16} /> Tags
            </NavLink>
            <NavLink to="/admin/users" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Users size={16} /> Users
            </NavLink>
          </div>
        </nav>

        {/* Main Content */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
