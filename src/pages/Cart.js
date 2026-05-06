import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <h1 className="page-title">Shopping Cart</h1>
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <p>Your cart is empty</p>
          <button className="btn-primary" onClick={() => navigate('/medicines')}>
            Browse Medicines
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="page-title">Shopping Cart</h1>

      <div className="cart-container">
        <div className="cart-items">
          {cart.map((item) => (
            <div key={`${item.type}-${item.id}`} className="cart-item">
              <div className="cart-item-info">
                <h3 className="cart-item-name">{item.name}</h3>
                <p className="cart-item-type">
                  {item.type === 'medicine' ? 'Medicine' : 'Medical Kit'}
                </p>
                <p className="cart-item-price">₹{parseFloat(item.price).toFixed(2)} each</p>
              </div>
              <div className="cart-item-controls">
                <div className="quantity-controls">
                  <button
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="quantity-value">{item.quantity}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <div className="cart-item-total">
                  ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id, item.type)}
                  aria-label="Remove item"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="summary-card">
            <h2 className="summary-title">Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${getTotalPrice().toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${getTotalPrice().toFixed(2)}</span>
            </div>
            <div className="summary-actions">
              <button className="btn-primary" onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </button>
              <button className="btn-secondary" onClick={clearCart}>
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
