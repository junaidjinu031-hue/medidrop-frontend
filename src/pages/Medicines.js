import React, { useState, useEffect } from 'react';
import { medicineService, pharmacyService } from '../services/api';
import { useCart } from '../context/CartContext';
import './Medicines.css';

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, setSelectedPharmacy: setCartPharmacy } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pharmaciesRes = await pharmacyService.getAll();
        setPharmacies(pharmaciesRes.data);
        if (pharmaciesRes.data.length > 0) {
          setSelectedPharmacy(pharmaciesRes.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching pharmacies:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchMedicines = async () => {
      if (!selectedPharmacy) return;
      setLoading(true);
      try {
        const res = await medicineService.getAll(selectedPharmacy);
        setMedicines(res.data);
      } catch (error) {
        console.error('Error fetching medicines:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMedicines();
  }, [selectedPharmacy]);

  const handleAddToCart = (medicine) => {
    addToCart(medicine, 'medicine');
    const pharmacy = pharmacies.find((p) => p.id === selectedPharmacy);
    if (pharmacy) {
      setCartPharmacy(pharmacy);
    }
  };

  if (loading && medicines.length === 0) {
    return <div className="loading">Loading medicines...</div>;
  }

  const displayedMedicines = medicines.filter(medicine => 
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (medicine.description && medicine.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="medicines-page">
      <h1 className="page-title">Medicines</h1>

      <div className="filters-container">
        {pharmacies.length > 0 && (
          <div className="pharmacy-selector">
            <label htmlFor="pharmacy-select">Select Pharmacy:</label>
            <select
              id="pharmacy-select"
              value={selectedPharmacy || ''}
              onChange={(e) => setSelectedPharmacy(parseInt(e.target.value))}
              className="select-input"
            >
              {pharmacies.map((pharmacy) => (
                <option key={pharmacy.id} value={pharmacy.id}>
                  {pharmacy.name} - {pharmacy.city}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="search-container">
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {displayedMedicines.length === 0 ? (
        <div className="empty-state">
          <p>No medicines match your search.</p>
        </div>
      ) : (
        <div className="medicines-grid">
          {displayedMedicines.map((medicine) => (
            <div key={medicine.id} className="medicine-card">
              {medicine.image_url && (
                <div className="medicine-image">
                  <img src={medicine.image_url} alt={medicine.name} />
                </div>
              )}
              <div className="medicine-info">
                <h3 className="medicine-name">{medicine.name}</h3>
                {medicine.description && (
                  <p className="medicine-description">{medicine.description}</p>
                )}
                <div className="medicine-details">
                  <span className="medicine-price">₹{parseFloat(medicine.price).toFixed(2)}</span>
                  <span className={`medicine-stock ${medicine.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {medicine.stock > 0 ? `In Stock (${medicine.stock})` : 'Out of Stock'}
                  </span>
                </div>
                {medicine.prescription_required && (
                  <span className="prescription-badge">Prescription Required</span>
                )}
                <button
                  className="btn-add-cart"
                  onClick={() => handleAddToCart(medicine)}
                  disabled={medicine.stock === 0}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Medicines;
