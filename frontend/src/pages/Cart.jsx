import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';

function Cart() {
  const navigate = useNavigate();
  const { 
    cartItems, 
    loading, 
    error, 
    subtotal, 
    totalCount, 
    fetchCart, 
    updateQuantityHandler, 
    removeFromCartHandler 
  } = useCart();

  const [updatingId, setUpdatingId] = useState(null);
  const [actionError, setActionError] = useState('');

  // Handle quantity increase (+)
  const handleIncreaseQuantity = async (productId, currentQty, stock) => {
    if (currentQty >= stock) {
      setActionError(`Cannot exceed available stock of ${stock} units.`);
      setTimeout(() => setActionError(''), 3000);
      return;
    }

    setUpdatingId(productId);
    setActionError('');
    const res = await updateQuantityHandler(productId, currentQty + 1);
    setUpdatingId(null);

    if (res && !res.success) {
      setActionError(res.message || 'Failed to update quantity');
      setTimeout(() => setActionError(''), 3000);
    }
  };

  // Handle quantity decrease (-)
  const handleDecreaseQuantity = async (productId, currentQty) => {
    if (currentQty <= 1) return;

    setUpdatingId(productId);
    setActionError('');
    const res = await updateQuantityHandler(productId, currentQty - 1);
    setUpdatingId(null);

    if (res && !res.success) {
      setActionError(res.message || 'Failed to update quantity');
      setTimeout(() => setActionError(''), 3000);
    }
  };

  // Handle removing product from cart
  const handleRemoveItem = async (productId) => {
    setUpdatingId(productId);
    setActionError('');
    const res = await removeFromCartHandler(productId);
    setUpdatingId(null);

    if (res && !res.success) {
      setActionError(res.message || 'Failed to remove item');
      setTimeout(() => setActionError(''), 3000);
    }
  };

  return (
    <div>
      <Navbar />

      <div className="cart-container">
        <div className="cart-header">
          <h2>My Cart 🛒</h2>
          <p>{totalCount} {totalCount === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        {/* Global action error feedback */}
        {actionError && (
          <div className="cart-action-error-bar">
            {actionError}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            Loading your cart...
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="error-state-box">
            <h3>Something went wrong</h3>
            <p>Unable to load your cart.</p>
            <button onClick={fetchCart} className="btn-retry">
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && cartItems.length === 0 && (
          <div className="empty-cart-box">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything yet.</p>
            <button onClick={() => navigate('/products')} className="btn-browse-products">
              Browse Products
            </button>
          </div>
        )}

        {/* Cart Layout with Items & Order Summary */}
        {!loading && !error && cartItems.length > 0 && (
          <div className="cart-content-grid">
            {/* Left Column: Cart Items List */}
            <div className="cart-items-list">
              {cartItems.map((item) => {
                const product = item.product || {};
                const isUpdating = updatingId === product._id;
                const itemTotal = (product.price || 0) * item.quantity;

                return (
                  <div key={product._id || item._id} className="cart-item-card">
                    <div className="cart-item-image-wrapper">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="cart-item-image"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150x120?text=No+Image';
                        }}
                      />
                    </div>

                    <div className="cart-item-info">
                      <span className="product-category">{product.category}</span>
                      <h3 className="cart-item-title">{product.name}</h3>
                      <p className="cart-item-price">₹{product.price} each</p>
                      
                      <span className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {product.stock > 0 ? `${product.stock} units available` : 'Out of Stock'}
                      </span>
                    </div>

                    <div className="cart-item-controls-column">
                      {/* Quantity [-] count [+] */}
                      <div className="quantity-controls">
                        <button 
                          onClick={() => handleDecreaseQuantity(product._id, item.quantity)}
                          disabled={isUpdating || item.quantity <= 1}
                          className="btn-qty-minus"
                        >
                          -
                        </button>

                        <span className="qty-number">
                          {isUpdating ? '...' : item.quantity}
                        </span>

                        <button 
                          onClick={() => handleIncreaseQuantity(product._id, item.quantity, product.stock)}
                          disabled={isUpdating || item.quantity >= product.stock}
                          className="btn-qty-plus"
                        >
                          +
                        </button>
                      </div>

                      <span className="cart-item-line-total">₹{itemTotal}</span>

                      <button 
                        onClick={() => handleRemoveItem(product._id)}
                        disabled={isUpdating}
                        className="btn-remove-cart-item"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Order Summary Box */}
            <div className="order-summary-card">
              <h3>Order Summary</h3>
              <hr />

              <div className="summary-row">
                <span>Total Items:</span>
                <span>{totalCount}</span>
              </div>

              <div className="summary-row summary-subtotal-row">
                <span>Subtotal:</span>
                <span className="summary-subtotal-amount">₹{subtotal}</span>
              </div>

              <button 
                onClick={() => alert('Proceeding to Checkout! (Lab 06 feature)')}
                className="btn-checkout"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
