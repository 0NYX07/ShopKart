import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, CheckCircle, AlertTriangle, Heart, Loader2, ShoppingBag } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const CATEGORY_FALLBACKS = {
  Books: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
  Electronics: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
  Fashion: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
  Home: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
};

const getFallbackImage = (category) => {
  return (
    CATEGORY_FALLBACKS[category] ||
    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80'
  );
};

const ProductCard = ({ product, initialWishlisted = false, onWishlistChange }) => {
  const navigate = useNavigate();
  const { addToCart, actionLoading, isInCart, getItemQuantity } = useCart();
  const { _id, name, price, category, image, stock } = product;

  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;
  const fallbackImg = getFallbackImage(category);

  const isAddingToCart = actionLoading[_id] === 'adding';
  const alreadyInCart = isInCart(_id);
  const quantityInCart = getItemQuantity(_id);
  const isMaxStockReached = quantityInCart >= stock;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock || isAddingToCart) return;

    if (isMaxStockReached) {
      setErrorMsg(`Maximum stock (${stock}) already in cart`);
      setTimeout(() => setErrorMsg(''), 3500);
      return;
    }

    setErrorMsg('');
    setFeedbackMsg('');

    const res = await addToCart(_id, 1);
    if (res.success) {
      setFeedbackMsg(alreadyInCart ? `Added another (${quantityInCart + 1} in cart)` : 'Added to Cart');
      setTimeout(() => setFeedbackMsg(''), 3000);
    } else {
      if (res.statusCode === 401) {
        setErrorMsg('Please login to add to cart');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setErrorMsg(res.message || 'Could not add to cart');
        setTimeout(() => setErrorMsg(''), 3500);
      }
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (saving) return;

    setSaving(true);
    setErrorMsg('');
    setFeedbackMsg('');

    try {
      if (!isWishlisted) {
        await api.post(`/wishlist/${_id}`);
        setIsWishlisted(true);
        setFeedbackMsg('Added to Wishlist');
      } else {
        await api.delete(`/wishlist/${_id}`);
        setIsWishlisted(false);
        setFeedbackMsg('Removed from Wishlist');
      }

      window.dispatchEvent(new CustomEvent('wishlist-updated'));
      if (onWishlistChange) onWishlistChange(_id, !isWishlisted);

      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err) {
      console.error('Wishlist action error:', err);
      const status = err.statusCode || err.response?.status;

      if (status === 401) {
        setErrorMsg('Please login to save products');
        setTimeout(() => navigate('/login'), 1500);
      } else if (status === 409) {
        setIsWishlisted(true);
        setFeedbackMsg('Already in Wishlist');
        setTimeout(() => setFeedbackMsg(''), 3000);
      } else {
        setErrorMsg('Unable to save product. Please try again.');
        setTimeout(() => setErrorMsg(''), 4000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="product-card" id={`product-card-${_id}`}>
      <div className="product-card-image-wrapper">
        <Link to={`/products/${_id}`}>
          <img
            src={image || fallbackImg}
            alt={name}
            className="product-card-img"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackImg;
            }}
          />
        </Link>
        <span className="product-card-category">{category}</span>

        {/* Floating Heart Quick-Action */}
        <button
          type="button"
          className={`product-card-floating-heart ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlistToggle}
          disabled={saving}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          {saving ? (
            <Loader2 size={16} className="spinner-inline" />
          ) : (
            <Heart
              size={18}
              fill={isWishlisted ? '#e11d48' : 'none'}
              color={isWishlisted ? '#e11d48' : '#475569'}
            />
          )}
        </button>
      </div>

      <div className="product-card-content">
        <h3 className="product-card-title" title={name}>
          <Link to={`/products/${_id}`} className="product-card-title-link">
            {name}
          </Link>
        </h3>

        <div className="product-card-meta">
          <span className="product-card-price">
            ₹{Number(price).toLocaleString('en-IN')}
          </span>

          <span
            className={`stock-badge ${
              isOutOfStock ? 'stock-out' : isLowStock ? 'stock-low' : 'stock-in'
            }`}
          >
            {isOutOfStock ? (
              <>
                <AlertTriangle size={12} /> Out of stock
              </>
            ) : isLowStock ? (
              <>Only {stock} left</>
            ) : (
              <>
                <CheckCircle size={12} /> {stock} units left
              </>
            )}
          </span>
        </div>

        {/* Error notification banner on failure */}
        {errorMsg && (
          <div className="product-card-toast error animate-fade-in-up">
            <AlertTriangle size={13} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Feedback message on success */}
        {feedbackMsg && (
          <div className="product-card-toast success animate-fade-in-up">
            <CheckCircle size={13} />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Action Buttons: Add to Cart (Task 7) & View Details */}
        <div className="product-card-actions-wrapper">
          <button
            type="button"
            className={`btn btn-add-to-cart ${alreadyInCart ? 'btn-in-cart' : ''}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAddingToCart || isMaxStockReached}
            id={`add-to-cart-${_id}`}
          >
            {isAddingToCart ? (
              <>
                <Loader2 size={15} className="spinner-inline" />
                <span>Adding...</span>
              </>
            ) : isOutOfStock ? (
              <span>Out of Stock</span>
            ) : isMaxStockReached ? (
              <span>Max in Cart ({quantityInCart})</span>
            ) : alreadyInCart ? (
              <>
                <ShoppingBag size={15} />
                <span>Add Another ({quantityInCart})</span>
              </>
            ) : (
              <>
                <ShoppingBag size={15} />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <Link
            to={`/products/${_id}`}
            className="btn btn-product-details-link"
            title="View Details"
            aria-label="View Details"
          >
            <Eye size={15} />
            <span>Details</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

