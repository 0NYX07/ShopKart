import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  ArrowRight,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  RefreshCw,
  MapPin,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';

const statusSteps = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/orders');
      setOrders(res.data?.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /**
   * Bonus Challenge (+10 marks): Advance order status progression
   */
  const handleAdvanceStatus = async (orderId, currentStatus) => {
    const currentIndex = statusSteps.indexOf(currentStatus);
    const nextStatus =
      currentIndex >= 0 && currentIndex < statusSteps.length - 1
        ? statusSteps[currentIndex + 1]
        : statusSteps[0]; // cycle back if delivered

    try {
      setUpdatingId(orderId);
      const res = await api.patch(`/orders/${orderId}/status`, { status: nextStatus });
      if (res.data?.success) {
        setOrders((prev) =>
          prev.map((ord) => (ord._id === orderId ? { ...ord, status: nextStatus } : ord))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' };
      case 'SHIPPED':
        return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
      case 'CONFIRMED':
        return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
      case 'PLACED':
      default:
        return { bg: '#fff1f2', text: '#be123c', border: '#fecdd3' };
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <main className="cart-page-container">
          <div className="state-container loading-state">
            <div className="spinner-large"></div>
            <h2 className="state-title">Loading your orders...</h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="app-container">
        <Navbar />
        <main className="cart-page-container">
          <div className="state-container error-state">
            <div className="state-icon-wrapper error">
              <AlertCircle size={40} />
            </div>
            <h2 className="state-title">Unable to load orders</h2>
            <p className="state-message">{error}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={fetchOrders}
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

  if (!orders || orders.length === 0) {
    return (
      <div className="app-container">
        <Navbar />
        <main className="cart-page-container">
          <div className="cart-empty-card animate-fade-in-up">
            <div className="cart-empty-icon-wrap">
              <Package size={54} strokeWidth={1.5} />
            </div>
            <h2 className="cart-empty-title">You have not placed any orders yet 📦</h2>
            <p className="cart-empty-subtitle">
              Once you complete checkout with Razorpay, your purchased orders and tracking updates will appear right here.
            </p>
            <div className="cart-empty-actions">
              <Link to="/products" className="btn btn-primary">
                <ShoppingBag size={18} /> Start Shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />

      <main className="cart-page-container animate-fade-in-up" style={{ maxWidth: '950px' }}>
        {/* Header Navigation */}
        <div className="cart-header-nav">
          <div className="breadcrumb-trail">
            <Link to="/home">Home</Link>
            <span>/</span>
            <span className="breadcrumb-current">My Orders</span>
          </div>
        </div>

        {/* Page Title */}
        <div className="cart-page-header">
          <div className="cart-title-group">
            <h1 className="cart-page-title">My Orders</h1>
            <span className="cart-items-count-badge">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
            </span>
          </div>
          <Link to="/products" className="cart-continue-link">
            <ShoppingBag size={16} /> Browse More Products
          </Link>
        </div>

        {/* Orders List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
          {orders.map((order) => {
            const badgeStyle = getStatusColor(order.status);
            const formattedDate = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recent Order';

            return (
              <div
                key={order._id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: '16px',
                  border: '1px solid var(--border-subtle)',
                  padding: '1.75rem',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                {/* Order Top Meta */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    borderBottom: '1px solid var(--border-subtle)',
                    paddingBottom: '1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order ID:</span>{' '}
                    <strong style={{ fontSize: '0.95rem' }}>#{order._id}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Placed on {formattedDate}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        backgroundColor: badgeStyle.bg,
                        color: badgeStyle.text,
                        border: `1px solid ${badgeStyle.border}`,
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {order.status}
                    </span>

                    <span
                      style={{
                        backgroundColor: 'var(--status-success-bg)',
                        color: 'var(--status-success-text)',
                        border: '1px solid var(--status-success-border)',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {order.paymentStatus || 'PAID'}
                    </span>
                  </div>
                </div>

                {/* Status Stepper Progression (Bonus Challenge) */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface-subtle)',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {statusSteps.map((step, idx) => {
                      const isReached = statusSteps.indexOf(order.status) >= idx;
                      return (
                        <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: isReached ? 700 : 500,
                              color: isReached ? 'var(--brand-accent)' : 'var(--text-muted)',
                            }}
                          >
                            {step}
                          </span>
                          {idx < statusSteps.length - 1 && (
                            <ChevronRight size={14} color="var(--border-medium)" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Bonus Action: Status Simulation Toggle */}
                  <button
                    type="button"
                    onClick={() => handleAdvanceStatus(order._id, order.status)}
                    disabled={updatingId === order._id}
                    className="btn btn-secondary"
                    style={{
                      fontSize: '0.75rem',
                      padding: '4px 10px',
                      borderRadius: '6px',
                    }}
                    title="Advance order lifecycle status (Bonus Feature)"
                  >
                    <TrendingUp size={12} />
                    {updatingId === order._id ? 'Updating...' : 'Advance Status (Bonus)'}
                  </button>
                </div>

                {/* Items in this Order */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
                  {order.items?.map((item, idx) => (
                    <div
                      key={item.product || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={item.image || 'https://placehold.co/50x50'}
                          alt={item.name}
                          style={{
                            width: '44px',
                            height: '44px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid var(--border-subtle)',
                          }}
                        />
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            ₹{item.price?.toLocaleString('en-IN')} × {item.quantity}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Order Card Summary */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <MapPin size={16} />
                    <span>
                      Deliver to: <strong>{order.shippingAddress?.fullName}</strong> ({order.shippingAddress?.city})
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Amount:</span>{' '}
                      <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                        ₹{order.totalAmount?.toLocaleString('en-IN')}
                      </strong>
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate(`/order-success/${order._id}`)}
                      style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Orders;
