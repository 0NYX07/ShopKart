import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, RefreshCw, AlertCircle, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import WishlistCard from '../components/WishlistCard';
import Footer from '../components/Footer';

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Fetch wishlist from backend
  const fetchWishlist = useCallback(async () => {
    try {
      const response = await api.get('/wishlist');
      const items = response.data?.wishlist || [];
      setWishlist(items);

      // Dispatch event to sync wishlist count in Navbar
      window.dispatchEvent(
        new CustomEvent('wishlist-updated', {
          detail: { count: items.length, ids: items.map((p) => p._id) },
        })
      );
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
      const code = err.statusCode || err.response?.status;
      if (code === 401) {
        // Redirect to login if unauthenticated
        navigate('/login');
        return;
      }
      const msg =
        err.response?.data?.message || "We couldn't load your wishlist.";
      setError(code ? `[HTTP ${code}] ${msg}` : msg);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    let ignore = false;
    api.get('/wishlist')
      .then((res) => {
        if (!ignore) {
          const items = res.data?.wishlist || [];
          setWishlist(items);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          const code = err.statusCode || err.response?.status;
          if (code === 401) {
            navigate('/login');
            return;
          }
          const msg = err.response?.data?.message || "We couldn't load your wishlist.";
          setError(code ? `[HTTP ${code}] ${msg}` : msg);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [navigate]);

  // Remove product from wishlist handler
  const handleRemove = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      // Optimistically remove from state
      setWishlist((prev) => {
        const nextList = prev.filter((item) => item._id !== productId);
        // Sync Navbar count
        window.dispatchEvent(
          new CustomEvent('wishlist-updated', {
            detail: { count: nextList.length, ids: nextList.map((p) => p._id) },
          })
        );
        return nextList;
      });

      setToastMessage('Product removed from wishlist');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error('Failed to remove product from wishlist:', err);
      const msg = err.response?.data?.message || 'Unable to remove product. Please try again.';
      setToastMessage(`Error: ${msg}`);
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="catalog-container">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="toast-notification animate-fade-in-up" style={{ zIndex: 100 }}>
            {toastMessage.startsWith('Error') ? (
              <AlertCircle size={18} color="#ef4444" />
            ) : (
              <CheckCircle size={18} color="#10b981" />
            )}
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Wishlist Header Banner */}
        <div className="catalog-header animate-fade-in-up">
          <div className="catalog-header-badge">
            <Sparkles size={14} /> Saved For Later
          </div>
          <h1 className="catalog-title">My Wishlist</h1>
          <p className="catalog-subtitle">
            {!loading && !error
              ? `${wishlist.length} ${wishlist.length === 1 ? 'product' : 'products'} saved in your personal wishlist.`
              : 'Review, manage, or purchase your saved favorites.'}
          </p>
        </div>

        {/* STATE 1: Loading State */}
        {loading && (
          <div className="state-container loading-state">
            <div className="spinner-large"></div>
            <p className="state-message">Loading your wishlist...</p>
          </div>
        )}

        {/* STATE 2: Error State */}
        {!loading && error && (
          <div className="state-container error-state animate-fade-in-up">
            <div className="state-icon-wrapper error">
              <AlertCircle size={36} />
            </div>
            <h3 className="state-title">Something went wrong.</h3>
            <p className="state-message">{error}</p>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: 'auto', padding: '0.75rem 2rem' }}
              onClick={() => {
                setLoading(true);
                setError('');
                fetchWishlist();
              }}
            >
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        )}

        {/* STATE 3: Empty State */}
        {!loading && !error && wishlist.length === 0 && (
          <div className="state-container empty-state animate-fade-in-up">
            <div className="state-icon-wrapper empty-heart">
              <Heart size={44} color="#ef4444" fill="#fee2e2" />
            </div>
            <h3 className="state-title">Your wishlist is empty ❤️</h3>
            <p className="state-message">
              Save products you love and find them here later.
            </p>
            <Link
              to="/products"
              className="btn btn-primary"
              style={{ width: 'auto', padding: '0.75rem 2.2rem' }}
            >
              Browse Products <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* STATE 4: Dynamic Products Grid */}
        {!loading && !error && wishlist.length > 0 && (
          <div className="products-grid animate-fade-in-up">
            {wishlist.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
