import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: ''
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
    const randomSuffix = Math.floor(Math.random() * 900) + 100;
    setFormData({
      fullName: 'Alex Morgan',
      email: `alex${randomSuffix}@example.com`,
      password: 'password123',
      phone: '+91 98765 43210'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { fullName, email, password, phone } = formData;

    if (!fullName || !email || !password || !phone) {
      setError('All fields are required.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/customers/register', {
        fullName,
        email,
        password,
        phone
      });

      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Background Animated Floating Shapes */}
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
          <h2>Create Customer Account</h2>
          <p className="auth-subtitle">Join ShopKart for exclusive catalog discounts and speedy checkout</p>
        </div>

        {error && (
          <div className="auth-alert-error shake-animation">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group-modern">
            <label htmlFor="fullName">Full Legal Name</label>
            <div className="input-with-icon">
              <span className="field-icon">👤</span>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Alex Morgan"
                required
              />
            </div>
          </div>

          <div className="form-group-modern">
            <label htmlFor="reg-email">Email Address</label>
            <div className="input-with-icon">
              <span className="field-icon">✉️</span>
              <input
                id="reg-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="alex@example.com"
                required
              />
            </div>
          </div>

          <div className="form-group-modern">
            <div className="form-label-row">
              <label htmlFor="reg-password">Password</label>
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
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                required
              />
            </div>
          </div>

          <div className="form-group-modern">
            <label htmlFor="phone">Phone Number</label>
            <div className="input-with-icon">
              <span className="field-icon">📞</span>
              <input
                id="phone"
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? (
              <span className="spinner-submit">Creating Account...</span>
            ) : (
              <span>Complete Registration →</span>
            )}
          </button>
        </form>

        <div className="auth-quick-tools">
          <button 
            type="button" 
            onClick={handleDemoFill}
            className="btn-demo-creds"
          >
            💡 Auto-Fill Sample Data
          </button>
        </div>

        <div className="auth-footer-links">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
          <p className="guest-browse-link">
            Or <Link to="/products">browse catalog as guest →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
