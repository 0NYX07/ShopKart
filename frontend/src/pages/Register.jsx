import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';
import api from '../services/api';
import logoImg from '../assets/logo.jpg';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: ''
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
      await api.post('/customers/register', formData);
      navigate('/login');
    } catch (err) {
      const code = err.statusCode || err.response?.status;
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
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
            <h1>Create Account</h1>
            <p>Join Streia to start your shopping journey</p>
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
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className="form-input"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-container">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-container">
                <Phone size={18} className="input-icon" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-input"
                  placeholder="Phone Number"
                  value={formData.phone}
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
              <label className="checkbox-label" style={{ fontSize: '0.75rem' }}>
                <input type="checkbox" required /> I agree to all statements in <a href="#" style={{ textDecoration: 'underline' }}>Terms of service</a>
              </label>
            </div>

            <button type="submit" className="btn" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? <div className="spinner"></div> : 'Sign Up'}
            </button>
          </form>

          <div className="form-footer">
            Already have an account? <Link to="/login" className="link-text" style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>Login here</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
