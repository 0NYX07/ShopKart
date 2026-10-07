import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

function Navbar({ wishlistCount }) {
  const navigate = useNavigate();
  const { totalCount } = useCart();
  const [count, setCount] = useState(wishlistCount ?? 0);

  useEffect(() => {
    if (wishlistCount !== undefined) {
      setCount(wishlistCount);
    } else {
      // Fetch wishlist count from backend if not provided as prop
      getWishlist()
        .then((res) => {
          if (res.data && res.data.success) {
            setCount(res.data.count);
          }
        })
        .catch(() => {
          // Unauthenticated or error -> fallback count 0
        });
    }
  }, [wishlistCount]);

  const handleLogout = async () => {
    try {
      await api.post('/customers/logout');
      navigate('/login');
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/home">ShopKart</Link>
      </div>
      <div className="navbar-menu">
        <Link to="/home" className="nav-item">Home</Link>
        <Link to="/products" className="nav-item">Products</Link>
        <Link to="/wishlist" className="nav-item nav-wishlist">
          Wishlist {count > 0 && <span className="wishlist-badge">{count}</span>}
        </Link>
        <Link to="/cart" className="nav-item nav-cart">
          Cart {totalCount > 0 && <span className="cart-badge">{totalCount}</span>}
        </Link>
        <Link to="/orders" className="nav-item">Orders</Link>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
