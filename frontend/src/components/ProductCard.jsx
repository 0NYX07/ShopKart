import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToWishlist, removeFromWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

function ProductCard({ product, initialInWishlist = false, onWishlistUpdate }) {
  const navigate = useNavigate();
  const { cartItems, addToCartHandler } = useCart();

  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMsg, setCartMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Keep internal wishlist heart indicator synced with incoming props
  useEffect(() => {
    setInWishlist(initialInWishlist);
  }, [initialInWishlist]);

  // Check if current product is already in global cart state
  const cartEntry = cartItems.find((item) => item.product?._id === product._id);
  const quantityInCart = cartEntry ? cartEntry.quantity : 0;

  const handleViewDetails = () => {
    navigate(`/products/${product._id}`);
  };

  // Lab 04: Wishlist Toggle Action
  const handleWishlistToggle = async () => {
    if (savingWishlist) return;
    setSavingWishlist(true);
    setErrorMessage('');

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
        setErrorMessage('Unable to save wishlist item.');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    } finally {
      setSavingWishlist(false);
    }
  };

  // Lab 05: Add to Cart Action
  const handleAddToCart = async () => {
    if (addingToCart || product.stock === 0) return;
    setAddingToCart(true);
    setErrorMessage('');
    setCartMsg('');

    const result = await addToCartHandler(product._id);
    setAddingToCart(false);

    if (result && result.success) {
      setCartMsg('Added to Cart!');
      setTimeout(() => setCartMsg(''), 2500);
    } else if (result && result.status === 401) {
      navigate('/login');
    } else {
      setErrorMessage(result?.message || 'Could not add to cart');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img 
          src={product.image} 
          alt={product.name} 
          className="product-image"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
          }}
        />
        {/* Heart Wishlist Overlay Badge */}
        <button 
          onClick={handleWishlistToggle}
          disabled={savingWishlist}
          className={`wishlist-heart-btn ${inWishlist ? 'saved' : ''}`}
          title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          {savingWishlist ? '⏳' : inWishlist ? '♥' : '♡'}
        </button>
      </div>

      <div className="product-card-body">
        <span className="product-category">{product.category}</span>
        <h3 className="product-title">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        
        <div className="product-price-stock">
          <span className="product-price">₹{product.price}</span>
          <span className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product.stock > 0 ? `${product.stock} units left` : 'Out of Stock'}
          </span>
        </div>

        {/* Feedback messages */}
        {cartMsg && <div className="card-success-message">{cartMsg}</div>}
        {errorMessage && <div className="card-error-message">{errorMessage}</div>}

        <div className="product-card-actions">
          <button onClick={handleViewDetails} className="btn-view-details">
            View
          </button>
          
          <button 
            onClick={handleAddToCart}
            disabled={addingToCart || product.stock === 0}
            className="btn-add-cart"
          >
            {addingToCart ? 'Adding...' : quantityInCart > 0 ? `Add Another (${quantityInCart})` : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
