import React, { useState, useEffect } from 'react';
import { orderService, medicineService, pharmacyService, userService } from '../services/api';
import { prescriptionService as prescService } from '../services/prescriptions';
import './AdminPanel.css';

const AdminPanel = () => {
  const [orders, setOrders] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [users, setUsers] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);

  // Specific view states
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);

  useEffect(() => {
    fetchMainData();
  }, []);

  const fetchMainData = async () => {
    setLoading(true);
    try {
      const pharmRes = await pharmacyService.getAll();
      setPharmacies(pharmRes.data);
      if (pharmRes.data.length > 0) setSelectedPharmacy(pharmRes.data[0].id);

      fetchTabSpecificData('orders', pharmRes.data[0]?.id);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTabSpecificData = async (tab, defaultPharmId = selectedPharmacy) => {
    try {
      if (tab === 'orders') {
        const res = await orderService.getAll();
        setOrders(res.data);
      } else if (tab === 'medicines') {
        if (defaultPharmId) {
          const res = await medicineService.getAll(defaultPharmId);
          setMedicines(res.data);
        }
      } else if (tab === 'pharmacies') {
        const res = await pharmacyService.getAll();
        setPharmacies(res.data);
      } else if (tab === 'users') {
        const res = await userService.getAll();
        setUsers(res.data);
      } else if (tab === 'prescriptions') {
        const res = await prescService.getAll();
        setPrescriptions(res.data);
      }
    } catch (error) {
      console.error(`Error fetching data for ${tab}:`, error);
    }
  };

  useEffect(() => {
    fetchTabSpecificData(activeTab);
  }, [activeTab, selectedPharmacy]);

  /* ================= ORDERS ================= */
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      fetchTabSpecificData('orders');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PLACED: '#3b82f6', PREPARING: '#f59e0b', READY: '#10b981',
      OUT_FOR_DELIVERY: '#8b5cf6', COMPLETED: '#059669', CANCELLED: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  /* ================= USERS ================= */
  const handleUserAdd = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (data.password !== data.password_confirm) { return alert("Passwords don't match!"); }
    if (!data.pharmacy) { delete data.pharmacy; }

    try {
      await userService.create({
        username: data.username, email: data.email,
        password: data.password, password2: data.password_confirm,
        role: data.role, phone: data.phone,
        pharmacy: data.pharmacy || null,
        is_active: true
      });
      e.target.reset();
      fetchTabSpecificData('users');
      alert('User created successfully');
    } catch (err) { alert('Failed to create user. Check constraints.'); }
  };

  const handleUserRoleChange = async (userId, newRole) => {
    try {
      await userService.update(userId, { role: newRole });
      fetchTabSpecificData('users');
    } catch (err) { alert('Failed to change role'); }
  };

  const handleUserToggleActive = async (userId, isActive) => {
    try {
      await userService.update(userId, { is_active: !isActive });
      fetchTabSpecificData('users');
    } catch (err) { alert('Failed to update status'); }
  };

  const handleUserDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      await userService.delete(userId);
      fetchTabSpecificData('users');
    } catch (err) { alert('Failed to delete user'); }
  };

  /* ================= PHARMACIES ================= */
  const handlePharmacyAdd = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    data.has_pickup_locker = data.has_pickup_locker === 'on';
    try {
      await pharmacyService.create(data);
      e.target.reset();
      fetchTabSpecificData('pharmacies');
      alert('Pharmacy created successfully');
    } catch (err) { alert('Failed to create pharmacy'); }
  };

  const handlePharmacyDelete = async (id) => {
    if (!window.confirm("Delete this pharmacy permanently?")) return;
    try {
      await pharmacyService.delete(id);
      fetchTabSpecificData('pharmacies');
    } catch (err) { alert('Failed to delete pharmacy'); }
  };

  const handlePharmacyEdit = async (id) => {
    const newName = window.prompt("Enter new Pharmacy Name:");
    if (!newName) return;
    try {
      await pharmacyService.update(id, { name: newName });
      fetchTabSpecificData('pharmacies');
    } catch (err) { alert('Failed to update name'); }
  };

  /* ================= MEDICINES ================= */
  const handleMedicineAdd = async (e) => {
    e.preventDefault();
    if (!selectedPharmacy) return alert("Select a pharmacy first");
    const data = Object.fromEntries(new FormData(e.target).entries());
    try {
      await medicineService.create({
        ...data,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        prescription_required: data.prescription_required === 'on',
        pharmacy: selectedPharmacy
      });
      e.target.reset();
      fetchTabSpecificData('medicines');
      alert('Medicine added');
    } catch (err) { alert('Failed to add medicine'); }
  };

  const handleMedicineDelete = async (id) => {
    if (!window.confirm("Delete this medicine permanently?")) return;
    try {
      await medicineService.delete(id);
      fetchTabSpecificData('medicines');
    } catch (err) { alert('Failed to delete medicine'); }
  };

  const handleMedicineEditStock = async (id) => {
    const stock = window.prompt("Set new exact stock value:");
    if (!stock) return;
    try {
      await medicineService.update(id, { stock: parseInt(stock) });
      fetchTabSpecificData('medicines');
    } catch (err) { alert('Failed to update stock'); }
  };

  /* ================= PRESCRIPTIONS ================= */
  const handlePrescriptionAction = async (id, action) => {
    try {
      if (action === 'approve') await prescService.approve(id);
      else {
        const reason = window.prompt("Rejection reason:");
        await prescService.reject(id, reason || '');
      }
      fetchTabSpecificData('prescriptions');
    } catch (err) { alert(`Failed to ${action} prescription`); }
  };

  if (loading) return <div className="loading">Loading admin panel...</div>;

  return (
    <div className="admin-panel">
      <h1 className="page-title">Super Admin Dashboard</h1>

      <div className="admin-tabs">
        {['users', 'pharmacies', 'medicines', 'orders', 'prescriptions'].map(tab => (
          <button key={tab} className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* --- USERS TAB --- */}
      {activeTab === 'users' && (
        <div className="admin-content">
          <h2 className="section-title">Manage Users</h2>

          <div className="admin-form-card">
            <h3>Add New User</h3>
            <form onSubmit={handleUserAdd} className="admin-form">
              <input name="username" placeholder="Username" required />
              <input name="email" type="email" placeholder="Email" required />
              <input name="password" type="password" placeholder="Password" required />
              <input name="password_confirm" type="password" placeholder="Confirm Password" required />
              <input name="phone" placeholder="Phone Number" />
              <select name="role">
                <option value="CUSTOMER">Customer</option>
                <option value="PHARMACY_STAFF">Pharmacy Staff</option>
                <option value="DELIVERY_PERSON">Delivery Person</option>
                <option value="ADMIN">Admin</option>
              </select>
              <select name="pharmacy">
                <option value="">No Pharmacy (Global)</option>
                {pharmacies.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button type="submit" className="btn-primary">Create User</button>
            </form>
          </div>

          <table className="admin-table">
            <thead>
              <tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    <select value={u.role} onChange={(e) => handleUserRoleChange(u.id, e.target.value)}>
                      <option value="CUSTOMER">Customer</option>
                      <option value="PHARMACY_STAFF">Pharmacy Staff</option>
                      <option value="DELIVERY_PERSON">Delivery Person</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td>
                    <span className={`status-badge ${u.is_active ? 'active-user' : 'blocked-user'}`}>
                      {u.is_active ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-action toggle-btn" onClick={() => handleUserToggleActive(u.id, u.is_active)}>
                      {u.is_active ? 'Block' : 'Unblock'}
                    </button>
                    <button className="btn-action delete-btn" onClick={() => handleUserDelete(u.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- PHARMACIES TAB --- */}
      {activeTab === 'pharmacies' && (
        <div className="admin-content">
          <h2 className="section-title">Manage Pharmacies</h2>

          <div className="admin-form-card">
            <h3>Add New Pharmacy</h3>
            <form onSubmit={handlePharmacyAdd} className="admin-form flex-wrap">
              <input name="name" placeholder="Pharmacy Name" required />
              <input name="city" placeholder="City" required />
              <input name="contact_phone" placeholder="Phone" required />
              <input name="contact_email" type="email" placeholder="Email" required />
              <textarea name="address" placeholder="Full Address" required />
              <label><input name="has_pickup_locker" type="checkbox" /> Has Lockers</label>
              <button type="submit" className="btn-primary">Add Pharmacy</button>
            </form>
          </div>

          <div className="pharmacies-grid">
            {pharmacies.map((pharmacy) => (
              <div key={pharmacy.id} className="admin-card row-card">
                <div className="card-info">
                  <h3>{pharmacy.name} {pharmacy.has_pickup_locker && '🔒'}</h3>
                  <p>{pharmacy.city} • {pharmacy.contact_phone} • {pharmacy.contact_email}</p>
                </div>
                <div className="card-actions">
                  <button className="btn-action edit-btn" onClick={() => handlePharmacyEdit(pharmacy.id)}>Edit Name</button>
                  <button className="btn-action delete-btn" onClick={() => handlePharmacyDelete(pharmacy.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MEDICINES TAB --- */}
      {activeTab === 'medicines' && (
        <div className="admin-content">
          <h2 className="section-title">Manage Medicines</h2>
          <div className="pharmacy-selector">
            <label>Context Pharmacy:</label>
            <select value={selectedPharmacy || ''} onChange={(e) => setSelectedPharmacy(parseInt(e.target.value))} className="select-input">
              {pharmacies.map((p) => <option key={p.id} value={p.id}>{p.name} - {p.city}</option>)}
            </select>
          </div>

          <div className="admin-form-card">
            <h3>Add Medicine to Selected Pharmacy</h3>
            <form onSubmit={handleMedicineAdd} className="admin-form">
              <input name="name" placeholder="Medicine Name" required />
              <input name="price" type="number" step="0.01" placeholder="Price (₹)" required />
              <input name="stock" type="number" placeholder="Initial Stock" required />
              <textarea name="description" placeholder="Description"></textarea>
              <label><input name="prescription_required" type="checkbox" /> Rx Required</label>
              <button type="submit" className="btn-primary">Publish Medicine</button>
            </form>
          </div>

          <div className="medicines-grid">
            {medicines.map((med) => (
              <div key={med.id} className="admin-card row-card">
                <div className="card-info">
                  <h3>{med.name} {med.prescription_required && <span className="rx-badge">Rx</span>}</h3>
                  <p>Price: ₹{parseFloat(med.price).toFixed(2)} | Stock: <b className={med.stock <= 0 ? 'text-red' : ''}>{med.stock}</b></p>
                </div>
                <div className="card-actions">
                  <button className="btn-action edit-btn" onClick={() => handleMedicineEditStock(med.id)}>Edit Stock</button>
                  <button className="btn-action delete-btn" onClick={() => handleMedicineDelete(med.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- ORDERS TAB --- */}
      {activeTab === 'orders' && (
        <div className="admin-content">
          <h2 className="section-title">Order Dashboard & Analytics</h2>
          <div className="orders-grid">
            {orders.map((order) => (
              <div key={order.id} className="admin-card order-card">
                <div className="order-header">
                  <h3>Order #{order.id}</h3>
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>{order.status}</span>
                </div>
                <div className="order-details">
                  <p><b>User:</b> {order.customer_name} ({order.contact_phone})</p>
                  <p><b>Type:</b> {order.delivery_type} | <b>Total:</b> ₹{parseFloat(order.total_price).toFixed(2)}</p>
                  <p><b>Notes:</b> {order.notes || 'None'}</p>
                </div>
                <div className="order-actions">
                  <select
                    value={order.status}
                    onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="PLACED">Placed</option>
                    <option value="PREPARING">Preparing</option>
                    <option value="READY">Ready / Awaiting Pickup</option>
                    <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- PRESCRIPTIONS TAB --- */}
      {activeTab === 'prescriptions' && (
        <div className="admin-content">
          <h2 className="section-title">Prescription Verification queue</h2>
          <div className="prescriptions-grid">
            {prescriptions.filter(p => p.status === 'PENDING').length === 0 && <p className="empty-state">Queue is empty</p>}
            {prescriptions.filter(p => p.status === 'PENDING').map(p => (
              <div key={p.id} className="admin-card row-card">
                <div className="card-info">
                  <h3>Rx #{p.id} - {p.user_detail?.username}</h3>
                  <a href={p.prescription_file} target="_blank" rel="noopener noreferrer" className="link-rx">View Uploaded Image 👁️</a>
                </div>
                <div className="card-actions">
                  <button className="btn-action edit-btn" onClick={() => handlePrescriptionAction(p.id, 'approve')}>Approve</button>
                  <button className="btn-action delete-btn" onClick={() => handlePrescriptionAction(p.id, 'reject')}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
