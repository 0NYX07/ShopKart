import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import api, { createPaymentOrder, verifyPayment } from '../services/api';

/**
  * Dynamically loads the official Razorpay Checkout SDK script.
  * Resolves true if loaded successfully, false otherwise.
  */
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // If already loaded in window, resolve immediately
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    // Check if script tag already exists in DOM
    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existingScript) {
      existingScript.onload = () => resolve(true);
      existingScript.onerror = () => resolve(false);
      return;
    }

    // Dynamically inject script tag
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, loading: cartLoading, subtotal, totalCount, fetchCart } = useCart();

  // Authentication check state
  const [authChecking, setAuthChecking] = useState(true);
  const [user, setUser] = useState(null);

  // Shipping Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Validation errors state
  const [errors, setErrors] = useState({});

  // Submission & API state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [dismissMessage, setDismissMessage] = useState('');

  // Verified Paid Order Details (Step 7 Success state)
  const [verifiedOrder, setVerifiedOrder] = useState(null);

  // 1. Verify user authentication on mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await api.get('/customers/me');
        if (response.data) {
          setUser(response.data);
          // Pre-fill full name and phone if available in customer profile
          setFormData((prev) => ({
            ...prev,
            fullName: prev.fullName || response.data.fullName || '',
            phone: prev.phone || response.data.phone || ''
          }));
        }
      } catch {
        // If unauthenticated, redirect to login
        navigate('/login');
      } finally {
        setAuthChecking(false);
      }
    };

    verifyAuth();
  }, [navigate]);

  // Handle form field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Client-side form validation
  const validateForm = () => {
    const newErrors = {};

    // Full Name: required, minimum 2 characters
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full Name must be at least 2 characters';
    }

    // Phone: required, valid 10-digit Indian mobile number
    const cleanPhone = formData.phone.trim();
    if (!cleanPhone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      newErrors.phone = 'Enter a valid 10-digit mobile number starting with 6-9';
    }

    // Address: required, minimum 5 characters
    if (!formData.address.trim()) {
      newErrors.address = 'Street address is required';
    } else if (formData.address.trim().length < 5) {
      newErrors.address = 'Address must be at least 5 characters';
    }

    // City: required, minimum 2 characters
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    } else if (formData.city.trim().length < 2) {
      newErrors.city = 'City must be at least 2 characters';
    }

    // State: required, minimum 2 characters
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    } else if (formData.state.trim().length < 2) {
      newErrors.state = 'State must be at least 2 characters';
    }

    // Pincode: required, exactly 6 digits
    const cleanPincode = formData.pincode.trim();
    if (!cleanPincode) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(cleanPincode)) {
      newErrors.pincode = 'Pincode must be exactly 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle checkout submission, order creation, and Razorpay modal launch
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setDismissMessage('');

    // Prevent submission if form validation fails
    if (!validateForm()) {
      return;
    }

    // Guard against empty cart
    if (!cartItems || cartItems.length === 0) {
      setSubmitError('Your cart is empty. Please add items before checking out.');
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Prepare shipping address payload
      const shippingAddress = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim()
      };

      // 2. Call backend to create ShopKart order + Razorpay Test order
      const response = await createPaymentOrder(shippingAddress);

      if (!response.data || !response.data.success) {
        setSubmitError(response.data?.message || 'Failed to create payment order.');
        setIsSubmitting(false);
        return;
      }

      const orderId = response.data.orderId || response.data.shopKartOrderId;
      const razorpayOrderId = response.data.razorpayOrderId;
      const amount = response.data.amount;
      const currency = response.data.currency;
      const razorpayKeyId = response.data.razorpayKeyId || response.data.key;

      // 3. Dynamically load the Razorpay Checkout SDK script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded || !window.Razorpay) {
        setSubmitError(
          'Failed to load Razorpay payment SDK. Please verify your internet connection and try again.'
        );
        setIsSubmitting(false);
        return;
      }

      // 4. Configure Razorpay Standard Checkout options using backend authoritative data
      const options = {
        key: razorpayKeyId,
        amount: amount, // Server-calculated amount in paise
        currency: currency || 'INR',
        name: 'ShopKart',
        description: `Order #${orderId}`,
        order_id: razorpayOrderId, // Server-generated Razorpay order ID
        prefill: {
          name: formData.fullName.trim(),
          email: user?.email || '',
          contact: formData.phone.trim()
        },
        theme: {
          color: '#10b981'
        },
        // Callback invoked by Razorpay on client-side payment completion
        handler: async function (razorpayResponse) {
          try {
            setIsVerifying(true);
            setSubmitError('');

            // Send payment details to backend for cryptographic signature verification
            const verifyPayload = {
              orderId: orderId,
              shopKartOrderId: orderId,
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature
            };

            const verifyRes = await verifyPayment(verifyPayload);

            if (verifyRes.data && verifyRes.data.success) {
              // Successfully verified by backend! Mark order as paid in UI
              setVerifiedOrder(verifyRes.data.order);
              // Refresh cart state to reflect the cart cleared on the backend
              if (typeof fetchCart === 'function') {
                fetchCart();
              }
            } else {
              setSubmitError(
                verifyRes.data?.message || 'Payment verification failed on the server.'
              );
            }
          } catch (err) {
            const errorMsg =
              err.response?.data?.message ||
              'Payment verification error. The server was unable to verify the signature.';
            setSubmitError(errorMsg);
          } finally {
            setIsVerifying(false);
            setIsSubmitting(false);
          }
        },
        modal: {
          // Handle user closing or dismissing the Razorpay popup without paying
          ondismiss: function () {
            setIsSubmitting(false);
            setDismissMessage(
              'Payment popup was dismissed. Your order remains pending. You can retry payment anytime.'
            );
          }
        }
      };

      // 5. Open the Razorpay Checkout modal
      const rzpInstance = new window.Razorpay(options);

      // Handle payment failure event from gateway
      rzpInstance.on('payment.failed', function (failureResponse) {
        setSubmitError(
          failureResponse.error?.description ||
          'Payment failed at the gateway. Please try again with another method.'
        );
        setIsSubmitting(false);
      });

      rzpInstance.open();

    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        'Server error while initiating payment. Please check your information and try again.';
      setSubmitError(errorMsg);
      setIsSubmitting(false);
    }
  };

  // Loading state while checking authentication or initial cart loading
  if (authChecking || cartLoading) {
    return (
      <div>
        <Navbar />
        <div className="checkout-container">
          <div className="loading-state">Loading checkout...</div>
        </div>
      </div>
    );
  }

  // Success view: rendered when backend cryptographically verifies payment
  if (verifiedOrder) {
    return (
      <div>
        <Navbar />
        <div className="checkout-container">
          <div className="payment-verified-card">
            <div className="payment-verified-header">
              <div className="payment-success-icon">🎉</div>
              <h2>Payment Completed & Verified!</h2>
              <p>Thank you for your purchase. Your order has been placed successfully.</p>
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <span className="order-lifecycle-badge">Order: {verifiedOrder.status || 'PLACED'}</span>
                <span className="paid-badge">Payment: {verifiedOrder.paymentStatus || 'paid'}</span>
              </div>
            </div>

            <div className="order-details-grid">
              <div className="order-detail-item">
                <div className="order-detail-label">ShopKart Order ID</div>
                <div className="order-detail-value">{verifiedOrder._id}</div>
              </div>
              <div className="order-detail-item">
                <div className="order-detail-label">Razorpay Order ID</div>
                <div className="order-detail-value">{verifiedOrder.razorpayOrderId}</div>
              </div>
              {verifiedOrder.razorpayPaymentId && (
                <div className="order-detail-item">
                  <div className="order-detail-label">Razorpay Payment ID</div>
                  <div className="order-detail-value">{verifiedOrder.razorpayPaymentId}</div>
                </div>
              )}
              <div className="order-detail-item">
                <div className="order-detail-label">Total Amount Paid</div>
                <div className="order-detail-value">₹{verifiedOrder.totalAmount}</div>
              </div>
              <div className="order-detail-item">
                <div className="order-detail-label">Delivery To</div>
                <div className="order-detail-value">
                  {verifiedOrder.shippingAddress?.fullName} ({verifiedOrder.shippingAddress?.city}, {verifiedOrder.shippingAddress?.state})
                </div>
              </div>
            </div>

            <h4 style={{ marginTop: '20px', marginBottom: '10px', color: '#1e293b' }}>
              Ordered Items
            </h4>
            <div className="checkout-items-preview-list">
              {verifiedOrder.items?.map((item, idx) => (
                <div key={idx} className="checkout-item-preview">
                  <div>
                    <div className="checkout-item-name">{item.name}</div>
                    <div className="checkout-item-qty">Qty: {item.quantity} × ₹{item.price}</div>
                  </div>
                  <div className="checkout-item-price">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '30px', textAlign: 'center', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/orders')}
                className="btn-view-details"
                style={{ padding: '12px 24px', fontSize: '1rem' }}
              >
                View My Orders
              </button>
              <button
                onClick={() => navigate('/products')}
                className="btn-checkout"
                style={{ width: 'auto', padding: '12px 32px' }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart view: prevent checkout and link back to shopping
  if (!cartItems || cartItems.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="checkout-container">
          <div className="empty-cart-box">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your Cart is Empty</h2>
            <p>You need items in your cart to proceed with checkout.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/products')}
                className="btn-checkout"
                style={{ width: 'auto', padding: '10px 24px' }}
              >
                Browse Products
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="btn-retry"
                style={{ padding: '10px 24px' }}
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <div className="checkout-container">
        <div className="checkout-header">
          <h2>Checkout 📦</h2>
          <p>Review your items and provide your delivery details below.</p>
        </div>

        {/* Global Error Banner */}
        {submitError && (
          <div className="cart-action-error-bar">
            {submitError}
          </div>
        )}

        {/* Popup Dismissed Notification */}
        {dismissMessage && (
          <div className="dismiss-notice-bar">
            ℹ️ {dismissMessage}
          </div>
        )}

        {/* Verification in Progress Indicator */}
        {isVerifying && (
          <div className="cart-action-error-bar" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
            ⏳ Cryptographically verifying payment with the server... Please do not refresh.
          </div>
        )}

        <div className="checkout-grid">
          {/* Left Column: Shipping Address Form */}
          <div className="checkout-form-card">
            <h3>Shipping Information</h3>

            <form onSubmit={handleSubmit} noValidate>
              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className={errors.fullName ? 'input-error' : ''}
                  disabled={isSubmitting || isVerifying}
                />
                {errors.fullName && (
                  <span className="field-error-text">{errors.fullName}</span>
                )}
              </div>

              {/* Phone Number */}
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number (e.g. 9876543210)"
                  className={errors.phone ? 'input-error' : ''}
                  disabled={isSubmitting || isVerifying}
                />
                {errors.phone && (
                  <span className="field-error-text">{errors.phone}</span>
                )}
              </div>

              {/* Street Address */}
              <div className="form-group">
                <label htmlFor="address">Address *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Flat, House no., Building, Apartment, Street"
                  className={errors.address ? 'input-error' : ''}
                  disabled={isSubmitting || isVerifying}
                />
                {errors.address && (
                  <span className="field-error-text">{errors.address}</span>
                )}
              </div>

              {/* City, State, Pincode Row */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Mumbai"
                    className={errors.city ? 'input-error' : ''}
                    disabled={isSubmitting || isVerifying}
                  />
                  {errors.city && (
                    <span className="field-error-text">{errors.city}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="state">State *</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Maharashtra"
                    className={errors.state ? 'input-error' : ''}
                    disabled={isSubmitting || isVerifying}
                  />
                  {errors.state && (
                    <span className="field-error-text">{errors.state}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="pincode">Pincode *</label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    className={errors.pincode ? 'input-error' : ''}
                    disabled={isSubmitting || isVerifying}
                  />
                  {errors.pincode && (
                    <span className="field-error-text">{errors.pincode}</span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn-checkout"
                disabled={isSubmitting || isVerifying}
                style={{ opacity: isSubmitting || isVerifying ? 0.7 : 1 }}
              >
                {isSubmitting
                  ? 'Connecting to Razorpay...'
                  : isVerifying
                  ? 'Verifying Payment...'
                  : 'Place Order & Pay with Razorpay'}
              </button>
            </form>
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="order-summary-card">
            <h3>Order Summary</h3>
            <hr />

            {/* Cart Items Preview List */}
            <div className="checkout-items-preview-list">
              {cartItems.map((item) => {
                const product = item.product || {};
                const name = product.name || 'Product';
                const price = product.price || 0;
                const image = product.image;
                const qty = item.quantity || 1;

                return (
                  <div key={product._id || item._id} className="checkout-item-preview">
                    <div className="checkout-item-info">
                      {image && (
                        <img
                          src={image}
                          alt={name}
                          className="checkout-item-thumb"
                        />
                      )}
                      <div>
                        <div className="checkout-item-name">{name}</div>
                        <div className="checkout-item-qty">Qty: {qty}</div>
                      </div>
                    </div>
                    <div className="checkout-item-price">
                      ₹{price * qty}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="summary-row">
              <span>Total Items:</span>
              <span>{totalCount}</span>
            </div>

            <div className="summary-row summary-subtotal-row">
              <span>Estimated Total:</span>
              <span className="summary-subtotal-amount">₹{subtotal}</span>
            </div>

            <p className="order-authoritative-note">
              * Displayed subtotal is based on catalog prices. Authoritative prices and stock limits are validated securely by the server during order creation.
            </p>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <Link to="/cart" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.9rem' }}>
                ← Edit Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
