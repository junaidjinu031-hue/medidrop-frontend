import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pharmacyService } from '../services/api';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '', pharmacy_id: '' });
  const [pharmacies, setPharmacies] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const roleLabels = {
    'CUSTOMER': 'Customer',
    'PHARMACY_STAFF': 'Pharmacy Staff',
    'DELIVERY_PERSON': 'Delivery Partner'
  };

  const requestedRole = location.state?.role;
  const pageTitle = requestedRole ? `${roleLabels[requestedRole]} Login` : 'Welcome Back';
  const pageSubtitle = requestedRole ? `Sign in to your ${roleLabels[requestedRole].toLowerCase()} account` : 'Sign in to your account';

  useEffect(() => {
    if (requestedRole === 'PHARMACY_STAFF') {
      const fetchPharmacies = async () => {
        try {
          const res = await pharmacyService.getAll();
          setPharmacies(res.data);
          if(res.data.length > 0) {
            setFormData(prev => ({ ...prev, pharmacy_id: res.data[0].id }));
          }
        } catch (error) {
          console.error("Error fetching pharmacies", error);
        }
      };
      fetchPharmacies();
    }
  }, [requestedRole]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { ...formData };
      if (!payload.pharmacy_id) {
        delete payload.pharmacy_id;
      }
      
      const response = await login(payload);
      const user = response.user || response; // Handle both cases just to be safe, but usually it's response.user

      // Redirect based on role
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'PHARMACY_STAFF') {
        navigate('/pharmacy-staff');
      } else if (user.role === 'DELIVERY_PERSON') {
        navigate('/delivery');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error full object:', err);
      // Fallback to showing the raw error status text or message for debugging
      const errorMessage = err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        (err.response ? `Error ${err.response.status}: ${JSON.stringify(err.response.data)}` : 'Login failed. Server unreachable or unknown error.');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">{pageTitle}</h1>
        <p className="auth-subtitle">{pageSubtitle}</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {requestedRole === 'PHARMACY_STAFF' ? (
            <div className="form-group">
              <label htmlFor="pharmacy_id">Select Pharmacy</label>
              <select
                id="pharmacy_id"
                name="pharmacy_id"
                value={formData.pharmacy_id}
                onChange={handleChange}
                required
                className="form-input"
              >
                {pharmacies.map(pharmacy => (
                  <option key={pharmacy.id} value={pharmacy.id}>
                    {pharmacy.name} - {pharmacy.city}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter your username"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
