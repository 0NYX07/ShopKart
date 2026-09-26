import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { addToWishlist, removeFromWishlist } from '../services/api';

function ProductCard({ product, initialInWishlist = false, onWishlistUpdate }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [wishlistError, setWishlistError] = useState('');

  const handleViewDetails = () => {
    navigate(`/products/${product._id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  // Lab 04: Handle Wishlist Toggle (Add / Remove)
  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    if (savingWishlist) return;
    setSavingWishlist(true);
    setWishlistError('');

    try {
      if (inWishlist) {
        await removeFromWishlist(product._id);
        setInWishlist(false);
      } else {
        await addToWishlist(product._id);
        setInWishlist(true);
      }

      if (onWishlistUpdate) {
        onWishlistUpdate();
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      } else if (err.response && err.response.status === 409) {
        setInWishlist(true);
      } else {
        setWishlistError('Unable to save product. Please try again.');
        setTimeout(() => setWishlistError(''), 3000);
      }
    } finally {
      setSavingWishlist(false);
    }
  };

  // Determine category color theme classes
  const getCategoryClass = (cat) => {
    const lower = (cat || '').toLowerCase();
    if (lower.includes('electr')) return 'badge-category-blue';
    if (lower.includes('cloth') || lower.includes('wear')) return 'badge-category-red';
    if (lower.includes('foot') || lower.includes('shoe')) return 'badge-category-yellow';
    if (lower.includes('home') || lower.includes('kitchen')) return 'badge-category-yellow';
    if (lower.includes('book')) return 'badge-category-blue';
    return 'badge-category-blue';
  };

  return (
    <div className="product-card-modern" onClick={handleViewDetails}>
      {/* Top Image Showcase */}
      <div className="product-card-media">
        <span className={`product-card-category-badge ${getCategoryClass(product.category)}`}>
          {product.category}
        </span>

        {/* Heart Wishlist Overlay Badge */}
        <button 
          type="button"
          onClick={handleWishlistToggle}
          disabled={savingWishlist}
          className={`wishlist-heart-btn ${inWishlist ? 'saved' : ''}`}
          title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          {savingWishlist ? '⏳' : inWishlist ? '♥' : '♡'}
        </button>

        <img 
          src={product.image} 
          alt={product.name} 
          className="product-card-img"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';
          }}
        />
        <div className="product-card-overlay">
          <button 
            type="button" 
            className="btn-quick-view"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
          >
            Quick View →
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="product-card-content">
        <div className="product-card-meta">
          <span className="product-rating">⭐ 4.9</span>
          <span className={`stock-indicator ${product.stock > 0 ? 'stock-in' : 'stock-out'}`}>
            <span className="stock-dot"></span>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>

        <h3 className="product-card-name" title={product.name}>
          {product.name}
        </h3>

        <p className="product-card-desc">
          {product.description}
        </p>

        {wishlistError && (
          <div className="card-error-message">
            {wishlistError}
          </div>
        )}

        {/* Price & Action Row */}
        <div className="product-card-footer">
          <div className="product-price-wrapper">
            <span className="currency-symbol">₹</span>
            <span className="price-value">{product.price.toLocaleString()}</span>
          </div>

          <div className="card-action-group">
            <button 
              type="button"
              onClick={handleWishlistToggle} 
              disabled={savingWishlist}
              className={`btn-wishlist-action ${inWishlist ? 'btn-wishlist-saved' : ''}`}
              title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              {savingWishlist ? '⏳' : inWishlist ? '♥' : '♡'}
            </button>

            <button 
              type="button"
              className={`btn-card-add ${justAdded ? 'btn-card-added' : ''}`}
              disabled={product.stock === 0}
              onClick={handleAddToCart}
            >
              {justAdded ? (
                <span className="btn-added-content">✓ Added</span>
              ) : (
                <span>+ Cart</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
