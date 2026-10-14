import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Phone,
  Shield,
  Lock,
  LogOut,
  ShoppingBag,
  CheckCircle,
  AlertCircle,
  KeyRound,
  Calendar,
  Sparkles,
  Heart,
  Eye,
  Trash2,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Dashboard = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [removingId, setRemovingId] = useState(null);

  // Password change state
  const [pwdData, setPwdData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [profileRes, wishlistRes] = await Promise.all([
        api.get('/customers/me'),
        api.get('/wishlist').catch(() => ({ data: { wishlist: [] } })),
      ]);
      setCustomer(profileRes.data);
      setWishlist(wishlistRes.data?.wishlist || []);
    } catch {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handleWishlistUpdated = () => {
      api.get('/wishlist')
        .then((res) => setWishlist(res.data?.wishlist || []))
        .catch(() => {});
    };

    window.addEventListener('wishlist-updated', handleWishlistUpdated);
    return () => window.removeEventListener('wishlist-updated', handleWishlistUpdated);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post('/customers/logout');
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const handleRemoveWishlist = async (productId) => {
    if (removingId) return;
    setRemovingId(productId);
    try {
      await api.delete(`/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((item) => item._id !== productId));
      window.dispatchEvent(new CustomEvent('wishlist-updated'));
    } catch (err) {
      console.error('Failed to remove item from wishlist:', err);
    } finally {
      setRemovingId(null);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdSuccess('');
    setPwdError('');

    if (pwdData.newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters long');
      return;
    }

    if (pwdData.newPassword !== pwdData.confirmPassword) {
      setPwdError('New password and confirm password do not match');
      return;
    }

    setPwdLoading(true);

    try {
      await api.patch('/customers/change-password', {
        oldPassword: pwdData.oldPassword,
        newPassword: pwdData.newPassword,
      });

      setPwdSuccess('Password changed successfully! Keep your new credentials safe.');
      setPwdData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const code = err.statusCode || err.response?.status;
      const msg = err.response?.data?.message || 'Failed to update password. Please check your old password.';
      setPwdError(code ? `[HTTP ${code}] ${msg}` : msg);
    } finally {
      setPwdLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <main className="catalog-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className="state-container loading-state">
            <div className="spinner-large"></div>
            <p className="state-message">Loading your Streia dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!customer) return null;

  const memberSince = customer.createdAt
    ? new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '2026';

  const memberSinceFull = customer.createdAt
    ? new Date(customer.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Joined in 2026';

  return (
    <div className="app-container">
      <Navbar />

      <main className="dashboard-container animate-fade-in-up">
        {/* User Hero Banner */}
        <div className="dashboard-hero-card">
          <div className="dashboard-user-info">
            <div className="dashboard-avatar">
              <span>{getInitials(customer.fullName)}</span>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h1 className="dashboard-user-name">{customer.fullName}</h1>
                <span className="dashboard-badge-verified">
                  <Shield size={13} /> Verified Customer
                </span>
              </div>
              <p className="dashboard-user-email">{customer.email}</p>
              <div className="dashboard-user-meta">
                <span><Phone size={13} /> {customer.phone}</span>
                <span>•</span>
                <span><Calendar size={13} /> Member since {memberSince}</span>
              </div>
            </div>
          </div>

          <div className="dashboard-hero-actions">
            <Link to="/products" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem', width: 'auto' }}>
              <ShoppingBag size={16} /> Shop Products
            </Link>
            <button onClick={handleLogout} className="btn-dashboard-logout" title="Sign out">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Real Metrics Bar - Only Real Implemented Data */}
        <div className="dashboard-metrics-grid">
          <div
            className="metric-card"
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveTab('wishlist')}
            title="View saved wishlist items"
          >
            <div className="metric-icon-box" style={{ background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' }}>
              <Heart size={22} fill={wishlist.length > 0 ? '#e11d48' : 'none'} />
            </div>
            <div>
              <div className="metric-val">{wishlist.length}</div>
              <div className="metric-lbl">Saved Wishlist Items</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-box" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
              <CheckCircle size={22} />
            </div>
            <div>
              <div className="metric-val">Active</div>
              <div className="metric-lbl">Account Status</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-box" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
              <Shield size={22} />
            </div>
            <div>
              <div className="metric-val">Protected</div>
              <div className="metric-lbl">JWT Session Security</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-box" style={{ background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0' }}>
              <KeyRound size={22} />
            </div>
            <div>
              <div className="metric-val">Customer</div>
              <div className="metric-lbl">Account Role</div>
            </div>
          </div>
        </div>

        {/* Dashboard Layout: Sidebar Navigation + Content */}
        <div className="dashboard-main-grid">
          {/* Dashboard Tabs Sidebar */}
          <aside className="dashboard-sidebar">
            <nav className="dashboard-nav-tabs">
              <button
                type="button"
                className={`dashboard-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <User size={18} />
                <span>Profile Overview</span>
              </button>

              <button
                type="button"
                className={`dashboard-tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
                onClick={() => setActiveTab('wishlist')}
              >
                <Heart
                  size={18}
                  fill={wishlist.length > 0 ? '#ef4444' : 'none'}
                  color={wishlist.length > 0 ? '#ef4444' : 'currentColor'}
                />
                <span>My Wishlist ({wishlist.length})</span>
              </button>

              <button
                type="button"
                className={`dashboard-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <Lock size={18} />
                <span>Security & Password</span>
              </button>
            </nav>

            <div className="dashboard-promo-box">
              <Sparkles size={20} color="#a5b4fc" />
              <strong>Streia Collection</strong>
              <p>Explore luxury apparel, electronics, and books in our catalog.</p>
              <Link to="/products" className="promo-link">
                Browse Products →
              </Link>
            </div>
          </aside>

          {/* Tab Content Area */}
          <section className="dashboard-content-panel">
            {/* TAB 1: PROFILE OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="tab-pane animate-fade-in-up">
                <div className="panel-header">
                  <div>
                    <h2 className="panel-title">Profile Information</h2>
                    <p className="panel-subtitle">Review personal details and account status</p>
                  </div>
                </div>

                <div className="profile-details-card">
                  <div className="detail-row">
                    <span className="detail-label">Full Name</span>
                    <span className="detail-value">{customer.fullName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email Address</span>
                    <span className="detail-value">{customer.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone Number</span>
                    <span className="detail-value">{customer.phone}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Customer ID</span>
                    <span className="detail-value" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {customer._id}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Account Status</span>
                    <span className="detail-value" style={{ color: '#059669', fontWeight: 600 }}>
                      ● Active & Verified
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Registered On</span>
                    <span className="detail-value">{memberSinceFull}</span>
                  </div>
                </div>

                {/* Real Wishlist Quick Preview */}
                <div style={{ marginTop: '2.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Saved Wishlist Items ({wishlist.length})
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Products you've bookmarked for later
                      </p>
                    </div>
                    <Link to="/wishlist" className="btn-link-reset" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      Open full wishlist <ArrowRight size={14} />
                    </Link>
                  </div>

                  {wishlist.length === 0 ? (
                    <div className="state-container empty-state" style={{ padding: '2.5rem 1.5rem', margin: 0, maxWidth: '100%' }}>
                      <Heart size={32} color="#e11d48" fill="#fee2e2" style={{ margin: '0 auto 0.75rem' }} />
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>Your wishlist is empty</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                        Explore the catalog and click the heart icon on items to save them here.
                      </p>
                      <Link to="/products" className="btn btn-primary" style={{ display: 'inline-flex', width: 'auto', padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}>
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <div className="dashboard-wishlist-preview-grid">
                      {wishlist.slice(0, 4).map((item) => (
                        <div key={item._id} className="dashboard-wishlist-item">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80'}
                            alt={item.name}
                            className="dashboard-wishlist-thumb"
                          />
                          <div className="dashboard-wishlist-info">
                            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                              {item.category}
                            </span>
                            <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', margin: '0.25rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.name}>
                              {item.name}
                            </strong>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                              ₹{Number(item.price).toLocaleString('en-IN')}
                            </span>
                            <Link to={`/products/${item._id}`} className="btn btn-product-details" style={{ height: '34px', fontSize: '0.8rem', padding: '0 0.5rem', width: '100%', marginTop: 'auto' }}>
                              <Eye size={14} /> View
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: MY WISHLIST */}
            {activeTab === 'wishlist' && (
              <div className="tab-pane animate-fade-in-up">
                <div className="panel-header">
                  <div>
                    <h2 className="panel-title">My Wishlist ({wishlist.length})</h2>
                    <p className="panel-subtitle">Manage items you have saved to your personal collection</p>
                  </div>
                  <Link to="/wishlist" className="btn btn-primary" style={{ width: 'auto', padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}>
                    Open Dedicated Wishlist View →
                  </Link>
                </div>

                {wishlist.length === 0 ? (
                  <div className="state-container empty-state" style={{ padding: '3.5rem 2rem', margin: 0, maxWidth: '100%' }}>
                    <div className="state-icon-wrapper empty-heart">
                      <Heart size={32} color="#e11d48" fill="#fee2e2" />
                    </div>
                    <h3 className="state-title">
                      Your wishlist is empty
                    </h3>
                    <p className="state-message">
                      Items you save while browsing the catalog will appear here so you can easily review them later.
                    </p>
                    <Link to="/products" className="btn btn-primary" style={{ width: 'auto', padding: '0.65rem 1.75rem' }}>
                      Explore Products
                    </Link>
                  </div>
                ) : (
                  <div className="dashboard-wishlist-preview-grid">
                    {wishlist.map((item) => (
                      <div key={item._id} className="dashboard-wishlist-item">
                        <div style={{ position: 'relative' }}>
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80'}
                            alt={item.name}
                            className="dashboard-wishlist-thumb"
                          />
                          <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(255, 255, 255, 0.92)', backdropFilter: 'blur(6px)', borderRadius: '9999px', padding: '2px 8px', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}>
                            {item.category}
                          </span>
                        </div>

                        <div className="dashboard-wishlist-info">
                          <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.4rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.name}>
                            {item.name}
                          </strong>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              ₹{Number(item.price).toLocaleString('en-IN')}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: item.stock > 0 ? '#059669' : '#dc2626', fontWeight: 600 }}>
                              {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                            <Link
                              to={`/products/${item._id}`}
                              className="btn btn-product-details"
                              style={{ flex: 1, height: '34px', fontSize: '0.8rem', padding: '0 0.5rem' }}
                            >
                              <Eye size={13} /> View
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleRemoveWishlist(item._id)}
                              disabled={removingId === item._id}
                              className="btn btn-remove-wishlist"
                              style={{ flex: 1, height: '34px', fontSize: '0.8rem', padding: '0 0.5rem' }}
                              title="Remove from wishlist"
                            >
                              {removingId === item._id ? (
                                <Loader2 size={13} className="spinner-inline" />
                              ) : (
                                <>
                                  <Trash2 size={13} /> Remove
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SECURITY & PASSWORD */}
            {activeTab === 'security' && (
              <div className="tab-pane animate-fade-in-up">
                <div className="panel-header">
                  <div>
                    <h2 className="panel-title">Security & Password</h2>
                    <p className="panel-subtitle">Update your password to keep your Streia account secure</p>
                  </div>
                </div>

                {pwdSuccess && (
                  <div className="alert alert-success" style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <CheckCircle size={18} />
                    <span>{pwdSuccess}</span>
                  </div>
                )}

                {pwdError && (
                  <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                    <AlertCircle size={18} />
                    <span>{pwdError}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="security-form">
                  <div className="form-group">
                    <label htmlFor="oldPassword">Current Password</label>
                    <div className="input-container">
                      <KeyRound size={18} className="input-icon" />
                      <input
                        type="password"
                        id="oldPassword"
                        className="form-input"
                        placeholder="Enter current password"
                        value={pwdData.oldPassword}
                        onChange={(e) => setPwdData({ ...pwdData, oldPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword">New Password (minimum 6 characters)</label>
                    <div className="input-container">
                      <Lock size={18} className="input-icon" />
                      <input
                        type="password"
                        id="newPassword"
                        className="form-input"
                        placeholder="Enter new password"
                        value={pwdData.newPassword}
                        onChange={(e) => setPwdData({ ...pwdData, newPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <div className="input-container">
                      <Lock size={18} className="input-icon" />
                      <input
                        type="password"
                        id="confirmPassword"
                        className="form-input"
                        placeholder="Confirm new password"
                        value={pwdData.confirmPassword}
                        onChange={(e) => setPwdData({ ...pwdData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={pwdLoading}
                    style={{ width: 'auto', padding: '0.75rem 2.5rem', marginTop: '0.5rem' }}
                  >
                    {pwdLoading ? <div className="spinner"></div> : 'Update Password'}
                  </button>
                </form>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
