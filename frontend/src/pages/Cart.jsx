import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartItem from '../components/CartItem';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    error,
    totalUnits,
    totalItems,
    subtotal,
    refreshCart,
  } = useCart();

  const [checkoutModal, setCheckoutModal] = useState(false);

  // 1. Loading State (Task 17)
  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <main className="cart-page-container">
          <div className="state-container loading-state">
            <div className="spinner-large"></div>
            <h2 className="state-title">Loading your cart...</h2>
            <p className="state-message">Fetching your latest items and real-time inventory.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 2. Error State (Task 17)
  if (error && cartItems.length === 0) {
    return (
      <div className="app-container">
        <Navbar />
        <main className="cart-page-container">
          <div className="state-container error-state">
            <div className="state-icon-wrapper error">
              <AlertCircle size={40} />
            </div>
            <h2 className="state-title">Unable to load your cart</h2>
            <p className="state-message">{error}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={refreshCart}
              style={{ width: 'auto', padding: '0.75rem 2rem' }}
            >
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 3. Empty State (Task 17)
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="app-container">
        <Navbar />
        <main className="cart-page-container">
          <div className="cart-empty-card animate-fade-in-up">
            <div className="cart-empty-icon-wrap">
              <ShoppingBag size={54} strokeWidth={1.5} />
            </div>
            <h2 className="cart-empty-title">Your cart is empty 🛒</h2>
            <p className="cart-empty-subtitle">
              Looks like you haven't added anything yet. Explore our curated catalog to discover premium products.
            </p>
            <div className="cart-empty-actions">
              <Link to="/products" className="btn btn-primary" id="browse-products-btn">
                <ShoppingBag size={18} /> Browse Products
              </Link>
              <Link to="/wishlist" className="btn btn-secondary">
                View Wishlist
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 4. Cart View with Items and Order Summary
  return (
    <div className="app-container">
      <Navbar />

      <main className="cart-page-container animate-fade-in-up">
        {/* Breadcrumb Navigation */}
        <div className="cart-header-nav">
          <div className="breadcrumb-trail">
            <Link to="/home">Home</Link>
            <span>/</span>
            <Link to="/products">Shop</Link>
            <span>/</span>
            <span className="breadcrumb-current">Shopping Cart</span>
          </div>
        </div>

        {/* Page Title & Count Badge */}
        <div className="cart-page-header">
          <div className="cart-title-group">
            <h1 className="cart-page-title">My Cart</h1>
            <span className="cart-items-count-badge">
              {totalUnits} {totalUnits === 1 ? 'item' : 'items'} ({totalItems} distinct)
            </span>
          </div>
          <Link to="/products" className="cart-continue-link">
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
        </div>

        {/* Main Two-Column Layout */}
        <div className="cart-layout-grid">
          {/* Left Column: Cart Items List */}
          <div className="cart-items-column">
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <CartItem
                  key={item.product?._id || item._id}
                  item={item}
                />
              ))}
            </div>

            <div className="cart-bottom-notice">
              <Sparkles size={16} className="sparkle-icon" />
              <span>
                Items in your cart are reserved dynamically against current catalog stock limits.
              </span>
            </div>
          </div>

          {/* Right Column: Order Summary (Task 13 & 15) */}
          <aside className="cart-summary-column">
            <div className="order-summary-card">
              <h2 className="summary-title">Order Summary</h2>

              <div className="summary-row">
                <span className="summary-label">Total Items</span>
                <span className="summary-value" id="summary-items-count">
                  {totalItems} ({totalUnits} {totalUnits === 1 ? 'unit' : 'units'})
                </span>
              </div>

              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value" id="summary-subtotal">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="summary-row">
                <span className="summary-label">Estimated Shipping</span>
                <span className="summary-value shipping-free">FREE</span>
              </div>

              <div className="summary-row">
                <span className="summary-label">Taxes</span>
                <span className="summary-value tax-included">Included in price</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-total-row">
                <span className="total-label">Total Amount</span>
                <span className="total-value" id="summary-total-amount">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                type="button"
                id="proceed-to-checkout-btn"
                className="btn btn-primary btn-checkout"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </button>

              {/* Trust Badges */}
              <div className="summary-trust-badges">
                <div className="summary-badge-item">
                  <Truck size={16} />
                  <span>Free Express Delivery</span>
                </div>
                <div className="summary-badge-item">
                  <ShieldCheck size={16} />
                  <span>100% Secure Checkout</span>
                </div>
                <div className="summary-badge-item">
                  <RotateCcw size={16} />
                  <span>30-Day Easy Returns</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Checkout Preview Modal (Bridge to Lab-06) */}
      {checkoutModal && (
        <div className="modal-backdrop" onClick={() => setCheckoutModal(false)}>
          <div
            className="checkout-preview-modal animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-wrap">
                <CheckCircle size={22} color="#10b981" />
                <h3>Ready for Checkout</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setCheckoutModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>
                Your cart containing <strong>{totalUnits} items</strong> (Subtotal: <strong>₹{subtotal.toLocaleString('en-IN')}</strong>) is ready for order placement!
              </p>
              <div className="checkout-next-lab-card">
                <strong>🚀 Upcoming in Lab-06: Checkout & Order Creation</strong>
                <ul>
                  <li>Delivery address selection & validation</li>
                  <li>Final inventory reservation check</li>
                  <li>Order snapshot creation & conversion</li>
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCheckoutModal(false)}
              >
                Keep Shopping
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setCheckoutModal(false);
                  navigate('/products');
                }}
              >
                Explore More Products
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Cart;
