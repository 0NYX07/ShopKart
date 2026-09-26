import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDemoFill = () => {
    setFormData({
      email: 'alex@example.com',
      password: 'password123'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Invalid Credentials');
      return;
    }

    try {
      setLoading(true);
      await api.post('/customers/login', {
        email: formData.email,
        password: formData.password
      });

      navigate('/home');
    } catch {
      setError('Invalid Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Background Animated Floating Pastel Shapes */}
      <div className="floating-shape shape-blue"></div>
      <div className="floating-shape shape-red"></div>
      <div className="floating-shape shape-yellow"></div>

      <div className="auth-card-modern">
        {/* Brand Header */}
        <div className="auth-header">
          <Link to="/products" className="auth-brand-link">
            <div className="brand-icon-wrapper">
              <span className="dot dot-red"></span>
              <span className="dot dot-blue"></span>
              <span className="dot dot-yellow"></span>
            </div>
            <span className="brand-text">Shop<strong>Kart</strong></span>
          </Link>
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to access your customer dashboard & orders</p>
        </div>

        {error && (
          <div className="auth-alert-error shake-animation">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group-modern">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <span className="field-icon">✉️</span>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div className="form-group-modern">
            <div className="form-label-row">
              <label htmlFor="password">Password</label>
              <button 
                type="button" 
                className="btn-toggle-pw" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="input-with-icon">
              <span className="field-icon">🔒</span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? (
              <span className="spinner-submit">Signing in...</span>
            ) : (
              <span>Sign In to Account →</span>
            )}
          </button>
        </form>

        <div className="auth-quick-tools">
          <button 
            type="button" 
            onClick={handleDemoFill}
            className="btn-demo-creds"
          >
            💡 Quick Demo Credentials
          </button>
        </div>

        <div className="auth-footer-links">
          <p>
            Don't have an account? <Link to="/register">Create Account</Link>
          </p>
          <p className="guest-browse-link">
            Or <Link to="/products">browse catalog as guest →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
