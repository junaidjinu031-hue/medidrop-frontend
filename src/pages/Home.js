import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pharmacyService, medicalKitService } from '../services/api';
import './Home.css';

const Home = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pharmaciesRes, kitsRes] = await Promise.all([
          pharmacyService.getAll(),
          medicalKitService.getAll(),
        ]);
        setPharmacies(pharmaciesRes.data.slice(0, 3));
        setKits(kitsRes.data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home">
      <section className="hero-modern">
        <div className="hero-container">
          <div className="hero-image-wrapper">
            <div className="hero-circle-bg"></div>
            <img
              src="https://img.freepik.com/free-photo/pleased-young-female-doctor-wearing-medical-robe-stethoscope-around-neck-standing-with-closed-posture_409827-254.jpg"
              alt="Doctor"
              className="hero-doctor-img"
            />
          </div>
          <div className="hero-content-modern">
            <h1 className="hero-title-modern">Best Reliable<br />Medical Service</h1>
            <p className="hero-subtitle-modern">
              Experience the highest standard of medical care with our dedicated professionals.
              We offer reliable, efficient, and comprehensive health services tailored to your specific needs,
              ensuring your well-being is always our top priority.
            </p>

          </div>
        </div>
      </section>

      <section className="features">
        <h2 className="section-title">Why Choose Us</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⏰</div>
            <h3>Time-Slot Booking</h3>
            <p>Select your preferred delivery window for timely service</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Locker Pickup</h3>
            <p>Collect your medicines anytime using OTP-based lockers</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <h3>Ready-Made Kits</h3>
            <p>Quick access to curated medical kits for common needs</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3>Real-Time Tracking</h3>
            <p>Track your order status in real-time with delivery updates</p>
          </div>
        </div>
      </section>

      {kits.length > 0 && (
        <section className="featured-kits">
          <h2 className="section-title">Featured Medical Kits</h2>
          <div className="kits-grid">
            {kits.map((kit) => (
              <Link key={kit.id} to="/kits" className="kit-card">
                <div className="kit-name">{kit.name}</div>
                <div className="kit-price">₹{parseFloat(kit.price).toFixed(2)}</div>
                <div className="kit-description">{kit.description}</div>
              </Link>
            ))}
          </div>
          <Link to="/kits" className="btn btn-outline">
            View All Kits
          </Link>
        </section>
      )}

      <section className="login-options-section">
        <h2 className="section-title">Login to Your Account</h2>
        <div className="login-options-grid">
          <div className="login-card customer-login">
            <div className="login-icon">👤</div>
            <h3>Customer</h3>
            <p>Order medicines, track deliveries, and manage prescriptions.</p>
            <Link to="/login" state={{ role: 'CUSTOMER' }} className="btn btn-primary">Customer Login</Link>
          </div>

          <div className="login-card pharmacy-login">
            <div className="login-icon">🏥</div>
            <h3>Pharmacy Staff</h3>
            <p>Manage inventory, process orders, and assign deliveries.</p>
            <Link to="/login" state={{ role: 'PHARMACY_STAFF' }} className="btn btn-outline">Pharmacy Login</Link>
          </div>

          <div className="login-card delivery-login">
            <div className="login-icon">🛵</div>
            <h3>Delivery Partner</h3>
            <p>View assigned orders and update delivery status.</p>
            <Link to="/login" state={{ role: 'DELIVERY_PERSON' }} className="btn btn-outline">Delivery Login</Link>
          </div>
        </div>
      </section>

      {pharmacies.length > 0 && (
        <section className="pharmacies">
          <h2 className="section-title">Nearby Pharmacies</h2>
          <div className="pharmacies-grid">
            {pharmacies.map((pharmacy) => (
              <div key={pharmacy.id} className="pharmacy-card">
                <h3 className="pharmacy-name">{pharmacy.name}</h3>
                <p className="pharmacy-address">{pharmacy.address}</p>
                <p className="pharmacy-city">{pharmacy.city}</p>
                {pharmacy.has_pickup_locker && (
                  <span className="locker-badge">🔒 Locker Available</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
