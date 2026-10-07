import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api, { getMyOrders } from '../services/api';

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch orders belonging to the authenticated customer
  const fetchOrders = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Verify authenticated user identity
      await api.get('/customers/me');

      // 2. Fetch orders from GET /orders
      const response = await getMyOrders();
      if (response.data && response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        setError(response.data?.message || 'Failed to load orders.');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(
          err.response?.data?.message ||
          'Server error while fetching your orders. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div>
      <Navbar />

      <div className="orders-container">
        <div className="orders-header">
          <h2>My Orders 📦</h2>
          <p>View and track your previous purchase history</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            Loading your orders...
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="error-state-box">
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button onClick={fetchOrders} className="btn-retry">
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="empty-cart-box">
            <div className="empty-cart-icon">📦</div>
            <h2>No orders yet</h2>
            <p>You haven't placed any orders yet. Discover our collection and start shopping today!</p>
            <button
              onClick={() => navigate('/products')}
              className="btn-checkout"
              style={{ width: 'auto', padding: '12px 28px' }}
            >
              Browse Products
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => {
              const formattedDate = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'N/A';

              const statusBadgeClass =
                order.paymentStatus === 'paid'
                  ? 'order-badge-paid'
                  : order.paymentStatus === 'failed'
                  ? 'order-badge-failed'
                  : 'order-badge-pending';

              return (
                <div key={order._id} className="order-history-card">
                  {/* Card Header */}
                  <div className="order-history-card-header">
                    <div className="order-history-header-meta">
                      <div className="order-meta-item">
                        <span className="order-meta-label">Order Placed</span>
                        <span className="order-meta-val">{formattedDate}</span>
                      </div>
                      <div className="order-meta-item">
                        <span className="order-meta-label">Total Amount</span>
                        <span className="order-meta-val">₹{order.totalAmount}</span>
                      </div>
                      <div className="order-meta-item">
                        <span className="order-meta-label">Order ID</span>
                        <span className="order-meta-val" style={{ fontFamily: 'monospace' }}>
                          #{order._id}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className={statusBadgeClass}>
                        {order.paymentStatus}
                      </span>
                      <Link to={`/orders/${order._id}`} className="btn-view-details">
                        View Details →
                      </Link>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="order-history-body">
                    {/* Items List */}
                    <div className="order-history-items-list">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="order-history-item-row">
                          <div>
                            <div className="order-history-item-name">{item.name}</div>
                            <div className="order-history-item-qty">
                              Qty: {item.quantity} × ₹{item.price}
                            </div>
                          </div>
                          <div className="order-history-item-total">
                            ₹{item.price * item.quantity}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address Summary */}
                    {order.shippingAddress && (
                      <div className="order-shipping-summary">
                        <strong>Shipping to:</strong>{' '}
                        {order.shippingAddress.fullName} • {order.shippingAddress.address},{' '}
                        {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                        {order.shippingAddress.pincode} (📞 {order.shippingAddress.phone})
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
