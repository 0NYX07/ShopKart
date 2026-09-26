import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

function CartDrawer() {
  const { 
    cartItems, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    subtotal, 
    clearCart 
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="cart-backdrop" onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <div className="cart-header-title">
            <h3>Your Shopping Cart</h3>
            <span className="cart-pill-count">{cartItems.length} items</span>
          </div>
          <button 
            className="btn-close-cart" 
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        <div className="cart-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <div className="cart-empty-illustration">🛒</div>
              <h4>Your cart is empty</h4>
              <p>Looks like you haven't added anything to your cart yet.</p>
              <button 
                className="btn-browse-catalog"
                onClick={() => setIsCartOpen(false)}
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item._id} className="cart-item-row">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="cart-item-img"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="cart-item-info">
                    <span className="cart-item-cat">{item.category}</span>
                    <h5 className="cart-item-name">{item.name}</h5>
                    <div className="cart-item-price">₹{item.price.toLocaleString()}</div>
                    
                    <div className="cart-qty-controls">
                      <button 
                        onClick={() => updateQuantity(item._id, -1)}
                        className="qty-btn"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item._id, 1)}
                        className="qty-btn"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>

                      <button 
                        onClick={() => removeFromCart(item._id)}
                        className="btn-remove-item"
                        title="Remove item"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal-row">
              <span>Subtotal</span>
              <span className="subtotal-amount">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="cart-shipping-note">
              <span className="shipping-badge">FREE</span> Standard carbon-neutral shipping
            </div>
            <button 
              className="btn-checkout"
              onClick={() => {
                alert('🎉 Order placed successfully in demo mode! Thank you for testing ShopKart.');
                clearCart();
                setIsCartOpen(false);
              }}
            >
              Checkout Now (₹{subtotal.toLocaleString()})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartDrawer;
