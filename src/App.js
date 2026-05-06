import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import Medicines from './pages/Medicines';
import MedicalKits from './pages/MedicalKits';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminPanel from './pages/AdminPanel';
import DeliveryPanel from './pages/DeliveryPanel';
import OrderTracking from './pages/OrderTracking';
import Login from './pages/Login';
import Register from './pages/Register';
import Prescriptions from './pages/Prescriptions';
import Reminders from './pages/Reminders';
import Reports from './pages/Reports';
import PharmacyStaff from './pages/PharmacyStaff';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/medicines" element={<Medicines />} />
                <Route path="/kits" element={<MedicalKits />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/delivery" element={<DeliveryPanel />} />
                <Route path="/track" element={<OrderTracking />} />
                <Route path="/prescriptions" element={<Prescriptions />} />
                <Route path="/reminders" element={<Reminders />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/pharmacy-staff" element={<PharmacyStaff />} />
              </Routes>
            </main>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
