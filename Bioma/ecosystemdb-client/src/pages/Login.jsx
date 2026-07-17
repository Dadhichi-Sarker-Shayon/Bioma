import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertCircle } from 'lucide-react';
import api from '../api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      if (response.data.token) {
        localStorage.setItem('bioma_admin_token', response.data.token);
        localStorage.setItem('bioma_admin_name', response.data.admin.fullName || response.data.admin.FullName || 'Admin');
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials or server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f2f5',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '380px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        padding: '2.5rem 2rem',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            background: '#eaf2f8',
            padding: '0.75rem',
            borderRadius: '50%',
            marginBottom: '1rem',
          }}>
            <Shield size={28} color="#1a3a5c" />
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a' }}>
            Bioma Admin
          </h1>
          <p style={{ color: '#777', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Sign in to the conservation portal
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fdecea',
            border: '1px solid #f5c6cb',
            color: '#721c24',
            padding: '0.625rem 0.75rem',
            borderRadius: '6px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
          }}>
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.625rem', fontSize: '0.9rem' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.7rem',
          color: '#999',
        }}>
          Bioma Wildlife Conservation System
        </div>
      </div>
    </div>
  );
};

export default Login;
