import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import api from '../services/api';
import logoImg from '../assets/logo.jpg';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/customers/login', formData);
      navigate('/home');
    } catch (err) {
      const code = err.statusCode || err.response?.status;
      const msg = err.response?.data?.message || err.message || 'Invalid Credentials';
      setError(code ? `[HTTP ${code}] ${msg}` : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <main className="main-content">
        <div className="glass-card animate-fade-in-up">
          <div className="form-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div className="brand-badge" style={{ width: '44px', height: '44px' }}>
                <img src={logoImg} alt="Streia Logo" className="brand-badge-img" />
              </div>
              <span className="brand-logo-text" style={{ fontSize: '1.85rem' }}>STREIA</span>
            </div>
            <h1>Welcome Back!</h1>
            <p>Sign in to continue your shopping journey</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-container">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="me@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-container">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="link-text" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Forgot password?</a>
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? <div className="spinner"></div> : 'Sign In'}
            </button>
          </form>

          <div className="divider">Or continue with</div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-social">Apple</button>
            <button type="button" className="btn btn-social">Google</button>
            <button type="button" className="btn btn-social">Meta</button>
          </div>

          <div className="form-footer">
            Don't have an account? <Link to="/register" className="link-text" style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>Create an account</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
