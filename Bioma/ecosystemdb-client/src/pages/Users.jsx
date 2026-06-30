import { useState, useEffect } from 'react';
import { Users as UsersIcon, Plus, Edit2, Trash2, Shield } from 'lucide-react';
import api from '../api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/users');
      setUsers(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', fullName: '', email: '' });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({ 
      username: user.username, 
      password: '', // Password left blank intentionally; only update if provided
      fullName: user.fullName || '', 
      email: user.email || '' 
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      if (editingUser) {
        // Update user
        const updateData = {
          fullName: formData.fullName || null,
          email: formData.email || null,
          ...(formData.password ? { password: formData.password } : {})
        };
        await api.put(`/auth/users/${editingUser.adminId}`, updateData);
      } else {
        // Create user
        if (!formData.username || !formData.password) {
          setFormError('Username and password are required.');
          setIsSubmitting(false);
          return;
        }
        await api.post('/auth/users', {
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName || null,
          email: formData.email || null
        });
      }
      
      closeModal();
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Are you sure you want to delete user @${username}?`)) return;
    
    try {
      await api.delete(`/auth/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user.');
    }
  };

  if (loading && users.length === 0) return <div className="animate-fade-in" style={{ padding: '2rem' }}>Loading users...</div>;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h2>System Users</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage administrator accounts and permissions.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Add User
        </button>
      </div>

      {error && <div className="badge badge-danger" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Admin ID</th>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Created At</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.adminId}>
                  <td style={{ color: 'var(--text-secondary)' }}>#{u.adminId}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Shield size={16} color="var(--accent-primary)" />
                      <strong style={{ color: 'var(--text-primary)' }}>@{u.username}</strong>
                    </div>
                  </td>
                  <td>{u.fullName || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Not provided</span>}</td>
                  <td>{u.email || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Not provided</span>}</td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => openEditModal(u)} title="Edit User">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--danger)', borderColor: 'var(--danger-border)' }} onClick={() => handleDelete(u.adminId, u.username)} title="Delete User">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay animate-fade-in" onClick={closeModal} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '1rem' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} color="var(--accent-primary)" />
              {editingUser ? 'Edit User' : 'Create New User'}
            </h3>
            
            {formError && <div className="badge badge-danger" style={{ marginBottom: '1.5rem', display: 'block' }}>{formError}</div>}
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Username {editingUser && '(Cannot be changed)'}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.username} 
                  onChange={e => setFormData({...formData, username: e.target.value})} 
                  disabled={!!editingUser}
                  required={!editingUser}
                  style={{ width: '100%', ...(editingUser ? { opacity: 0.6 } : {}) }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Password {editingUser && '(Leave blank to keep unchanged)'}</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  required={!editingUser}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.fullName} 
                  onChange={e => setFormData({...formData, fullName: e.target.value})} 
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Email</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
