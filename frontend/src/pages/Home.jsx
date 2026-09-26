import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';

function Home() {
  const navigate = useNavigate();
  const { totalCount, setIsCartOpen } = useCart();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const response = await api.get('/customers/me');
        if (isMounted) {
          setUser(response.data);
        }
      } catch {
        if (isMounted) {
          // If authentication fails (401), navigate to login
          navigate('/login');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post('/customers/logout');
    } catch {
      // Proceed
    } finally {
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="dashboard-loading-container">
          <div className="spinner-dots">
            <span className="dot dot-red"></span>
            <span className="dot dot-blue"></span>
            <span className="dot dot-yellow"></span>
          </div>
          <p>Loading your profile session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="dashboard-container">
        {/* Welcome Hero Banner */}
        <section className="dashboard-hero">
          <div className="dashboard-hero-content">
            <div className="user-hero-avatar">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="hero-badge-group">
                <span className="pill-badge pill-blue">Active Session</span>
                <span className="pill-badge pill-yellow">Verified Member</span>
              </div>
              <h1 className="dashboard-greeting">
                Welcome back, {user.fullName}!
              </h1>
              <p className="dashboard-subtext">
                Manage your account credentials, security settings, and shop with exclusive perks.
              </p>
            </div>
          </div>

          <div className="dashboard-hero-actions">
            <Link to="/products" className="btn-dash-primary">
              Browse Store →
            </Link>
            <button 
              className="btn-dash-cart"
              onClick={() => setIsCartOpen(true)}
            >
              My Cart ({totalCount})
            </button>
          </div>
        </section>

        {/* 3 Quick Cards (Light Red, Light Blue, Light Yellow) */}
        <div className="dashboard-cards-grid">
          {/* Card 1: Light Blue - Account Status */}
          <div className="metric-card metric-blue">
            <div className="metric-header">
              <span className="metric-icon">🛡️</span>
              <span className="metric-tag">Security</span>
            </div>
            <h4>Secure HttpOnly Session</h4>
            <p>Your session JWT is safely encrypted in HttpOnly browser cookies, isolated from script tampering.</p>
          </div>

          {/* Card 2: Light Red - Active Perks */}
          <div className="metric-card metric-red">
            <div className="metric-header">
              <span className="metric-icon">🎁</span>
              <span className="metric-tag">Rewards</span>
            </div>
            <h4>Free Express Shipping</h4>
            <p>As a verified ShopKart member, all catalog orders qualify for priority zero-cost dispatch.</p>
          </div>

          {/* Card 3: Light Yellow - Cart Overview */}
          <div className="metric-card metric-yellow">
            <div className="metric-header">
              <span className="metric-icon">🛍️</span>
              <span className="metric-tag">Cart</span>
            </div>
            <h4>{totalCount} Items in Cart</h4>
            <p>Items saved in your basket are ready for one-click instant checkout anytime.</p>
          </div>
        </div>

        {/* Profile Details Panel */}
        <div className="profile-details-card">
          <div className="profile-details-header">
            <h3>Customer Profile Information</h3>
            <span className="profile-badge-active">● Active Account</span>
          </div>

          <div className="profile-info-grid">
            <div className="profile-info-item">
              <label>Full Legal Name</label>
              <div className="profile-value">{user.fullName}</div>
            </div>

            <div className="profile-info-item">
              <label>Registered Email</label>
              <div className="profile-value">{user.email}</div>
            </div>

            <div className="profile-info-item">
              <label>Phone Number</label>
              <div className="profile-value">{user.phone || '+91 98765 43210'}</div>
            </div>

            <div className="profile-info-item">
              <label>Member Since</label>
              <div className="profile-value">September 2026</div>
            </div>
          </div>

          <div className="profile-card-footer">
            <button onClick={handleLogout} className="btn-dash-logout">
              Log Out Session
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
