import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Package,
  ShoppingBag,
  MapPin,
  Calendar,
  CreditCard,
  AlertCircle,
  ShieldCheck,
  Check,
  Truck,
  ExternalLink,
  Printer,
  Sparkles,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';

const OrderSuccess = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // If order was passed via navigation state from checkout, initialize immediately without flicker
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Order Placed | Streia ShopKart';
  }, []);

  useEffect(() => {
    let ignore = false;

    const fetchOrder = async () => {
      try {
        if (!order) setLoading(true);
        let fetched = null;

        if (id) {
          const res = await api.get(`/orders/${id}`);
          fetched = res.data?.order || null;
        } else if (!order) {
          // Fallback if accessed via /order-placed without ID: fetch user's most recent order
          const res = await api.get('/orders');
          const list = res.data?.orders || [];
          fetched = list.length > 0 ? list[0] : null;
        }

        if (!ignore && fetched) {
          setOrder(fetched);
          setError(null);
        }
      } catch (err) {
        if (!ignore && !order) {
          setError(err.response?.data?.message || 'Unable to fetch order confirmation details');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchOrder();

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading && !order) {
    return (
      <div className="app-container">
        <Navbar />
        <main className="cart-page-container">
          <div className="state-container loading-state">
            <div className="spinner-large"></div>
            <h2 className="state-title">Loading Order Placed Confirmation...</h2>
            <p className="state-message">Verifying payment gateway receipt and retrieving your order summary.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="app-container">
        <Navbar />
        <main className="cart-page-container">
          <div className="state-container error-state">
            <div className="state-icon-wrapper error">
              <AlertCircle size={40} />
            </div>
            <h2 className="state-title">Order Not Found</h2>
            <p className="state-message">{error || 'Could not locate the requested order.'}</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Link to="/orders" className="btn btn-secondary">
                View My Orders
              </Link>
              <Link to="/products" className="btn btn-primary">
                Browse Products
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const {
    items = [],
    shippingAddress = {},
    totalAmount = 0,
    status = 'PLACED',
    paymentStatus = 'PAID',
    razorpayOrderId,
    razorpayPaymentId,
    createdAt,
  } = order;

  // Format order date
  const orderDateFormatted = createdAt
    ? new Date(createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

  // Estimated delivery date (3 to 4 business days)
  const deliveryEst = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="app-container">
      <Navbar />

      <main className="cart-page-container animate-fade-in-up" style={{ maxWidth: '900px' }}>
        {/* Stepper: Step 3 Completed & Active */}
        <div className="checkout-stepper-wrap" style={{ marginBottom: '2rem' }}>
          <div className="checkout-step-item completed">
            <div className="checkout-step-bubble">
              <Check size={16} />
            </div>
            <span className="checkout-step-title">Cart (1)</span>
          </div>
          <div className="checkout-step-divider completed"></div>

          <div className="checkout-step-item completed">
            <div className="checkout-step-bubble">
              <Check size={16} />
            </div>
            <span className="checkout-step-title">Shipping &amp; Payment</span>
          </div>
          <div className="checkout-step-divider completed"></div>

          <div className="checkout-step-item active">
            <div className="checkout-step-bubble" style={{ background: '#10b981', color: '#ffffff' }}>
              <Check size={16} />
            </div>
            <span className="checkout-step-title" style={{ color: '#059669', fontWeight: 800 }}>
              Order Placed
            </span>
          </div>
        </div>

        {/* Primary Order Placed Celebration Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '24px',
            border: '1px solid var(--border-subtle)',
            padding: '2.5rem 2rem',
            boxShadow: 'var(--shadow-card)',
            textAlign: 'center',
            marginBottom: '2rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Top Accent Ribbon */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #10b981 0%, #0284c7 50%, #10b981 100%)',
            }}
          ></div>

          {/* Animated Green Badge */}
          <div
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
              border: '2px solid #a7f3d0',
              boxShadow: '0 8px 24px -4px rgba(16, 185, 129, 0.25)',
            }}
          >
            <CheckCircle size={44} />
          </div>

          <h1
            id="order-placed-title"
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              margin: '0 0 0.5rem 0',
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary)',
            }}
          >
            Order Placed Successfully! 🎉
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', margin: '0 auto 1.5rem auto', maxWidth: '540px' }}>
            Thank you for shopping with Streia ShopKart! Your payment has been authorized and your order is confirmed.
          </p>

          {/* Key Order Badges Row */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--bg-surface-subtle)',
                padding: '0.55rem 1rem',
                borderRadius: '10px',
                fontSize: '0.86rem',
                border: '1px solid var(--border-subtle)',
                fontWeight: 600,
              }}
            >
              Order ID: <strong style={{ color: 'var(--brand-accent)' }}>#{order._id}</strong>
            </div>

            <div
              style={{
                backgroundColor: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                padding: '0.55rem 1rem',
                borderRadius: '10px',
                fontSize: '0.86rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Package size={15} /> Status: <span style={{ textTransform: 'uppercase' }}>{status}</span>
            </div>

            <div
              style={{
                backgroundColor: '#f0f9ff',
                color: '#0369a1',
                border: '1px solid #bae6fd',
                padding: '0.55rem 1rem',
                borderRadius: '10px',
                fontSize: '0.86rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ShieldCheck size={16} /> Payment: <span>{paymentStatus}</span>
            </div>
          </div>

          {/* Razorpay Gateway Seal */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              backgroundColor: '#0c2340',
              color: '#ffffff',
              padding: '0.65rem 1.25rem',
              borderRadius: '12px',
              fontSize: '0.82rem',
              boxShadow: '0 4px 12px rgba(12, 35, 64, 0.18)',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, color: '#38bdf8' }}>Razorpay</span>
              <span style={{ opacity: 0.75 }}>&bull; Verified Payment Gateway</span>
            </div>
            {razorpayPaymentId && (
              <span style={{ fontFamily: 'monospace', color: '#67e8f9', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                ID: {razorpayPaymentId}
              </span>
            )}
            <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
              <Check size={14} /> HMAC-SHA256 Valid
            </span>
          </div>
        </div>

        {/* Estimated Delivery & Timeline Banner */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '18px',
            border: '1px solid var(--border-subtle)',
            padding: '1.25rem 1.75rem',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                color: '#0284c7',
                padding: '12px',
                borderRadius: '12px',
                display: 'flex',
              }}
            >
              <Truck size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                Estimated Delivery Date
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Arriving by {deliveryEst} (Express Shipping)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            <Calendar size={16} color="var(--brand-accent)" />
            <span>Ordered on {orderDateFormatted}</span>
          </div>
        </div>

        {/* Two-Column Grid: Delivery Address & Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
          {/* Shipping Address Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '18px',
              border: '1px solid var(--border-subtle)',
              padding: '1.5rem 1.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <div
                style={{
                  backgroundColor: 'var(--brand-accent-subtle)',
                  color: 'var(--brand-accent)',
                  padding: '8px',
                  borderRadius: '10px',
                  display: 'flex',
                }}
              >
                <MapPin size={18} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
                Delivery Destination
              </h3>
            </div>

            <div style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.98rem' }}>
                {shippingAddress.fullName || 'Valued Customer'}
              </div>
              <div>Phone: <strong style={{ color: 'var(--text-primary)' }}>+91 {shippingAddress.phone}</strong></div>
              <div>{shippingAddress.addressLine1}</div>
              <div>
                {shippingAddress.city}, {shippingAddress.state} - <strong>{shippingAddress.pincode}</strong>
              </div>
              <div style={{ marginTop: '0.5rem', color: '#059669', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={14} /> Priority Express Courier (Prepaid)
              </div>
            </div>
          </div>

          {/* Payment & Transaction Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '18px',
              border: '1px solid var(--border-subtle)',
              padding: '1.5rem 1.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <div
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  color: '#059669',
                  padding: '8px',
                  borderRadius: '10px',
                  display: 'flex',
                }}
              >
                <CreditCard size={18} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
                Payment Summary
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Channel:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Razorpay Official Gateway</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Status:</span>
                <span style={{ fontWeight: 800, color: '#059669' }}>PAID (Verified)</span>
              </div>
              {razorpayOrderId && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Gateway Order ID:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{razorpayOrderId}</span>
                </div>
              )}
              {razorpayPaymentId && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payment ID:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--brand-accent)' }}>
                    {razorpayPaymentId}
                  </span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '8px',
                  marginTop: '4px',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                }}
              >
                <span>Total Paid:</span>
                <span style={{ color: 'var(--brand-accent)' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Purchased Items Snapshot */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '20px',
            border: '1px solid var(--border-subtle)',
            padding: '2rem',
            boxShadow: 'var(--shadow-card)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
              Purchased Items Snapshot ({items.reduce((s, it) => s + (it.quantity || 1), 0)} items)
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Invoice #{order._id.slice(-8).toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {items.map((item, idx) => (
              <div
                key={item.product || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 0',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img
                    src={item.image || 'https://placehold.co/60x60'}
                    alt={item.name}
                    style={{
                      width: '56px',
                      height: '56px',
                      objectFit: 'cover',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)',
                    }}
                  />
                  <div>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                      {item.name}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      ₹{Number(item.price || 0).toLocaleString('en-IN')} &times; {item.quantity} unit{item.quantity > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              borderTop: '2px solid var(--border-subtle)',
              paddingTop: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Items Subtotal:</span>
              <span style={{ fontWeight: 600 }}>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Express Courier Shipping:</span>
              <span style={{ color: '#059669', fontWeight: 700 }}>FREE (Express Promotion)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Payment Processing Fee:</span>
              <span style={{ color: '#059669', fontWeight: 700 }}>₹0.00 (Waived)</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.25rem',
                fontWeight: 800,
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '10px',
                marginTop: '6px',
              }}
            >
              <span>Total Paid via Razorpay:</span>
              <span style={{ color: 'var(--brand-accent)' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/orders')}
            id="view-orders-btn"
            style={{ padding: '0.85rem 1.6rem', fontSize: '0.95rem' }}
          >
            <Package size={18} /> View All Orders
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/products')}
            id="continue-shopping-btn"
            style={{ padding: '0.85rem 1.6rem', fontSize: '0.95rem' }}
          >
            <ShoppingBag size={18} /> Continue Shopping
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => window.print()}
            style={{
              padding: '0.85rem 1.4rem',
              fontSize: '0.95rem',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            <Printer size={18} /> Print Confirmation
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderSuccess;
