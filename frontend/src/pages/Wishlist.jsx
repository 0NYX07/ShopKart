import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import WishlistCard from '../components/WishlistCard';
import { getWishlist, removeFromWishlist } from '../services/api';

function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch wishlist from backend
  const fetchWishlistData = async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await getWishlist();
      if (response.data && response.data.success) {
        setWishlist(response.data.wishlist || []);
      } else {
        setError(true);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        // Redirect unauthenticated user to login
        navigate('/login');
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistData();
  }, []);

  // Handle removing a product from wishlist
  const handleRemoveProduct = async (productId) => {
    try {
      await removeFromWishlist(productId);
      // Remove product locally from state for immediate UI update
      setWishlist((prev) => prev.filter((item) => item._id !== productId));
    } catch (err) {
      alert('Failed to remove product from wishlist. Please try again.');
    }
  };

  return (
    <div>
      <Navbar wishlistCount={wishlist.length} />

      <div className="wishlist-container">
        <div className="wishlist-header">
          <h2>My Wishlist ❤️</h2>
          <p>{wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            Loading your wishlist...
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="error-state-box">
            <h3>Something went wrong</h3>
            <p>Unable to load wishlist.</p>
            <button onClick={fetchWishlistData} className="btn-retry">
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && wishlist.length === 0 && (
          <div className="empty-wishlist-box">
            <div className="empty-heart-icon">❤️</div>
            <h2>Your wishlist is empty</h2>
            <p>Save products you love and find them here later.</p>
            <button onClick={() => navigate('/products')} className="btn-browse-products">
              Browse Products
            </button>
          </div>
        )}

        {/* Wishlist Products Grid */}
        {!loading && !error && wishlist.length > 0 && (
          <div className="products-grid">
            {wishlist.map((product) => (
              <WishlistCard 
                key={product._id} 
                product={product} 
                onRemove={handleRemoveProduct} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
