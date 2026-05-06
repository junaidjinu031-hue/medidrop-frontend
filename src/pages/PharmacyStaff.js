import React, { useState, useEffect } from 'react';
import { orderService, medicineService, prescriptionService, deliverySlotService, userService } from '../services/api';
import { prescriptionService as prescService } from '../services/prescriptions';
import { useAuth } from '../context/AuthContext';
import './PharmacyStaff.css';

const PharmacyStaff = () => {
  const [orders, setOrders] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const { isPharmacyStaff, isAdmin } = useAuth();

  useEffect(() => {
    if (isPharmacyStaff || isAdmin) {
      fetchData();
    }
  }, [isPharmacyStaff, isAdmin, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'orders') {
        const res = await orderService.getAll();
        setOrders(res.data.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED'));

        // Fetch delivery personnel
        try {
          const userRes = await userService.getAll('DELIVERY_PERSON');
          setDeliveryPersons(userRes.data);
        } catch (err) {
          console.error("Error fetching delivery persons:", err);
        }
      } else if (activeTab === 'medicines') {
        const res = await medicineService.getAll();
        setMedicines(res.data);
      } else if (activeTab === 'prescriptions') {
        const res = await prescService.getAll();
        setPrescriptions(res.data.filter(p => p.status === 'PENDING'));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      fetchData();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleAssignDelivery = async (orderId, deliveryPersonId) => {
    try {
      // This requires a backend endpoint change or partial update on the order
      await orderService.update(orderId, { delivery_person: deliveryPersonId });
      fetchData();
      alert("Assigned to delivery person!");
    } catch (error) {
      console.error("Error signing delivery", error);
      alert("Failed to assign delivery");
    }
  };

  const handlePrescriptionAction = async (id, action) => {
    try {
      if (action === 'approve') {
        await prescService.approve(id);
      } else {
        const notes = prompt('Enter rejection reason (optional):');
        await prescService.reject(id, notes || '');
      }
      fetchData();
    } catch (error) {
      console.error('Error processing prescription:', error);
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      price: parseFloat(formData.get('price')),
      stock: parseInt(formData.get('stock')),
      description: formData.get('description'),
      prescription_required: formData.get('prescription_required') === 'on',
    };
    try {
      await medicineService.create(data);
      e.target.reset();
      fetchData();
      alert('Medicine added successfully');
    } catch (error) {
      console.error('Error adding medicine:', error);
      const msg = error.response?.data?.detail || JSON.stringify(error.response?.data) || 'Failed to add medicine';
      alert(`Error: ${msg}`);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      label: formData.get('label'),
      window_start: formData.get('window_start'),
      window_end: formData.get('window_end'),
      capacity: formData.get('capacity'),
      slot_type: formData.get('slot_type'),
    };
    try {
      await deliverySlotService.create(data);
      e.target.reset();
      // fetchData(); // Need to fetch slots
      alert('Slot added successfully');
    } catch (error) {
      console.error('Error adding slot:', error);
    }
  };

  const handleStockUpdate = async (medicineId, newStock) => {
    try {
      // This would require a stock update endpoint
      // For now, just show an alert
      alert('Stock update feature - to be implemented with backend endpoint');
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  if (!isPharmacyStaff && !isAdmin) {
    return (
      <div className="pharmacy-staff-page">
        <div className="error-message">Access denied. Pharmacy Staff access required.</div>
      </div>
    );
  }

  return (
    <div className="pharmacy-staff-page">
      <h1 className="page-title">Pharmacy Staff Panel</h1>

      <div className="staff-tabs">
        <button
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button
          className={`tab-button ${activeTab === 'prescriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('prescriptions')}
        >
          Prescriptions
        </button>
        <button
          className={`tab-button ${activeTab === 'medicines' ? 'active' : ''}`}
          onClick={() => setActiveTab('medicines')}
        >
          Stock Management
        </button>
        <button
          className={`tab-button ${activeTab === 'slots' ? 'active' : ''}`}
          onClick={() => setActiveTab('slots')}
        >
          Delivery Slots
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {activeTab === 'orders' && (
            <div className="staff-content">
              <h2>Active Orders</h2>
              {orders.length === 0 ? (
                <div className="empty-state">No active orders</div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <h3>Order #{order.id}</h3>
                        <span className={`status-badge status-${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </div>
                      <p><strong>Customer:</strong> {order.customer_name}</p>
                      <p><strong>Items:</strong> {order.items?.length || 0}</p>
                      <p><strong>Total:</strong> ₹{parseFloat(order.total_price).toFixed(2)}</p>
                      <div className="order-actions">
                        {order.status === 'PLACED' && (
                          <button
                            className="btn-action"
                            onClick={() => handleStatusUpdate(order.id, 'PREPARING')}
                          >
                            Start Preparing
                          </button>
                        )}
                        {order.status === 'PREPARING' && (
                          <div className='assign-delivery-container'>
                            <button
                              className="btn-action"
                              onClick={() => handleStatusUpdate(order.id, 'READY')}
                            >
                              Mark as Ready
                            </button>
                            {/* Dropdown for delivery assignment */}
                            <div className="assign-delivery-row">
                              <select
                                id={`delivery-select-${order.id}`}
                                className="delivery-select"
                                defaultValue=""
                                style={{ padding: '5px', marginRight: '5px' }}
                              >
                                <option value="" disabled>Select Delivery Person</option>
                                {deliveryPersons.map(dp => {
                                  let statusText = '(Available)';
                                  if (dp.active_deliveries_count && dp.active_deliveries_count > 0) {
                                    statusText = `(Busy - ${dp.active_deliveries_count} orders)`;
                                  }
                                  return (
                                    <option key={dp.id} value={dp.id}>
                                      {dp.username} {statusText}
                                    </option>
                                  );
                                })}
                              </select>
                              <button className="btn-action" onClick={() => {
                                const val = document.getElementById(`delivery-select-${order.id}`).value;
                                if (val) handleAssignDelivery(order.id, val);
                              }}>Assign</button>
                            </div>
                          </div>
                        )}
                        {order.status === 'READY' && (
                          <div className="status-message">Waiting for pickup by: {order.delivery_person_detail ? order.delivery_person_detail.username : 'Not Assigned'}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="staff-content">
              <h2>Pending Prescriptions</h2>
              {prescriptions.length === 0 ? (
                <div className="empty-state">No pending prescriptions</div>
              ) : (
                <div className="prescriptions-list">
                  {prescriptions.map((prescription) => (
                    <div key={prescription.id} className="prescription-card">
                      <h3>Prescription #{prescription.id}</h3>
                      <p><strong>User:</strong> {prescription.user_detail?.username}</p>
                      {prescription.prescription_file && (
                        <a
                          href={prescription.prescription_file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="file-link"
                        >
                          View Prescription
                        </a>
                      )}
                      <div className="prescription-actions">
                        <button
                          className="btn-approve"
                          onClick={() => handlePrescriptionAction(prescription.id, 'approve')}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handlePrescriptionAction(prescription.id, 'reject')}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'medicines' && (
            <div className="staff-content">
              <h2>Stock Management</h2>
              <div className="add-form-section">
                <h3>Add New Medicine</h3>
                <form onSubmit={handleAddMedicine} className="staff-form">
                  <input name="name" placeholder="Medicine Name" required />
                  <input name="price" type="number" step="0.01" placeholder="Price" required />
                  <input name="stock" type="number" placeholder="Initial Stock" required />
                  <textarea name="description" placeholder="Description"></textarea>
                  <label>
                    <input name="prescription_required" type="checkbox" /> Prescription Required
                  </label>
                  <button type="submit" className="btn-primary">Add Medicine</button>
                </form>
              </div>
              <div className="medicines-list">
                {medicines.map((medicine) => (
                  <div key={medicine.id} className="medicine-card">
                    <h3>{medicine.name}</h3>
                    <p><strong>Current Stock:</strong> {medicine.stock}</p>
                    <p><strong>Price:</strong> ₹{parseFloat(medicine.price).toFixed(2)}</p>
                    {medicine.stock < 10 && (
                      <span className="low-stock-badge">Low Stock</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'slots' && (
            <div className="staff-content">
              <h2>Delivery Slots Management</h2>
              <div className="add-form-section">
                <h3>Add Delivery Slot</h3>
                <form onSubmit={handleAddSlot} className="staff-form">
                  <input name="label" placeholder="Label (e.g. Morning)" required />
                  <input name="window_start" type="time" required />
                  <input name="window_end" type="time" required />
                  <input name="capacity" type="number" placeholder="Capacity" defaultValue={5} />
                  <select name="slot_type">
                    <option value="HOME">Home Delivery</option>
                    <option value="PICKUP">Store Pickup</option>
                  </select>
                  <button type="submit" className="btn-primary">Add Slot</button>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PharmacyStaff;
