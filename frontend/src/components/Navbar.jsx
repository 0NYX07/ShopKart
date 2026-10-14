import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, Search, ShoppingBag, Heart } from 'lucide-react';
import api from '../services/api';
import logoImg from '../assets/logo.jpg';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalUnits, clearCart } = useCart();
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    let ignore = false;
    api.get('/wishlist')
      .then((res) => {
        if (!ignore) {
          const items = res.data?.wishlist || [];
          setWishlistCount(items.length);
        }
      })
      .catch(() => {
        if (!ignore) setWishlistCount(0);
      });

    // Listen to custom event dispatched when wishlist items are modified
    const handleWishlistUpdated = (e) => {
      if (e?.detail && typeof e.detail.count === 'number') {
        setWishlistCount(e.detail.count);
      } else {
        api.get('/wishlist')
          .then((res) => {
            const items = res.data?.wishlist || [];
            setWishlistCount(items.length);
          })
          .catch(() => setWishlistCount(0));
      }
    };

    window.addEventListener('wishlist-updated', handleWishlistUpdated);
    return () => {
      ignore = true;
      window.removeEventListener('wishlist-updated', handleWishlistUpdated);
    };
  }, []);

  const handleLogout = async () => {
    try {
      clearCart();
      await api.post('/customers/logout');
      navigate('/login');
    } catch {
      clearCart();
      navigate('/login');
    }
  };

  const isCurrent = (pathname) => location.pathname === pathname;

  return (
    <nav className="navbar">
      {/* Brand: Official Logo Emblem + Luxury STREIA Brand Title */}
      <Link to="/home" className="navbar-brand">
        <div className="brand-badge">
          <img
            src={logoImg}
            alt="Streia Logo"
            className="brand-badge-img"
          />
        </div>
        <span className="brand-logo-text">STREIA</span>
      </Link>

      {/* Unified Primary Navigation: Home, Shop, Wishlist, Cart, Dashboard */}
      <div className="navbar-nav">
        <Link to="/home" className={isCurrent('/home') ? 'nav-active' : ''}>
          Home
        </Link>
        <Link to="/products" className={isCurrent('/products') ? 'nav-active' : ''}>
          Shop
        </Link>
        <Link to="/wishlist" className={isCurrent('/wishlist') ? 'nav-active' : ''}>
          Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ''}
        </Link>
        <Link to="/cart" className={isCurrent('/cart') ? 'nav-active' : ''} id="nav-cart-link">
          Cart {totalUnits > 0 ? `(${totalUnits})` : ''}
        </Link>
        <Link to="/orders" className={isCurrent('/orders') ? 'nav-active' : ''} id="nav-orders-link">
          Orders
        </Link>
        <Link to="/dashboard" className={isCurrent('/dashboard') ? 'nav-active' : ''}>
          Dashboard
        </Link>
      </div>

      {/* Action Buttons */}
      <div className="navbar-actions">
        <button
          type="button"
          onClick={() => navigate('/products')}
          className="navbar-icon-btn"
          title="Search Catalog"
          aria-label="Search"
        >
          <Search size={20} />
        </button>

        {/* Wishlist Icon Button with Dynamic Counter Badge */}
        <button
          type="button"
          onClick={() => navigate('/wishlist')}
          className={`navbar-icon-btn ${isCurrent('/wishlist') ? 'active-icon' : ''}`}
          title={`Wishlist (${wishlistCount})`}
          aria-label="Wishlist"
          style={{ position: 'relative' }}
        >
          <Heart
            size={20}
            fill={wishlistCount > 0 ? '#ef4444' : 'none'}
            color={wishlistCount > 0 ? '#ef4444' : 'currentColor'}
          />
          {wishlistCount > 0 && (
            <span className="navbar-badge-counter">{wishlistCount}</span>
          )}
        </button>

        {/* Cart Icon Button with Dynamic Total Units Counter Badge (Task 16) */}
        <button
          type="button"
          onClick={() => navigate('/cart')}
          className={`navbar-icon-btn ${isCurrent('/cart') ? 'active-icon' : ''}`}
          title={`Shopping Cart (${totalUnits})`}
          aria-label="Shopping Cart"
          id="nav-cart-btn"
          style={{ position: 'relative' }}
        >
          <ShoppingBag size={20} />
          {totalUnits > 0 && (
            <span className="navbar-badge-counter cart-badge-counter" id="navbar-cart-count">
              {totalUnits}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className={`navbar-icon-btn ${isCurrent('/dashboard') ? 'active-icon' : ''}`}
          title="My Account Dashboard"
          aria-label="Account"
        >
          <User size={20} />
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="navbar-icon-btn"
          title="Logout from Streia"
          aria-label="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
