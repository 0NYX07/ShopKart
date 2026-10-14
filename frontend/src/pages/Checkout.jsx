import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  Truck,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Lock,
  User,
  Phone,
  MapPin,
  Building,
  Compass,
  Hash,
  Sparkles,
  Check,
  ChevronDown,
  Search,
  Zap,
  X,
  AlertTriangle,
  RefreshCw,
  Smartphone,
  Wallet,
  Landmark,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import api from '../services/api';

/**
 * Standard list of Indian States & Union Territories
 */
const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

const POPULAR_STATES = [
  'Karnataka',
  'Maharashtra',
  'Delhi',
  'Tamil Nadu',
  'Gujarat',
  'Uttar Pradesh',
  'Telangana',
];

const SIMULATION_FAILURE_REASONS = [
  'Insufficient account balance in customer account',
  'Bank server gateway timeout (HTTP 504)',
  'Card declined by issuing bank (Security Rules)',
  'Transaction cancelled by customer',
  'Invalid OTP verification attempt',
];

const QUICK_TEST_PHONES = [
  { phone: '9876543210', label: '9876543210 (Test 1)' },
  { phone: '9988776655', label: '9988776655 (Test 2)' },
  { phone: '9123456789', label: '9123456789 (Test 3)' },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, totalUnits, subtotal, clearCart, loading: cartLoading } = useCart();

  // All Delivery details state (all required on checkout page)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Field-level error messages
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Simulation Popup State
  const [showSimModal, setShowSimModal] = useState(false);
  const [simPhone, setSimPhone] = useState('');
  const [simPhoneError, setSimPhoneError] = useState('');
  const [activePaymentChannel, setActivePaymentChannel] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'wallet'
  const [selectedUpiApp, setSelectedUpiApp] = useState('Google Pay');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Paytm Wallet');
  const [failureReason, setFailureReason] = useState(SIMULATION_FAILURE_REASONS[0]);
  const [showFailureDetails, setShowFailureDetails] = useState(false);
  const [modalSimStep, setModalSimStep] = useState('select'); // 'select' | 'authorizing' | 'success' | 'failed'
  const [modalProcessingText, setModalProcessingText] = useState('');
  const [simTickerStep, setSimTickerStep] = useState(1);
  const [simSuccessData, setSimSuccessData] = useState(null);
  const orderPlacedRef = useRef(false);

  // Payment Gateway Configuration
  const [paymentConfig, setPaymentConfig] = useState({
    isConfigured: true,
    keyId: 'rzp_test_TlrSWGUSL5ecdo',
  });

  // Fetch active Razorpay payment configuration on mount
  useEffect(() => {
    const fetchPaymentConfig = async () => {
      try {
        const response = await api.get('/orders/payment-config');
        if (response.data?.success && response.data.keyId) {
          setPaymentConfig(response.data);
        }
      } catch (err) {
        console.warn('Could not fetch /orders/payment-config, using default Razorpay credentials:', err.message);
      }
    };
    fetchPaymentConfig();
  }, []);

  // Redirect to cart if empty (prevent redirect when order was placed!)
  useEffect(() => {
    if (orderPlacedRef.current) return;
    if (!cartLoading && (!cartItems || cartItems.length === 0)) {
      navigate('/cart');
    }
  }, [cartItems, cartLoading, navigate]);

  // State selection dropdown state
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const stateDropdownRef = useRef(null);

  // Close state dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(e.target)) {
        setStateDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setStateDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectState = (stateName) => {
    setFormData((prev) => ({ ...prev, state: stateName }));
    if (errors.state) {
      setErrors((prev) => ({ ...prev, state: null }));
    }
    if (serverError) setServerError(null);
    setStateDropdownOpen(false);
    setStateSearch('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (serverError) setServerError(null);
  };

  /**
   * Client-side validation: verifies ALL fields on the checkout page
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else {
      const cleanPhone = formData.phone.trim().replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        newErrors.phone = 'Phone number must contain at least 10 digits.';
      }
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Street Address is required.';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required.';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State / Region is required.';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required.';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Pincode must contain exactly 6 numeric digits.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * When user clicks "Proceed to Pay", validate checkout form and open Simulation Popup
   */
  const handleProceedToPayment = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prefill modal's mobile number with checkout phone number
    setSimPhone(formData.phone.trim());
    setSimPhoneError('');
    setShowFailureDetails(false);
    setModalSimStep('select');
    setSimSuccessData(null);
    setSimTickerStep(1);
    setShowSimModal(true);
  };

  /**
   * Executes Simulation from inside the popup modal with authentic Razorpay animation
   */
  const executeSimulation = async (isSuccess, chosenReason = failureReason) => {
    // Validate the mobile number entered inside the popup
    const cleanModalPhone = simPhone.trim().replace(/\D/g, '');
    if (!cleanModalPhone || cleanModalPhone.length < 10) {
      setSimPhoneError('Please enter a valid 10-digit mobile number for authorization.');
      return;
    }
    setSimPhoneError('');

    setSubmitting(true);
    setModalSimStep('authorizing');
    setSimTickerStep(1);

    const channelNames = {
      upi: `UPI (${selectedUpiApp})`,
      card: 'Credit / Debit Card',
      netbanking: `Net Banking (${selectedBank})`,
      wallet: `Wallet (${selectedWallet})`,
    };
    const currentChannel = channelNames[activePaymentChannel] || 'Payment Gateway';

    // Staggered ticker steps for realistic Razorpay banking authorization animation
    const step2Timer = setTimeout(() => setSimTickerStep(2), 650);
    const step3Timer = setTimeout(() => setSimTickerStep(3), 1300);

    try {
      // 1. Create order on backend with all shipping address details
      const orderRes = await api.post('/orders/create-payment-order', {
        shippingAddress: {
          ...formData,
          phone: cleanModalPhone,
        },
      });

      const orderData = orderRes.data;
      if (!orderData?.success) {
        throw new Error(orderData?.message || 'Failed to initiate payment order');
      }

      // Realistic banking gateway authorization delay
      await new Promise((r) => setTimeout(r, 1400));

      if (isSuccess) {
        // 2a. Payment Success: Verify HMAC SHA-256 signature
        const verifyPayload = {
          shopKartOrderId: orderData.shopKartOrderId,
          razorpay_order_id: orderData.razorpayOrderId,
          razorpay_payment_id: orderData.demoPaymentId || `pay_sim_${Date.now()}`,
          razorpay_signature: orderData.demoSignature,
        };

        const verifyRes = await api.post('/orders/verify-payment', verifyPayload);

        if (verifyRes.data?.success) {
          clearTimeout(step2Timer);
          clearTimeout(step3Timer);
          setSimTickerStep(3);

          const finalOrderId = verifyRes.data?.order?._id || orderData.shopKartOrderId;
          const verifiedPaymentId =
            verifyRes.data?.order?.razorpayPaymentId || orderData.demoPaymentId || `pay_sim_${Date.now()}`;

          setSimSuccessData({
            paymentId: verifiedPaymentId,
            orderId: orderData.razorpayOrderId,
            shopKartOrderId: finalOrderId,
            amount: subtotal,
            method: currentChannel,
            phone: cleanModalPhone,
            order: verifyRes.data?.order,
          });

          // Transition to the official Razorpay Success Animation!
          setModalSimStep('success');

          // Keep Razorpay green checkmark & celebration visible, then navigate smoothly to Order Placed!
          setTimeout(() => {
            orderPlacedRef.current = true;
            clearCart();
            setShowSimModal(false);
            navigate(`/order-placed/${finalOrderId}`, {
              state: { order: verifyRes.data?.order, fromCheckout: true },
            });
          }, 1900);
        } else {
          throw new Error(verifyRes.data?.message || 'Payment signature verification failed.');
        }
      } else {
        // 2b. Payment Failure: Record simulated rejection
        clearTimeout(step2Timer);
        clearTimeout(step3Timer);

        await api.post('/orders/record-failure', {
          shopKartOrderId: orderData.shopKartOrderId,
          reason: chosenReason,
        });

        setModalSimStep('failed');
        setSubmitting(false);
      }
    } catch (err) {
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      console.error('Payment simulation error:', err);
      const msg = err.response?.data?.message || err.message || 'Payment simulation failed';
      setServerError(msg);
      setModalSimStep('failed');
      setSubmitting(false);
    }
  };

  const finalPayable = subtotal;

  if (cartLoading) {
    return (
      <div className="app-container">
        <Navbar />
        <main className="cart-page-container">
          <div className="state-container loading-state">
            <div className="spinner-large"></div>
            <h2 className="state-title">Preparing Checkout...</h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />

      <main className="cart-page-container animate-fade-in-up" style={{ maxWidth: '1150px' }}>
        {/* Stepper */}
        <div className="checkout-stepper-wrap">
          <div className="checkout-step-item completed">
            <div className="checkout-step-bubble">
              <Check size={16} />
            </div>
            <span className="checkout-step-title">Cart (1)</span>
          </div>
          <div className="checkout-step-divider completed"></div>

          <div className="checkout-step-item active">
            <div className="checkout-step-bubble">2</div>
            <span className="checkout-step-title">Shipping &amp; Payment</span>
          </div>
          <div className="checkout-step-divider"></div>

          <div className="checkout-step-item">
            <div className="checkout-step-bubble">3</div>
            <span className="checkout-step-title">Confirmation</span>
          </div>
        </div>

        {/* Header */}
        <div className="cart-page-header" style={{ marginBottom: '1.5rem' }}>
          <div className="cart-title-group">
            <h1 className="cart-page-title">Executive Checkout</h1>
            <span className="cart-items-count-badge">
              <Lock size={13} style={{ marginRight: '4px' }} /> 256-Bit SSL Encrypted
            </span>
          </div>
          <Link to="/cart" className="cart-continue-link">
            <ArrowLeft size={16} /> Back to Bag
          </Link>
        </div>

        {/* Global Error Banner (displays if payment failure was simulated) */}
        {serverError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              padding: '1.15rem 1.35rem',
              borderRadius: '16px',
              marginBottom: '1.75rem',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={24} color="#dc2626" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.98rem' }}>Payment Status: </strong>
                <span style={{ fontSize: '0.9rem' }}>{serverError}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setServerError(null);
                setShowSimModal(true);
              }}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RefreshCw size={14} /> Retry Payment
            </button>
          </div>
        )}

        {/* Two-Column Checkout Layout */}
        <div className="cart-layout-grid" style={{ alignItems: 'start', gap: '2rem' }}>
          {/* Left Column: Full Delivery Form & Payment Gateway Card */}
          <div className="cart-items-column">
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: '20px',
                border: '1px solid var(--border-subtle)',
                padding: '2.25rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      backgroundColor: 'var(--brand-accent-subtle)',
                      color: 'var(--brand-accent)',
                      padding: '10px',
                      borderRadius: '12px',
                      display: 'flex',
                    }}
                  >
                    <Truck size={22} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
                      1. Delivery Address
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                      Enter all shipping and contact details for your order.
                    </p>
                  </div>
                </div>
              </div>

              {/* Full Address Form (Takes ALL Details) */}
              <form onSubmit={handleProceedToPayment} id="checkout-form">
                <div className="checkout-form-grid">
                  {/* Row 1: Full Name & Phone Number */}
                  <div className="checkout-field-group">
                    <label htmlFor="fullName" className="checkout-field-label">
                      Full Name <span className="req-star">*</span>
                    </label>
                    <div className="form-input-container">
                      <User size={18} className="form-input-icon" />
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        className={`checkout-input ${errors.fullName ? 'has-error' : ''}`}
                        placeholder="e.g. Aarav Sharma"
                        value={formData.fullName}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.fullName && <span className="checkout-error-msg">{errors.fullName}</span>}
                  </div>

                  <div className="checkout-field-group">
                    <label htmlFor="phone" className="checkout-field-label">
                      Phone Number <span className="req-star">*</span>
                    </label>
                    <div className="form-input-container">
                      <Phone size={18} className="form-input-icon" />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        className={`checkout-input ${errors.phone ? 'has-error' : ''}`}
                        placeholder="e.g. 9876543210"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.phone && <span className="checkout-error-msg">{errors.phone}</span>}
                  </div>

                  {/* Row 2: Street Address */}
                  <div className="checkout-field-group full-width">
                    <label htmlFor="addressLine1" className="checkout-field-label">
                      Street Address &amp; Residence <span className="req-star">*</span>
                    </label>
                    <div className="form-input-container">
                      <MapPin size={18} className="form-input-icon" />
                      <input
                        id="addressLine1"
                        name="addressLine1"
                        type="text"
                        className={`checkout-input ${errors.addressLine1 ? 'has-error' : ''}`}
                        placeholder="e.g. Flat 402, Lotus Residency, MG Road"
                        value={formData.addressLine1}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.addressLine1 && <span className="checkout-error-msg">{errors.addressLine1}</span>}
                  </div>

                  {/* Row 3: City & State */}
                  <div className="checkout-field-group">
                    <label htmlFor="city" className="checkout-field-label">
                      City <span className="req-star">*</span>
                    </label>
                    <div className="form-input-container">
                      <Building size={18} className="form-input-icon" />
                      <input
                        id="city"
                        name="city"
                        type="text"
                        className={`checkout-input ${errors.city ? 'has-error' : ''}`}
                        placeholder="e.g. Bengaluru"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.city && <span className="checkout-error-msg">{errors.city}</span>}
                  </div>

                  {/* State Dropdown */}
                  <div className="checkout-field-group">
                    <div className="checkout-field-label-row">
                      <label htmlFor="state-trigger-btn" className="checkout-field-label" style={{ margin: 0 }}>
                        State / Region <span className="req-star">*</span>
                      </label>
                      {formData.state && (
                        <button
                          type="button"
                          onClick={() => handleSelectState('')}
                          className="state-clear-btn"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="luxury-state-select-wrapper" ref={stateDropdownRef}>
                      <button
                        id="state-trigger-btn"
                        type="button"
                        className={`luxury-state-trigger ${stateDropdownOpen ? 'is-open' : ''} ${
                          errors.state ? 'has-error' : ''
                        }`}
                        onClick={() => setStateDropdownOpen((prev) => !prev)}
                        aria-expanded={stateDropdownOpen}
                      >
                        <Compass size={18} className="form-input-icon" />
                        <div className="state-trigger-content">
                          {formData.state ? (
                            <span className="state-selected-pill">{formData.state}</span>
                          ) : (
                            <span className="state-placeholder">Select Delivery State...</span>
                          )}
                        </div>
                        <ChevronDown
                          size={16}
                          className={`state-chevron-icon ${stateDropdownOpen ? 'is-open' : ''}`}
                        />
                      </button>

                      {stateDropdownOpen && (
                        <div className="state-dropdown-menu">
                          <div className="state-search-container">
                            <Search size={14} className="state-search-icon" />
                            <input
                              type="text"
                              className="state-search-input"
                              placeholder="Type to filter states..."
                              value={stateSearch}
                              onChange={(e) => setStateSearch(e.target.value)}
                              autoFocus
                            />
                          </div>

                          {!stateSearch && (
                            <div className="state-quick-chips-box">
                              <div className="state-quick-title">Popular States</div>
                              <div className="state-chips-row">
                                {POPULAR_STATES.map((popular) => (
                                  <button
                                    key={popular}
                                    type="button"
                                    className={`state-quick-chip ${
                                      formData.state === popular ? 'active' : ''
                                    }`}
                                    onClick={() => handleSelectState(popular)}
                                  >
                                    {popular}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="state-options-container">
                            {INDIAN_STATES.filter((st) =>
                              st.toLowerCase().includes(stateSearch.toLowerCase().trim())
                            ).map((st) => {
                              const isSelected = formData.state === st;
                              return (
                                <button
                                  key={st}
                                  type="button"
                                  className={`state-option-btn ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleSelectState(st)}
                                >
                                  <span>{st}</span>
                                  {isSelected && <CheckCircle size={15} color="var(--brand-accent)" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.state && <span className="checkout-error-msg">{errors.state}</span>}
                  </div>

                  {/* Row 4: Pincode & Country */}
                  <div className="checkout-field-group">
                    <label htmlFor="pincode" className="checkout-field-label">
                      Pincode (6 digits) <span className="req-star">*</span>
                    </label>
                    <div className="form-input-container">
                      <Hash size={18} className="form-input-icon" />
                      <input
                        id="pincode"
                        name="pincode"
                        type="text"
                        maxLength={6}
                        className={`checkout-input ${errors.pincode ? 'has-error' : ''}`}
                        placeholder="e.g. 560001"
                        value={formData.pincode}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.pincode && <span className="checkout-error-msg">{errors.pincode}</span>}
                  </div>

                  <div className="checkout-field-group">
                    <label className="checkout-field-label">Country / Destination</label>
                    <div className="country-readonly-badge">
                      <span style={{ fontSize: '1.2rem' }}>🇮🇳</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                          India
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Priority Express Delivery (FREE)
                        </div>
                      </div>
                      <CheckCircle size={15} color="var(--status-success-text)" style={{ flexShrink: 0 }} />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* 2. Payment Method Card on Checkout Page */}
            <div className="payment-selection-box" style={{ marginTop: '1.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      backgroundColor: 'var(--brand-accent-subtle)',
                      color: 'var(--brand-accent)',
                      padding: '10px',
                      borderRadius: '12px',
                      display: 'flex',
                    }}
                  >
                    <CreditCard size={22} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
                      2. Payment Method
                    </h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                      Razorpay Gateway &amp; Interactive Payment Sandbox.
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--status-success-text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'var(--status-success-bg)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    border: '1px solid var(--status-success-border)',
                  }}
                >
                  <ShieldCheck size={14} /> Razorpay Sandbox
                </span>
              </div>

              {/* Gateway Channel Banner */}
              <div
                style={{
                  border: '2px solid var(--brand-accent)',
                  borderRadius: '16px',
                  padding: '1.25rem 1.35rem',
                  background: 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #072654 0%, #0c2f64 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#3399cc',
                      fontWeight: 800,
                      fontSize: '1.3rem',
                      flexShrink: 0,
                    }}
                  >
                    R
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span>Razorpay Official Gateway</span>
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'var(--brand-accent-subtle)', color: 'var(--brand-accent)', fontWeight: 700 }}>
                        Interactive Simulation Popup
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Supports UPI, Cards, Net Banking &amp; Wallets with instant simulation.
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--brand-accent)' }}>
                  <CheckCircle size={22} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '1rem' }}>
                {['UPI (GPay / PhonePe / Paytm)', 'Credit / Debit Cards', 'Net Banking', 'Wallets'].map((rail) => (
                  <span
                    key={rail}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '8px',
                      background: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                    }}
                  >
                    {rail}
                  </span>
                ))}
              </div>

              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '0.85rem 1rem',
                  background: 'var(--bg-surface-subtle)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                }}
              >
                <Zap size={16} color="var(--brand-accent)" style={{ flexShrink: 0 }} />
                <span>
                  Clicking <strong>&ldquo;Proceed to Pay&rdquo;</strong> will open the payment simulation popup containing mobile number input &amp; payment options.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order CTA */}
          <aside className="cart-summary-column">
            <div className="order-summary-card">
              <h2 className="summary-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem' }}>
                Order Summary
              </h2>

              {/* Items List Snapshot */}
              <div
                style={{
                  maxHeight: '260px',
                  overflowY: 'auto',
                  margin: '1rem 0',
                  paddingRight: '4px',
                }}
              >
                {cartItems.map((item) => (
                  <div
                    key={item.product?._id || item._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 0',
                      borderBottom: '1px solid var(--border-subtle)',
                      fontSize: '0.88rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ position: 'relative' }}>
                        <img
                          src={item.product?.image || 'https://placehold.co/50x50'}
                          alt={item.product?.name}
                          style={{
                            width: '46px',
                            height: '46px',
                            objectFit: 'cover',
                            borderRadius: '10px',
                            border: '1px solid var(--border-subtle)',
                          }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
                            backgroundColor: 'var(--brand-primary)',
                            color: '#ffffff',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {item.quantity}
                        </span>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.product?.name}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                          ₹{Number(item.product?.price || 0).toLocaleString('en-IN')} each
                        </div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                      ₹{(Number(item.product?.price || 0) * Number(item.quantity || 1)).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="summary-row">
                <span className="summary-label">Items Count</span>
                <span className="summary-value">
                  {totalUnits} {totalUnits === 1 ? 'unit' : 'units'}
                </span>
              </div>

              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="summary-row">
                <span className="summary-label">Express Delivery</span>
                <span className="summary-value shipping-free">FREE</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-total-row">
                <span className="total-label">Total Payable</span>
                <span className="total-value" id="checkout-total-display" style={{ color: 'var(--brand-accent)' }}>
                  ₹{finalPayable.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Submit CTA: Opens Simulation Popup */}
              <button
                type="submit"
                form="checkout-form"
                id="place-order-btn"
                className="btn-checkout-luxury"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div
                      className="spinner"
                      style={{
                        width: '18px',
                        height: '18px',
                        borderColor: '#fff',
                        borderTopColor: 'transparent',
                      }}
                    ></div>
                    <span>Opening Payment Simulator...</span>
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    <span>Proceed to Pay ₹{finalPayable.toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>

              {/* Trust Badges */}
              <div className="summary-trust-badges" style={{ marginTop: '1.5rem' }}>
                <div className="summary-badge-item">
                  <ShieldCheck size={16} color="var(--brand-accent)" />
                  <span>256-Bit SSL Secured Checkout</span>
                </div>
                <div className="summary-badge-item">
                  <Truck size={16} color="var(--status-success-text)" />
                  <span>Free Express Courier Delivery</span>
                </div>
                <div className="summary-badge-item">
                  <Sparkles size={16} color="var(--text-muted)" />
                  <span>Payment Simulation Mode Active</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* ==========================================================================
          INTERACTIVE PAYMENT SIMULATION POPUP (MODAL)
          Contains mobile number input, payment option navigation, and success/failure triggers
          ========================================================================== */}
      {/* ==========================================================================
          OFFICIAL RAZORPAY PAYMENT SIMULATION MODAL
          ========================================================================== */}
      {showSimModal && (
        <div className="rzp-modal-overlay">
          <div className="rzp-modal-box">
            {/* Razorpay Brand Header */}
            <div className="rzp-modal-header">
              <div className="rzp-header-left">
                <div className="rzp-emblem-wrap">
                  <svg viewBox="0 0 40 40" width="28" height="28" fill="none">
                    <rect width="40" height="40" rx="8" fill="#0c2340" />
                    <path
                      d="M26.5 10H14.8L9.5 24.5H18.2L15.2 31.5L30.5 17H21.8L26.5 10Z"
                      fill="url(#rzpBlueGrad)"
                    />
                    <defs>
                      <linearGradient id="rzpBlueGrad" x1="9.5" y1="10" x2="30.5" y2="31.5" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#38bdf8" />
                        <stop offset="1" stopColor="#0284c7" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="rzp-header-info">
                  <div className="rzp-brand-line">
                    <span className="rzp-brand-text">Razor<span>pay</span></span>
                    <span className="rzp-trusted-pill">Trusted</span>
                  </div>
                  <span className="rzp-header-sub">Streia ShopKart &bull; Priority Checkout</span>
                </div>
              </div>

              <div className="rzp-header-right">
                <div className="rzp-amount-badge">
                  <div className="rzp-amount-label">Payable Amount</div>
                  <div className="rzp-amount-val">₹{finalPayable.toLocaleString('en-IN')}</div>
                </div>
                <button
                  type="button"
                  className="rzp-modal-close-btn"
                  onClick={() => setShowSimModal(false)}
                  disabled={submitting}
                  title="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Razorpay Modal Body */}
            <div className="rzp-modal-body">
              {/* STEP: AUTHORIZING PAYMENT (RAZORPAY SIMULATION ANIMATION) */}
              {modalSimStep === 'authorizing' && (
                <div className="rzp-processing-screen">
                  {/* Concentric Radar Rings & Spinner */}
                  <div className="rzp-radar-rings-wrap">
                    <div className="rzp-radar-ring"></div>
                    <div className="rzp-radar-ring ring-2"></div>
                    <div className="rzp-radar-ring ring-3"></div>
                    <div className="rzp-spin-ring"></div>
                    <div className="rzp-center-emblem">
                      <Lock size={22} color="#38bdf8" />
                    </div>
                  </div>

                  <h3 className="rzp-proc-title">
                    Authorizing Payment...
                  </h3>
                  <p className="rzp-proc-sub">
                    Connecting to your banking provider. Please do not refresh the page or press the back button.
                  </p>

                  <div className="rzp-proc-amount-tag">
                    <Zap size={14} />
                    <span>Processing ₹{finalPayable.toLocaleString('en-IN')} via {activePaymentChannel.toUpperCase()}</span>
                  </div>

                  {/* Staggered Verification Steps Ticker */}
                  <div className="rzp-proc-steps">
                    <div className={`rzp-step-row ${simTickerStep >= 1 ? (simTickerStep > 1 ? 'done' : 'active') : ''}`}>
                      <div className="rzp-step-badge">
                        {simTickerStep > 1 ? <Check size={12} /> : '1'}
                      </div>
                      <span>Connecting to Razorpay Banking Gateway</span>
                    </div>

                    <div className={`rzp-step-row ${simTickerStep >= 2 ? (simTickerStep > 2 ? 'done' : 'active') : ''}`}>
                      <div className="rzp-step-badge">
                        {simTickerStep > 2 ? <Check size={12} /> : '2'}
                      </div>
                      <span>Authorizing ₹{finalPayable.toLocaleString('en-IN')} for +91 {simPhone}</span>
                    </div>

                    <div className={`rzp-step-row ${simTickerStep >= 3 ? 'done' : ''}`}>
                      <div className="rzp-step-badge">
                        {simTickerStep >= 3 ? <Check size={12} /> : '3'}
                      </div>
                      <span>Verifying Cryptographic HMAC-SHA256 Signature</span>
                    </div>
                  </div>

                  <div className="rzp-proc-warning">
                    <ShieldCheck size={14} color="#0284c7" />
                    <span>256-Bit SSL Secured &bull; PCI-DSS Level 1 Compliant</span>
                  </div>
                </div>
              )}

              {/* STEP: PAYMENT SUCCESS (RAZORPAY CELEBRATION ANIMATION) */}
              {modalSimStep === 'success' && (
                <div className="rzp-success-screen">
                  {/* Green Ripple & Drawing SVG Checkmark */}
                  <div className="rzp-success-circle-wrap">
                    <div className="rzp-success-ripple"></div>
                    <div className="rzp-success-ripple delay"></div>
                    <div className="rzp-success-svg-box">
                      <svg viewBox="0 0 80 80" width="82" height="82">
                        <circle
                          className="rzp-check-circle-svg"
                          cx="40"
                          cy="40"
                          r="36"
                          fill="#10b981"
                          stroke="#059669"
                          strokeWidth="3"
                        />
                        <path
                          className="rzp-check-path-svg"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M24 41l11 11 22-22"
                        />
                      </svg>
                    </div>
                  </div>

                  <h3 className="rzp-success-title">
                    Payment Successful! 🎉
                  </h3>
                  <p className="rzp-success-subtitle">
                    ₹{finalPayable.toLocaleString('en-IN')} paid to Streia ShopKart
                  </p>

                  {/* Transaction Receipt Card */}
                  <div className="rzp-receipt-card">
                    <div className="rzp-receipt-row">
                      <span className="rzp-receipt-label">Payment ID:</span>
                      <span className="rzp-receipt-value" style={{ color: '#0284c7' }}>
                        {simSuccessData?.paymentId || 'pay_sim_success'}
                      </span>
                    </div>
                    {simSuccessData?.orderId && (
                      <div className="rzp-receipt-row">
                        <span className="rzp-receipt-label">Gateway Order ID:</span>
                        <span className="rzp-receipt-value">{simSuccessData.orderId}</span>
                      </div>
                    )}
                    <div className="rzp-receipt-row">
                      <span className="rzp-receipt-label">Method:</span>
                      <span className="rzp-receipt-value">{simSuccessData?.method || 'UPI'}</span>
                    </div>
                    <div className="rzp-receipt-row">
                      <span className="rzp-receipt-label">Signature Verification:</span>
                      <span className="rzp-receipt-value" style={{ color: '#059669' }}>
                        HMAC SHA-256 Validated ✓
                      </span>
                    </div>
                  </div>

                  {/* Redirecting Progress Bar */}
                  <div className="rzp-redirect-bar-box">
                    <div className="rzp-redirect-label-row">
                      <span>Loading Order Placed confirmation page...</span>
                      <span>Just a moment</span>
                    </div>
                    <div className="rzp-redirect-progress-bg">
                      <div className="rzp-redirect-progress-fill"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP: PAYMENT FAILED (DECLINE ANIMATION) */}
              {modalSimStep === 'failed' && (
                <div className="rzp-failure-screen">
                  <div className="rzp-failure-icon-wrap">
                    <svg viewBox="0 0 80 80" width="82" height="82">
                      <circle
                        className="rzp-cross-circle-svg"
                        cx="40"
                        cy="40"
                        r="36"
                        fill="#ef4444"
                        stroke="#dc2626"
                        strokeWidth="3"
                      />
                      <path
                        className="rzp-cross-path-svg"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="6"
                        strokeLinecap="round"
                        d="M26 26l28 28 M54 26l-28 28"
                      />
                    </svg>
                  </div>

                  <h3 className="rzp-fail-title">Payment Declined</h3>
                  <p className="rzp-fail-sub">
                    {failureReason || 'Simulated transaction decline by banking gateway.'}
                  </p>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Your cart items have been preserved. You can retry with the same or another payment channel.
                  </div>

                  <div className="rzp-fail-actions">
                    <button
                      type="button"
                      className="rzp-btn-retry"
                      onClick={() => setModalSimStep('select')}
                    >
                      <RefreshCw size={15} /> Try Again / Choose Method
                    </button>
                    <button
                      type="button"
                      className="rzp-btn-cancel"
                      onClick={() => setShowSimModal(false)}
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              )}

              {/* STEP: PAYMENT CHANNEL SELECTION (INITIAL SIMULATION VIEW) */}
              {modalSimStep === 'select' && (
                <>
                  {/* 1. Mobile Number for Authorization */}
                  <div className="rzp-mobile-card">
                    <div className="rzp-mobile-header">
                      <span>Mobile Number for Payment Authorization / OTP</span>
                      <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>
                        Required for Authorization
                      </span>
                    </div>

                    <div className="rzp-phone-input-row">
                      <div className="rzp-country-box">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        className="rzp-phone-input"
                        placeholder="Enter 10-digit mobile number"
                        value={simPhone}
                        onChange={(e) => {
                          setSimPhone(e.target.value);
                          if (simPhoneError) setSimPhoneError('');
                        }}
                        autoFocus
                      />
                    </div>
                    {simPhoneError && (
                      <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                        {simPhoneError}
                      </span>
                    )}

                    {/* Quick test numbers */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '0.65rem' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quick Test:</span>
                      {QUICK_TEST_PHONES.map((item) => (
                        <button
                          key={item.phone}
                          type="button"
                          onClick={() => {
                            setSimPhone(item.phone);
                            if (simPhoneError) setSimPhoneError('');
                          }}
                          style={{
                            border: simPhone === item.phone ? '1px solid #0284c7' : '1px solid var(--border-subtle)',
                            background: simPhone === item.phone ? 'rgba(2, 132, 199, 0.08)' : '#ffffff',
                            color: simPhone === item.phone ? '#0284c7' : 'var(--text-secondary)',
                            borderRadius: '6px',
                            padding: '2px 8px',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Payment Channel Navigation Tabs */}
                  <div className="rzp-channels-nav">
                    <button
                      type="button"
                      className={`rzp-nav-tab ${activePaymentChannel === 'upi' ? 'active' : ''}`}
                      onClick={() => setActivePaymentChannel('upi')}
                    >
                      <Smartphone size={16} />
                      <span>UPI</span>
                    </button>

                    <button
                      type="button"
                      className={`rzp-nav-tab ${activePaymentChannel === 'card' ? 'active' : ''}`}
                      onClick={() => setActivePaymentChannel('card')}
                    >
                      <CreditCard size={16} />
                      <span>Cards</span>
                    </button>

                    <button
                      type="button"
                      className={`rzp-nav-tab ${activePaymentChannel === 'netbanking' ? 'active' : ''}`}
                      onClick={() => setActivePaymentChannel('netbanking')}
                    >
                      <Landmark size={16} />
                      <span>Net Banking</span>
                    </button>

                    <button
                      type="button"
                      className={`rzp-nav-tab ${activePaymentChannel === 'wallet' ? 'active' : ''}`}
                      onClick={() => setActivePaymentChannel('wallet')}
                    >
                      <Wallet size={16} />
                      <span>Wallets</span>
                    </button>
                  </div>

                  {/* 3. Channel Panel Details */}
                  {/* Channel: UPI */}
                  {activePaymentChannel === 'upi' && (
                    <div className="rzp-channel-box">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Select UPI Application
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                          Instant Virtual Authorization
                        </span>
                      </div>

                      <div className="rzp-upi-grid">
                        {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map((app) => (
                          <button
                            key={app}
                            type="button"
                            className={`rzp-upi-app-btn ${selectedUpiApp === app ? 'active' : ''}`}
                            onClick={() => setSelectedUpiApp(app)}
                          >
                            <span style={{ fontSize: '1.1rem' }}>⚡</span>
                            <span>{app}</span>
                            {selectedUpiApp === app && <Check size={14} style={{ marginLeft: 'auto' }} />}
                          </button>
                        ))}
                      </div>

                      <div style={{ marginTop: '0.85rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        Linked UPI VPA: <strong style={{ color: 'var(--text-primary)' }}>{simPhone ? `${simPhone}@upi` : 'mobile@upi'}</strong>
                      </div>
                    </div>
                  )}

                  {/* Channel: Cards */}
                  {activePaymentChannel === 'card' && (
                    <div className="rzp-channel-box">
                      <div className="simulated-card-preview" style={{ marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <div className="simulated-card-chip" style={{ margin: 0 }}></div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.1em' }}>VISA</span>
                        </div>
                        <div className="simulated-card-number">4532 &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 8899</div>
                        <div className="simulated-card-footer">
                          <div>
                            <div className="simulated-card-label">CARDHOLDER</div>
                            <div className="simulated-card-val">{formData.fullName || 'AARAV SHARMA'}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div className="simulated-card-label">EXPIRES</div>
                            <div className="simulated-card-val">10/28</div>
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        🛡️ 3D Secure OTP verification will be simulated for +91 <strong>{simPhone || 'your mobile'}</strong>
                      </div>
                    </div>
                  )}

                  {/* Channel: Net Banking */}
                  {activePaymentChannel === 'netbanking' && (
                    <div className="rzp-channel-box">
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Select Retail Banking Gateway
                      </span>
                      <div className="rzp-bank-grid">
                        {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank', 'PNB'].map((bank) => (
                          <button
                            key={bank}
                            type="button"
                            className={`rzp-bank-btn ${selectedBank === bank ? 'active' : ''}`}
                            onClick={() => setSelectedBank(bank)}
                          >
                            {bank}
                          </button>
                        ))}
                      </div>
                      <div style={{ marginTop: '0.75rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        Connected customer phone: <strong style={{ color: 'var(--text-primary)' }}>+91 {simPhone || 'N/A'}</strong>
                      </div>
                    </div>
                  )}

                  {/* Channel: Wallets */}
                  {activePaymentChannel === 'wallet' && (
                    <div className="rzp-channel-box">
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Select Digital Wallet
                      </span>
                      <div className="rzp-upi-grid">
                        {['Paytm Wallet', 'Amazon Pay', 'PhonePe Wallet', 'Mobikwik'].map((wallet) => (
                          <button
                            key={wallet}
                            type="button"
                            className={`rzp-upi-app-btn ${selectedWallet === wallet ? 'active' : ''}`}
                            onClick={() => setSelectedWallet(wallet)}
                          >
                            <Wallet size={16} />
                            <span>{wallet}</span>
                            {selectedWallet === wallet && <Check size={14} style={{ marginLeft: 'auto' }} />}
                          </button>
                        ))}
                      </div>
                      <div style={{ marginTop: '0.75rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        Simulated balance for +91 <strong>{simPhone || 'your mobile'}</strong>: ₹15,000.00
                      </div>
                    </div>
                  )}

                  {/* 4. Action Buttons: Simulate Success vs Failure */}
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem', textAlign: 'center' }}>
                      Simulate Transaction Outcome for +91 {simPhone || 'Mobile'}
                    </div>

                    <div className="rzp-actions-row">
                      <button
                        type="button"
                        id="rzp-simulate-success-btn"
                        className="rzp-btn-simulate-pay"
                        onClick={() => executeSimulation(true)}
                        disabled={submitting}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle size={18} />
                          <span>Pay ₹{finalPayable.toLocaleString('en-IN')} (Success)</span>
                        </div>
                        <span style={{ fontSize: '0.68rem', opacity: 0.9, fontWeight: 500 }}>
                          HMAC-SHA256 Cryptographic Verification
                        </span>
                      </button>

                      <button
                        type="button"
                        id="rzp-simulate-fail-btn"
                        className="rzp-btn-simulate-fail"
                        onClick={() => {
                          if (!showFailureDetails) {
                            setShowFailureDetails(true);
                          } else {
                            executeSimulation(false, failureReason);
                          }
                        }}
                        disabled={submitting}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AlertCircle size={18} />
                          <span>Simulate Failure</span>
                        </div>
                        <span style={{ fontSize: '0.68rem', opacity: 0.9, fontWeight: 500 }}>
                          {showFailureDetails ? 'Trigger Bank Decline' : 'Choose Decline Reason'}
                        </span>
                      </button>
                    </div>

                    {/* Failure Reason Selector */}
                    {showFailureDetails && (
                      <div
                        style={{
                          marginTop: '0.85rem',
                          padding: '0.85rem',
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: '12px',
                          animation: 'rzpModalFadeIn 0.2s ease',
                        }}
                      >
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.4rem' }}>
                          Select Simulated Bank Decline Reason:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {SIMULATION_FAILURE_REASONS.map((reason) => (
                            <button
                              key={reason}
                              type="button"
                              style={{
                                textAlign: 'left',
                                padding: '0.45rem 0.65rem',
                                borderRadius: '6px',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                background: failureReason === reason ? '#dc2626' : '#ffffff',
                                color: failureReason === reason ? '#ffffff' : '#991b1b',
                                border: '1px solid #f87171',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                              onClick={() => setFailureReason(reason)}
                            >
                              <span>{reason}</span>
                              {failureReason === reason && <Check size={13} />}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => executeSimulation(false, failureReason)}
                          style={{
                            marginTop: '0.75rem',
                            width: '100%',
                            padding: '0.6rem',
                            background: '#dc2626',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                          }}
                        >
                          Trigger Payment Failure Now &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Checkout;
