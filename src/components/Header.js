import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { getCartCount } = useCart();
  const { user, isAuthenticated, logout, isAdmin, isPharmacyStaff } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = getCartCount();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      // Force navigation and reload to clear state if needed
      window.location.href = '/';
    }
  };

  const roleClass = user?.role ? `header-${user.role.toLowerCase()}` : '';

  return (
    <header className={`header ${roleClass}`}>
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">💊</span>
          <span className="logo-text">MedDelivery</span>
        </Link>

        <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>
          <Link to="/medicines" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            Medicines
          </Link>
          <Link to="/kits" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            Medical Kits
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/prescriptions" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Prescriptions
              </Link>
              <Link to="/reminders" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Reminders
              </Link>
            </>
          )}
          <Link to="/track" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            Track Order
          </Link>
          {isAdmin && (
            <Link to="/admin" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              Admin
            </Link>
          )}
          {(isPharmacyStaff || isAdmin) && (
            <>
              <Link to="/pharmacy-staff" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Staff
              </Link>
              <Link to="/reports" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Reports
              </Link>
            </>
          )}
          {(user?.role === 'DELIVERY_PERSON' || isAdmin) && (
            <Link to="/delivery" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              Delivery
            </Link>
          )}
        </nav>

        <div className="header-actions">
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-name">{user?.username || user?.email}</span>
              <button className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">
                Login
              </Link>
              <Link to="/register" className="btn-register">
                Sign Up
              </Link>
            </div>
          )}
          <button
            className="cart-button"
            onClick={() => navigate('/cart')}
            aria-label="Shopping cart"
          >
            <span className="cart-icon">🛒</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${mobileMenuOpen ? 'hamburger-open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
