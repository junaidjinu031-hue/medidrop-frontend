import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { orderService } from '../services/api';
import './OrderTracking.css';

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const phone = searchParams.get('phone') || '';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPhone, setSearchPhone] = useState(phone);

  useEffect(() => {
    if (phone) {
      fetchOrders(phone);
    }
  }, [phone]);

  const fetchOrders = async (phoneNumber) => {
    if (!phoneNumber) return;
    setLoading(true);
    try {
      const res = await orderService.getAll(phoneNumber);
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders(searchPhone);
  };

  const getStatusColor = (status) => {
    const colors = {
      PLACED: '#3b82f6',
      PREPARING: '#f59e0b',
      READY: '#10b981',
      COMPLETED: '#059669',
      CANCELLED: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusSteps = (status) => {
    const steps = [
      { key: 'PLACED', label: 'Order Placed' },
      { key: 'PREPARING', label: 'Preparing' },
      { key: 'READY', label: 'Ready' },
      { key: 'COMPLETED', label: 'Completed' },
    ];
    const statusIndex = steps.findIndex((s) => s.key === status);
    return steps.map((step, index) => ({
      ...step,
      completed: index <= statusIndex,
      current: index === statusIndex,
    }));
  };

  return (
    <div className="order-tracking">
      <h1 className="page-title">Track Your Order</h1>
      <p className="page-subtitle">Enter your phone number to track your orders</p>

      <form className="tracking-form" onSubmit={handleSearch}>
        <div className="form-group">
          <input
            type="tel"
            placeholder="Enter your phone number"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            className="form-input"
            required
          />
          <button type="submit" className="btn-search" disabled={loading}>
            {loading ? 'Searching...' : 'Track Order'}
          </button>
        </div>
      </form>

      {loading && orders.length === 0 && (
        <div className="loading">Loading orders...</div>
      )}

      {!loading && orders.length === 0 && searchPhone && (
        <div className="empty-state">
          <p>No orders found for this phone number</p>
        </div>
      )}

      {orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order) => {
            const steps = getStatusSteps(order.status);
            return (
              <div key={order.id} className="order-tracking-card">
                <div className="order-header">
                  <div>
                    <h3>Order #{order.id}</h3>
                    <p className="order-date">
                      Placed on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="status-timeline">
                  {steps.map((step, index) => (
                    <div key={step.key} className="timeline-step">
                      <div
                        className={`step-indicator ${step.completed ? 'completed' : ''
                          } ${step.current ? 'current' : ''}`}
                      >
                        {step.completed ? '✓' : index + 1}
                      </div>
                      <div className="step-label">{step.label}</div>
                      {index < steps.length - 1 && (
                        <div
                          className={`step-line ${step.completed ? 'completed' : ''}`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="order-info">
                  <div className="info-row">
                    <strong>Pharmacy:</strong>
                    <span>{order.pharmacy_detail?.name}</span>
                  </div>
                  <div className="info-row">
                    <strong>Delivery Type:</strong>
                    <span>{order.delivery_type}</span>
                  </div>
                  {order.delivery_address && (
                    <div className="info-row">
                      <strong>Address:</strong>
                      <span>{order.delivery_address}</span>
                    </div>
                  )}
                  {order.locker_detail && (
                    <div className="info-row">
                      <strong>Locker:</strong>
                      <span>#{order.locker_detail.slot_number}</span>
                      {order.locker_detail.otp_code && (
                        <span className="otp-code">OTP: {order.locker_detail.otp_code}</span>
                      )}
                    </div>
                  )}
                  <div className="info-row">
                    <strong>Total:</strong>
                    <span>₹{parseFloat(order.total_price).toFixed(2)}</span>
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="order-items">
                    <strong>Items:</strong>
                    <ul>
                      {order.items.map((item, index) => (
                        <li key={index}>
                          {item.medicine_detail?.name || item.medical_kit_detail?.name || 'Item'} x{item.quantity} - ₹
                          {parseFloat(item.line_total).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {order.can_be_cancelled && order.status === 'PLACED' && (
                  <div className="order-actions">
                    <button
                      className="btn-cancel-order"
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to cancel this order?')) {
                          try {
                            await orderService.cancel(order.id);
                            window.location.reload();
                          } catch (error) {
                            alert('Failed to cancel order');
                          }
                        }
                      }}
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
