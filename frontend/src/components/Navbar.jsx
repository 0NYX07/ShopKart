import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

function Navbar({ wishlistCount }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalCount, setIsCartOpen } = useCart();
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [liveWishlistCount, setLiveWishlistCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        const res = await api.get('/customers/me');
        if (isMounted) {
          setCurrentUser(res.data);
          // If wishlistCount is not passed as prop, fetch live count
          if (wishlistCount === undefined) {
            try {
              const wRes = await api.get('/wishlist');
              if (isMounted && wRes.data && wRes.data.success) {
                setLiveWishlistCount(wRes.data.count || 0);
              }
            } catch {
              // Ignore wishlist fetch error if not logged in
            }
          }
        }
      } catch {
        if (isMounted) {
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setAuthChecked(true);
        }
      }
    };

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [location.pathname, wishlistCount]);

  const displayWishlistCount = wishlistCount !== undefined ? wishlistCount : liveWishlistCount;

  const handleLogout = async () => {
    try {
      await api.post('/customers/logout');
    } catch {
      // Proceed even if logout fails
    } finally {
      setCurrentUser(null);
      navigate('/login');
    }
  };

  return (
    <header className="navbar-wrapper">
      <nav className="navbar-container">
        {/* Logo with Light Color Accents */}
        <Link to="/products" className="navbar-brand">
          <div className="brand-icon-wrapper">
            <span className="dot dot-red"></span>
            <span className="dot dot-blue"></span>
            <span className="dot dot-yellow"></span>
          </div>
          <span className="brand-text">Shop<strong>Kart</strong></span>
          <span className="brand-pill">v2.0</span>
        </Link>

        {/* Center Links */}
        <div className="navbar-links">
          <Link 
            to="/products" 
            className={`nav-link-item ${location.pathname === '/products' || location.pathname.startsWith('/products/') ? 'active' : ''}`}
          >
            Explore Catalog
          </Link>
          <Link 
            to="/wishlist" 
            className={`nav-link-item nav-wishlist ${location.pathname === '/wishlist' ? 'active' : ''}`}
          >
            Wishlist {displayWishlistCount > 0 && <span className="wishlist-badge">{displayWishlistCount}</span>}
          </Link>
          <Link 
            to="/home" 
            className={`nav-link-item ${location.pathname === '/home' ? 'active' : ''}`}
          >
            My Account
          </Link>
        </div>

        {/* Right Action Icons & Auth */}
        <div className="navbar-actions">
          {/* Cart Trigger Button with Animated Counter */}
          <button 
            className="cart-trigger-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label="Open Shopping Cart"
          >
            <span className="cart-icon">🛒</span>
            <span className="cart-label">Cart</span>
            {totalCount > 0 && (
              <span className="cart-badge-counter animate-pop">
                {totalCount}
              </span>
            )}
          </button>

          {/* Auth Status & Controls */}
          {authChecked && (
            currentUser ? (
              <div className="user-profile-menu">
                <Link to="/home" className="user-chip" title="View Profile">
                  <div className="user-avatar-initial">
                    {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="user-chip-name">{currentUser.fullName.split(' ')[0]}</span>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="btn-logout-modern"
                  title="Log out of account"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-nav-buttons">
                <Link to="/login" className="btn-nav-login">
                  Log In
                </Link>
                <Link to="/register" className="btn-nav-register">
                  Register
                </Link>
              </div>
            )
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
