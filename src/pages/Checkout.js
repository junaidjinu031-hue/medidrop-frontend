import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService, deliverySlotService, lockerService, pharmacyService } from '../services/api';
import { useCart } from '../context/CartContext';
import './Checkout.css';

const Checkout = () => {
  const { cart, selectedPharmacy, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customer_name: '',
    contact_phone: '',
    delivery_address: '',
    delivery_type: 'HOME',
    delivery_slot: '',
    notes: '',
  });
  const [deliverySlots, setDeliverySlots] = useState([]);
  const [lockers, setLockers] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const res = await pharmacyService.getAll();
        setPharmacies(res.data);
        if (selectedPharmacy) {
          setSelectedPharmacyId(selectedPharmacy.id);
        } else if (res.data.length > 0) {
          setSelectedPharmacyId(res.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching pharmacies:', error);
      }
    };
    fetchPharmacies();
  }, [selectedPharmacy]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedPharmacyId) return;
      try {
        const deliveryType = formData.delivery_type === 'LOCKER' ? 'LOCKER' : formData.delivery_type;
        const res = await deliverySlotService.getAll(selectedPharmacyId, deliveryType);
        setDeliverySlots(res.data);
      } catch (error) {
        console.error('Error fetching delivery slots:', error);
      }
    };
    fetchSlots();
  }, [selectedPharmacyId, formData.delivery_type]);

  useEffect(() => {
    const fetchLockers = async () => {
      if (formData.delivery_type === 'LOCKER' && selectedPharmacyId) {
        try {
          const res = await lockerService.getAll();
          // Filter lockers by pharmacy ID (pharmacy can be an ID or an object)
          setLockers(res.data.filter(l => {
            const pharmacyId = typeof l.pharmacy === 'object' ? l.pharmacy.id : l.pharmacy;
            return pharmacyId === selectedPharmacyId;
          }));
        } catch (error) {
          console.error('Error fetching lockers:', error);
        }
      } else {
        setLockers([]);
      }
    };
    fetchLockers();
  }, [formData.delivery_type, selectedPharmacyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (cart.length === 0) {
      setError('Your cart is empty');
      setLoading(false);
      return;
    }

    if (!selectedPharmacyId) {
      setError('Please select a pharmacy');
      setLoading(false);
      return;
    }

    try {
      const orderData = {
        customer_name: formData.customer_name,
        contact_phone: formData.contact_phone,
        delivery_address: formData.delivery_address,
        delivery_type: formData.delivery_type,
        pharmacy: selectedPharmacyId,
        delivery_slot: formData.delivery_slot || null,
        locker_slot: formData.delivery_type === 'LOCKER' && lockers.length > 0 ? lockers[0].id : null,
        notes: formData.notes,
        items: cart.map((item) => ({
          medicine: item.type === 'medicine' ? item.id : null,
          medical_kit: item.type === 'kit' ? item.id : null,
          quantity: item.quantity,
        })),
      };

      const response = await orderService.create(orderData);
      clearCart();
      navigate(`/track?phone=${formData.contact_phone}`);
    } catch (error) {
      console.error('Error creating order:', error);
      setError(error.response?.data?.detail || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <h1 className="page-title">Checkout</h1>
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button className="btn-primary" onClick={() => navigate('/medicines')}>
            Browse Medicines
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1 className="page-title">Checkout</h1>

      <div className="checkout-container">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2 className="section-title">Customer Information</h2>
            <div className="form-group">
              <label htmlFor="customer_name">Full Name *</label>
              <input
                type="text"
                id="customer_name"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact_phone">Phone Number *</label>
              <input
                type="tel"
                id="contact_phone"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Delivery Options</h2>
            <div className="form-group">
              <label htmlFor="pharmacy">Pharmacy *</label>
              <select
                id="pharmacy"
                value={selectedPharmacyId || ''}
                onChange={(e) => setSelectedPharmacyId(parseInt(e.target.value))}
                required
                className="form-input"
              >
                <option value="">Select a pharmacy</option>
                {pharmacies.map((pharmacy) => (
                  <option key={pharmacy.id} value={pharmacy.id}>
                    {pharmacy.name} - {pharmacy.city}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="delivery_type">Delivery Type *</label>
              <select
                id="delivery_type"
                name="delivery_type"
                value={formData.delivery_type}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="HOME">Home Delivery</option>
                <option value="PICKUP">Store Pickup</option>
                <option value="LOCKER">Locker Pickup</option>
              </select>
            </div>

            {formData.delivery_type === 'HOME' && (
              <div className="form-group">
                <label htmlFor="delivery_address">Delivery Address *</label>
                <textarea
                  id="delivery_address"
                  name="delivery_address"
                  value={formData.delivery_address}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="form-input"
                />
              </div>
            )}

            {(formData.delivery_type === 'HOME' || formData.delivery_type === 'PICKUP') && (
              <div className="form-group">
                <label htmlFor="delivery_slot">Time Slot *</label>
                <select
                  id="delivery_slot"
                  name="delivery_slot"
                  value={formData.delivery_slot}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="">Select a time slot</option>
                  {deliverySlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.label} ({slot.window_start} - {slot.window_end})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.delivery_type === 'LOCKER' && lockers.length > 0 && (
              <div className="form-group">
                <label>Available Locker</label>
                <div className="locker-info">
                  <p>Locker #{lockers[0].slot_number} will be assigned</p>
                  <p className="locker-note">You'll receive an OTP code via SMS to unlock the locker</p>
                </div>
              </div>
            )}
          </div>

          <div className="form-section">
            <div className="form-group">
              <label htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="form-input"
                placeholder="Any special instructions..."
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Placing Order...' : `Place Order - ₹${getTotalPrice().toFixed(2)}`}
          </button>
        </form>

        <div className="order-summary">
          <h2 className="section-title">Order Summary</h2>
          <div className="summary-items">
            {cart.map((item) => (
              <div key={`${item.type}-${item.id}`} className="summary-item">
                <span>{item.name} x{item.quantity}</span>
                <span>₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>₹{getTotalPrice().toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
