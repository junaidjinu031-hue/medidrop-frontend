import React, { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import './DeliveryPanel.css';

const DeliveryPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const fetchAssignedOrders = async () => {
    try {
      const res = await orderService.getAll();
      // The backend should return orders where delivery_person=user because of their role
      // We also filter for active delivery statuses just to be safe
      const activeDeliveryStatuses = ['PREPARING', 'READY', 'OUT_FOR_DELIVERY'];
      const activeOrders = res.data.filter(
        (order) => activeDeliveryStatuses.includes(order.status)
      );
      setOrders(activeOrders);
    } catch (error) {
      console.error('Error fetching delivery orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (window.confirm(`Are you sure you want to mark this order as ${newStatus}?`)) {
      try {
        await orderService.updateStatus(orderId, newStatus);
        fetchAssignedOrders();
      } catch (error) {
        console.error('Error updating order status:', error);
        alert('Failed to update order status');
      }
    }
  };

  if (loading) return <div className="loading">Loading your deliveries...</div>;

  return (
    <div className="delivery-panel">
      <div className="page-header">
        <h1 className="page-title">Delivery Dashboard</h1>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <h2>No Active Deliveries</h2>
          <p>You currently have no orders assigned for delivery or all your orders are completed.</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => (
            <div key={order.id} className="order-card delivery-card">
              <div className="order-header">
                <h3>Order #{order.id}</h3>
                <span className={`status-badge ${order.status.toLowerCase()}`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="order-details">
                <p><strong>Customer:</strong> {order.customer_name}</p>
                <p><strong>Phone:</strong> {order.contact_phone}</p>
                <p><strong>Address:</strong> {order.delivery_address || 'Store Pickup / Locker'}</p>

                {order.notes && (
                  <div className="order-notes">
                    <strong>Notes:</strong> {order.notes}
                  </div>
                )}

                <p><strong>Items:</strong></p>
                <ul className="items-list">
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.medicine_detail?.name || item.medical_kit_detail?.name} x{item.quantity}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="delivery-actions">
                {order.status === 'READY' && (
                  <button
                    className="btn-primary"
                    onClick={() => handleStatusChange(order.id, 'OUT_FOR_DELIVERY')}
                  >
                    Start Delivery
                  </button>
                )}
                {order.status === 'OUT_FOR_DELIVERY' && (
                  <button
                    className="btn-success"
                    onClick={() => handleStatusChange(order.id, 'COMPLETED')}
                  >
                    Mark Delivered
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryPanel;
