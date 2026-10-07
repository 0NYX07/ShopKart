import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api, { getOrderById } from '../services/api';

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch individual order details on mount
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError('');

        // 1. Verify authenticated user identity
        await api.get('/customers/me');

        // 2. Fetch order by ID (backend query scopes strictly to authenticated user)
        const response = await getOrderById(id);

        if (response.data && response.data.success) {
          setOrder(response.data.order);
        } else {
          setError(response.data?.message || 'Order not found.');
        }
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
        } else if (err.response?.status === 404 || err.response?.status === 400) {
          setError('Order not found or you are not authorized to view it.');
        } else {
          setError(
            err.response?.data?.message ||
            'Failed to load order details. Please check your connection and try again.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, navigate]);

  return (
    <div>
      <Navbar />

      <div className="order-details-container">
        {/* Back Navigation Link */}
        <Link to="/orders" className="order-details-back-link">
          ← Back to My Orders
        </Link>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            Loading order details...
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="error-state-box">
            <h3>Unable to load order</h3>
            <p>{error}</p>
            <div style={{ marginTop: '15px' }}>
              <button
                onClick={() => navigate('/orders')}
                className="btn-checkout"
                style={{ width: 'auto', padding: '10px 24px' }}
              >
                Return to Orders
              </button>
            </div>
          </div>
        )}

        {/* Order Details View */}
        {!loading && !error && order && (
          <div className="order-details-card">
            {/* Header: Title, Date, Status */}
            <div className="order-details-header">
              <div className="order-details-title-group">
                <h2>Order Details</h2>
                <p>
                  Order ID: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{order._id}</span>
                </p>
                <p style={{ marginTop: '4px' }}>
                  Placed on:{' '}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'N/A'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="order-lifecycle-badge" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                  Order Status: {order.status || 'PLACED'}
                </span>
                <span
                  className={
                    order.paymentStatus === 'PAID'
                      ? 'order-badge-paid'
                      : order.paymentStatus === 'FAILED'
                      ? 'order-badge-failed'
                      : 'order-badge-pending'
                  }
                  style={{ fontSize: '0.9rem', padding: '6px 14px' }}
                >
                  Payment Status: {order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Items Section: Using historical snapshot prices & names */}
            <div className="order-details-section">
              <h3>Purchased Items ({order.items?.length || 0})</h3>
              <table className="order-details-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th style={{ textAlign: 'center' }}>Quantity</th>
                    <th style={{ textAlign: 'right' }}>Price (Snapshot)</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{item.name}</strong>
                      </td>
                      <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right' }}>₹{item.price}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        ₹{item.price * item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Summary Box */}
              <div className="order-details-total-box">
                <span className="order-details-total-label">Total Amount:</span>
                <span className="order-details-total-amount">₹{order.totalAmount}</span>
              </div>
            </div>

            {/* Delivery Information Section */}
            {order.shippingAddress && (
              <div className="order-details-section">
                <h3>Delivery Address</h3>
                <div className="order-address-box">
                  <p><strong>Recipient:</strong> {order.shippingAddress.fullName}</p>
                  <p><strong>Address:</strong> {order.shippingAddress.address}</p>
                  <p>
                    <strong>City / State / Pincode:</strong> {order.shippingAddress.city},{' '}
                    {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                  <p><strong>Contact Phone:</strong> {order.shippingAddress.phone}</p>
                </div>
              </div>
            )}

            {/* Payment Details Section */}
            {order.razorpayOrderId && (
              <div className="order-details-section" style={{ marginBottom: 0 }}>
                <h3>Payment Reference</h3>
                <div className="order-address-box" style={{ background: '#f8fafc' }}>
                  <p>
                    <strong>Razorpay Order ID:</strong>{' '}
                    <span style={{ fontFamily: 'monospace' }}>{order.razorpayOrderId}</span>
                  </p>
                  {order.razorpayPaymentId && (
                    <p style={{ marginTop: '8px' }}>
                      <strong>Razorpay Payment ID:</strong>{' '}
                      <span style={{ fontFamily: 'monospace' }}>{order.razorpayPaymentId}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderDetails;
