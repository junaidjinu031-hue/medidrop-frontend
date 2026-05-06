import React, { useState, useEffect } from 'react';
import { medicalKitService } from '../services/api';
import { useCart } from '../context/CartContext';
import './MedicalKits.css';

const MedicalKits = () => {
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchKits = async () => {
      try {
        const res = await medicalKitService.getAll();
        setKits(res.data);
      } catch (error) {
        console.error('Error fetching medical kits:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchKits();
  }, []);

  const handleAddToCart = (kit) => {
    addToCart(kit, 'kit');
  };

  if (loading) {
    return <div className="loading">Loading medical kits...</div>;
  }

  return (
    <div className="kits-page">
      <h1 className="page-title">Medical Kits</h1>
      <p className="page-subtitle">
        Curated medical kits for quick and easy purchases
      </p>

      {kits.length === 0 ? (
        <div className="empty-state">
          <p>No medical kits available at the moment.</p>
        </div>
      ) : (
        <div className="kits-grid">
          {kits.map((kit) => (
            <div key={kit.id} className="kit-card-large">
              <div className="kit-header">
                <h3 className="kit-name">{kit.name}</h3>
                <div className="kit-price">₹{parseFloat(kit.price).toFixed(2)}</div>
              </div>
              {kit.description && (
                <p className="kit-description">{kit.description}</p>
              )}
              {kit.contents && (
                <div className="kit-contents">
                  <h4>Contents:</h4>
                  <ul>
                    {kit.contents.split(',').map((item, index) => (
                      <li key={index}>{item.trim()}</li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                className="btn-add-cart"
                onClick={() => handleAddToCart(kit)}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalKits;
