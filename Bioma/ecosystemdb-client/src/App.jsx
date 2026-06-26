import { useState, useEffect, useCallback, useRef } from 'react'
import './index.css'
import './LandingPage.css'
import LandingPage from './LandingPage.jsx'
import PublicEncyclopediaView from './components/PublicEncyclopediaView.jsx'
import SpeciesProfilePage from './components/SpeciesProfilePage.jsx'
import DashboardView from './components/DashboardView.jsx'
import TaxonomyView from './components/TaxonomyView.jsx'

// ═══════════════════════════════════════════════════════════
// API Helper
// ═══════════════════════════════════════════════════════════
const api = async (url, options = {}) => {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed')
  return data
}

// ═══════════════════════════════════════════════════════════
// ROLE HELPERS
// ═══════════════════════════════════════════════════════════
const getRoleClass = (role) => {
  if (!role) return ''
  if (role.includes('Global')) return 'role-global-admin'
  if (role.includes('Field')) return 'role-field-researcher'
  if (role.includes('Sanctuary')) return 'role-sanctuary-admin'
  return ''
}

const getRoleBadgeClass = (role) => {
  if (!role) return ''
  if (role.includes('Global')) return 'global-admin'
  if (role.includes('Field')) return 'field-researcher'
  if (role.includes('Sanctuary')) return 'sanctuary-admin'
  return ''
}

const getInitials = (user) => {
  if (!user) return '?'
  return `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase()
}

// ═══════════════════════════════════════════════════════════
// TOAST NOTIFICATION SYSTEM
// ═══════════════════════════════════════════════════════════
function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => onDismiss(t.id)}>
          <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// USER SWITCHER DROPDOWN
// ═══════════════════════════════════════════════════════════
function UserSwitcher({ users, activeUser, onSwitch }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className={`user-switcher ${open ? 'open' : ''}`} ref={ref}>
      <button className="user-switcher-btn" onClick={() => setOpen(!open)} id="user-switcher-toggle">
        <div className={`user-avatar ${getRoleClass(activeUser?.roleName)}`}>
          {getInitials(activeUser)}
        </div>
        <div className="user-info">
          <span className="user-name">{activeUser?.firstName} {activeUser?.lastName}</span>
          <span className="user-role">{activeUser?.roleName}</span>
        </div>
        <span className="switcher-chevron">▼</span>
      </button>

      {open && (
        <div className="user-dropdown">
          <div className="dropdown-header">Switch Active User</div>
          {users.map((u) => (
            <button
              key={u.userId}
              className={`dropdown-item ${activeUser?.userId === u.userId ? 'active' : ''}`}
              onClick={() => { onSwitch(u); setOpen(false) }}
            >
              <div className={`user-avatar ${getRoleClass(u.roleName)}`}>
                {getInitials(u)}
              </div>
              <div className="item-details">
                <span className="item-name">{u.firstName} {u.lastName}</span>
                <span className="item-role">{u.roleName} — @{u.username}</span>
              </div>
            </button>
          ))}
          <div className="dropdown-divider" />
          <button className="dropdown-item" onClick={() => { setOpen(false) }} style={{ color: 'var(--text-muted)' }}>
            <span style={{ width: 30, textAlign: 'center' }}>＋</span>
            <span>Register New User...</span>
          </button>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// SIDEBAR NAVIGATION
// ═══════════════════════════════════════════════════════════
const NAV_ITEMS = [
  { section: 'Overview', items: [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  ]},
  { section: 'Biodiversity', items: [
    { id: 'taxonomy', icon: '🌳', label: 'Tree of Life' },
    { id: 'encyclopedia', icon: '📖', label: 'Encyclopedia' },
    { id: 'sightings', icon: '👁️', label: 'Sightings Logger' },
  ]},
  { section: 'Conservation', items: [
    { id: 'threats', icon: '⚠️', label: 'Threat Reports' },
    { id: 'reserves', icon: '🏕️', label: 'Reserves' },
    { id: 'procedures', icon: '⚡', label: 'PL/SQL Terminal' },
  ]},
  { section: 'Administration', items: [
    { id: 'users', icon: '👥', label: 'User Management' },
    { id: 'tags', icon: '🏷️', label: 'Tag Manager' },
  ]},
]

function Sidebar({ activeView, onNavigate }) {
  return (
    <nav className="app-sidebar" id="app-sidebar">
      {NAV_ITEMS.map((section) => (
        <div className="sidebar-section" key={section.section}>
          <div className="sidebar-section-title">{section.section}</div>
          {section.items.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
              id={`nav-${item.id}`}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ))}
    </nav>
  )
}

// ═══════════════════════════════════════════════════════════
// MODULE 1 — LOGIN / REGISTER VIEW
// ═══════════════════════════════════════════════════════════
function AuthView({ onLogin, addToast }) {
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    username: '', password: '', firstName: '', lastName: '',
    email: '', roleName: 'Field Researcher', affiliation: ''
  })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: form.username, password: form.password })
      })
      addToast('success', `Welcome back, ${user.firstName}!`)
      onLogin(user)
    } catch (err) {
      addToast('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(form)
      })
      addToast('success', result.message)
      onLogin(result.user)
    } catch (err) {
      addToast('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-card-logo">
          <div className="logo-icon">🌿</div>
          <h2>Bioma</h2>
          <p>Biogeographical Taxonomy & Conservation Database</p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} id="login-form">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" name="username" value={form.username}
                onChange={handleChange} placeholder="e.g. admin01" required id="login-username" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" name="password" type="password" value={form.password}
                onChange={handleChange} placeholder="Enter your password" required id="login-password" />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading} id="login-submit">
                {loading ? <span className="spinner" /> : null}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
            <div className="auth-toggle">
              Don't have an account? <button type="button" onClick={() => setMode('register')}>Create one</button>
            </div>
            <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(52,211,153,0.06)', borderRadius: 8, border: '1px solid rgba(52,211,153,0.12)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Demo Credentials</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <code style={{ color: 'var(--emerald-400)', fontFamily: 'JetBrains Mono, monospace' }}>admin01</code> · Global Admin<br/>
                <code style={{ color: 'var(--sky-400)', fontFamily: 'JetBrains Mono, monospace' }}>researcher01</code> · Field Researcher<br/>
                <code style={{ color: 'var(--amber-400)', fontFamily: 'JetBrains Mono, monospace' }}>sanctuary01</code> · Sanctuary Admin<br/>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Password: <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>password123</code></span>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} id="register-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="form-input" name="firstName" value={form.firstName}
                  onChange={handleChange} placeholder="Jane" required />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-input" name="lastName" value={form.lastName}
                  onChange={handleChange} placeholder="Goodall" required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" name="username" value={form.username}
                onChange={handleChange} placeholder="Choose a username" required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" name="email" type="email" value={form.email}
                onChange={handleChange} placeholder="researcher@institute.org" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" name="password" type="password" value={form.password}
                onChange={handleChange} placeholder="Create a strong password" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" name="roleName" value={form.roleName} onChange={handleChange}>
                  <option>Field Researcher</option>
                  <option>Sanctuary Admin</option>
                  <option>Global Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Affiliation</label>
                <input className="form-input" name="affiliation" value={form.affiliation}
                  onChange={handleChange} placeholder="Organization" />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading} id="register-submit">
                {loading ? <span className="spinner" /> : null}
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
            <div className="auth-toggle">
              Already have an account? <button type="button" onClick={() => setMode('login')}>Sign in</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// MODULE 1 — USER MANAGEMENT VIEW
// ═══════════════════════════════════════════════════════════
function UsersView({ users, activeUser, addToast, refreshUsers }) {
  const [showRegister, setShowRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    username: '', password: '', firstName: '', lastName: '',
    email: '', roleName: 'Field Researcher', affiliation: ''
  })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(form)
      })
      addToast('success', result.message)
      setShowRegister(false)
      setForm({ username: '', password: '', firstName: '', lastName: '', email: '', roleName: 'Field Researcher', affiliation: '' })
      refreshUsers()
    } catch (err) {
      addToast('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api(`/api/auth/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ roleName: newRole })
      })
      addToast('success', `Role updated to ${newRole}`)
      refreshUsers()
    } catch (err) {
      addToast('error', err.message)
    }
  }

  const isAdmin = activeUser?.roleName === 'Global Admin'

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-description">
          Manage system users and their role-based access. {users.length} registered user{users.length !== 1 ? 's' : ''}.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={() => setShowRegister(true)} id="btn-new-user">
          <span>＋</span> Register New User
        </button>
      </div>

      <div className="users-grid">
        {users.map((u) => (
          <div className="user-card" key={u.userId}>
            <div className={`user-card-avatar ${getRoleClass(u.roleName)}`}>
              {getInitials(u)}
            </div>
            <div className="user-card-info">
              <div className="user-card-name">{u.firstName} {u.lastName}</div>
              <div className="user-card-username">@{u.username}</div>
              <div className="user-card-meta">
                <span className={`role-badge ${getRoleBadgeClass(u.roleName)}`}>
                  {u.roleName}
                </span>
                {u.affiliation && (
                  <span className="meta-tag">🏛️ {u.affiliation}</span>
                )}
                <span className="meta-tag">📧 {u.email}</span>
              </div>
              {isAdmin && u.userId !== activeUser?.userId && (
                <div style={{ marginTop: 10 }}>
                  <select
                    className="form-select"
                    value={u.roleName}
                    onChange={(e) => handleRoleChange(u.userId, e.target.value)}
                    style={{ maxWidth: 200, padding: '5px 10px', fontSize: '0.75rem' }}
                  >
                    <option>Field Researcher</option>
                    <option>Sanctuary Admin</option>
                    <option>Global Admin</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Register Modal */}
      {showRegister && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowRegister(false) }}>
          <div className="modal-content">
            <h3 className="modal-title">Register New User</h3>
            <form onSubmit={handleRegister}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input className="form-input" name="firstName" value={form.firstName}
                    onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input className="form-input" name="lastName" value={form.lastName}
                    onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="form-input" name="username" value={form.username}
                  onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" name="email" type="email" value={form.email}
                  onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" name="password" type="password" value={form.password}
                  onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-select" name="roleName" value={form.roleName} onChange={handleChange}>
                    <option>Field Researcher</option>
                    <option>Sanctuary Admin</option>
                    <option>Global Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Affiliation</label>
                  <input className="form-input" name="affiliation" value={form.affiliation}
                    onChange={handleChange} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setShowRegister(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// PLACEHOLDER VIEWS (for upcoming modules)
// ═══════════════════════════════════════════════════════════
function PlaceholderView({ title, icon, description }) {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      <div className="glass-card">
        <div className="empty-state">
          <div className="empty-state-icon">{icon}</div>
          <h3>Coming Soon</h3>
          <p>This module is under development and will be available in the next release.</p>
        </div>
      </div>
    </div>
  )
}

// DashboardView is imported from './components/DashboardView.jsx'

// TaxonomyView is imported from './components/TaxonomyView.jsx'

function EncyclopediaView() {
  return <PlaceholderView title="Species Encyclopedia" icon="📖" description="Searchable species database with multi-tag filtering." />
}

function SightingsView() {
  return <PlaceholderView title="Sightings Logger" icon="👁️" description="Log field observations and track species populations." />
}

function ThreatsView() {
  return <PlaceholderView title="Threat Reports" icon="⚠️" description="Monitor and report environmental threats across regions." />
}

function ReservesView() {
  return <PlaceholderView title="Conservation Reserves" icon="🏕️" description="Manage protected areas and sanctuary health analytics." />
}

function ProceduresView() {
  return <PlaceholderView title="PL/SQL Terminal" icon="⚡" description="Execute stored procedures and view DBMS_OUTPUT logs." />
}

function TagsView() {
  return <PlaceholderView title="Tag Manager" icon="🏷️" description="Create and assign categorical tags to organisms." />
}

// ═══════════════════════════════════════════════════════════
// MAIN APPLICATION
// ═══════════════════════════════════════════════════════════
function App() {
  const [activeUser, setActiveUser] = useState(null)
  const [users, setUsers] = useState([])
  const [activeView, setActiveView] = useState('dashboard')
  const [toasts, setToasts] = useState([])
  const [seeding, setSeeding] = useState(false)
  const [dbStatus, setDbStatus] = useState(null)
  const [showPortal, setShowPortal] = useState('landing') // 'landing' | 'admin'
  const [publicView, setPublicView] = useState('home') // 'home' | 'encyclopedia' | 'species-profile'
  const [selectedSpeciesId, setSelectedSpeciesId] = useState(null)
  const toastIdRef = useRef(0)

  // ─── Body scroll control: landing page needs scrolling, admin does not ───
  useEffect(() => {
    document.body.style.overflow = showPortal === 'landing' ? 'auto' : 'hidden'
    return () => { document.body.style.overflow = 'hidden' }
  }, [showPortal])

  // ─── Toast Helpers ───
  const addToast = useCallback((type, message) => {
    const id = ++toastIdRef.current
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // ─── Load Users ───
  const fetchUsers = useCallback(async () => {
    try {
      const data = await api('/api/auth/users')
      setUsers(data)
      return data
    } catch {
      // Database may not be seeded yet
      setUsers([])
      return []
    }
  }, [])

  // ─── Check DB Status ───
  useEffect(() => {
    const checkDb = async () => {
      try {
        const data = await api('/api/setup/version')
        setDbStatus(data.version ? 'connected' : 'unknown')
      } catch {
        setDbStatus('disconnected')
      }
    }
    checkDb()
  }, [])

  // ─── Seed Database ───
  const handleSeed = async () => {
    setSeeding(true)
    try {
      const result = await api('/api/setup/seed', { method: 'POST' })
      addToast('success', `${result.message} (${result.tablesCount} tables created)`)
      const data = await fetchUsers()
      if (data.length > 0 && !activeUser) {
        setActiveUser(data[0])
      }
    } catch (err) {
      addToast('error', `Seed failed: ${err.message}`)
    } finally {
      setSeeding(false)
    }
  }

  // ─── Login Handler ───
  const handleLogin = async (user) => {
    setActiveUser(user)
    await fetchUsers()
  }

  // ─── User Switch Handler ───
  const handleUserSwitch = (user) => {
    setActiveUser(user)
    addToast('info', `Switched to ${user.firstName} ${user.lastName} (${user.roleName})`)
  }

  // ─── Render View ───
  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView />
      case 'taxonomy': return <TaxonomyView activeUser={activeUser} addToast={addToast} />
      case 'encyclopedia': return <EncyclopediaView />
      case 'sightings': return <SightingsView />
      case 'threats': return <ThreatsView />
      case 'reserves': return <ReservesView />
      case 'procedures': return <ProceduresView />
      case 'tags': return <TagsView />
      case 'users': return <UsersView users={users} activeUser={activeUser} addToast={addToast} refreshUsers={fetchUsers} />
      default: return <DashboardView />
    }
  }

  // ─── Public Portal Landing Page ───
  if (showPortal === 'landing') {
    if (publicView === 'species-profile' && selectedSpeciesId) {
      return (
        <SpeciesProfilePage
          organismId={selectedSpeciesId}
          onBack={() => { setPublicView('encyclopedia'); setSelectedSpeciesId(null) }}
          onEnterAdmin={() => setShowPortal('admin')}
        />
      )
    }
    if (publicView === 'encyclopedia') {
      return (
        <PublicEncyclopediaView
          onBack={() => setPublicView('home')}
          onEnterAdmin={() => setShowPortal('admin')}
          onViewSpecies={(id) => { setSelectedSpeciesId(id); setPublicView('species-profile') }}
        />
      )
    }
    return (
      <LandingPage
        onEnterAdmin={() => setShowPortal('admin')}
        onExplore={() => setPublicView('encyclopedia')}
        onSelectView={(view) => {
          if (view === 'encyclopedia') setPublicView('encyclopedia')
        }}
      />
    )
  }

  // ─── Not Logged In → Show Auth Screen ───
  if (!activeUser) {
    return (
      <>
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        <header className="app-header">
          <div className="app-brand">
            <div className="app-brand-icon" style={{ cursor: 'pointer' }} onClick={() => setShowPortal('landing')} title="Back to Public Portal">
              🌿
            </div>
            <div>
              <h1>Bioma</h1>
              <span>Conservation Ecosystem Database</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn" onClick={() => setShowPortal('landing')} id="btn-back-portal" title="Back to Public Portal">
              🌍 Public Portal
            </button>
            <div className="connection-indicator">
              <span className={`status-dot ${dbStatus === 'connected' ? 'online' : dbStatus === 'disconnected' ? 'danger' : 'warning'}`} />
              {dbStatus === 'connected' ? 'Oracle Connected' : dbStatus === 'disconnected' ? 'DB Offline' : 'Checking...'}
            </div>
            <button className="btn btn-primary" onClick={handleSeed} disabled={seeding} id="btn-seed-db">
              {seeding ? <span className="spinner" /> : <span>🌱</span>}
              {seeding ? 'Seeding...' : 'Setup Database'}
            </button>
          </div>
        </header>
        <AuthView onLogin={handleLogin} addToast={addToast} />
      </>
    )
  }

  // ─── Logged In → Full Application Shell ───
  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <header className="app-header">
        <div className="app-brand">
          <div className="app-brand-icon">🌿</div>
          <div>
            <h1>Bioma</h1>
            <span>Conservation Ecosystem Database</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn" onClick={() => { setActiveUser(null); setShowPortal('landing') }} id="btn-back-portal-admin" title="Back to Public Portal">
            🌍 Public Portal
          </button>
          <div className="connection-indicator">
            <span className={`status-dot ${dbStatus === 'connected' ? 'online' : 'danger'}`} />
            {dbStatus === 'connected' ? 'Oracle Connected' : 'DB Offline'}
          </div>
          <button className="btn" onClick={handleSeed} disabled={seeding} id="btn-reseed-db">
            {seeding ? <span className="spinner" /> : <span>🌱</span>}
            {seeding ? 'Seeding...' : 'Re-Seed DB'}
          </button>
          <UserSwitcher users={users} activeUser={activeUser} onSwitch={handleUserSwitch} />
          <button className="btn btn-sm" onClick={() => setActiveUser(null)} id="btn-logout" title="Sign Out">
            🚪 Sign Out
          </button>
        </div>
      </header>
      <div className="app-layout">
        <Sidebar activeView={activeView} onNavigate={setActiveView} />
        <main className="app-main" id="main-content">
          {renderView()}
        </main>
      </div>
    </>
  )
}

export default App
