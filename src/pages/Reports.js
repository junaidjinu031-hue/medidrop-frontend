import React, { useState, useEffect } from 'react';
import { reportsService } from '../services/reports';
import { useAuth } from '../context/AuthContext';
import './Reports.css';

const Reports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin, isPharmacyStaff } = useAuth();

  useEffect(() => {
    if (isAdmin || isPharmacyStaff) {
      fetchReports();
    }
  }, [isAdmin, isPharmacyStaff]);

  const fetchReports = async () => {
    try {
      const res = await reportsService.getReports();
      setReports(res.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin && !isPharmacyStaff) {
    return (
      <div className="reports-page">
        <div className="error-message">Access denied. Admin or Pharmacy Staff access required.</div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  if (!reports) {
    return <div className="loading">No reports available</div>;
  }

  return (
    <div className="reports-page">
      <h1 className="page-title">Reports & Analytics</h1>

      <div className="reports-grid">
        <div className="report-card">
          <h2 className="report-title">Orders</h2>
          <div className="report-stat">
            <span className="stat-label">Total Orders:</span>
            <span className="stat-value">{reports.orders.total}</span>
          </div>
          <div className="report-stat">
            <span className="stat-label">Last 30 Days:</span>
            <span className="stat-value">{reports.orders.recent_30_days}</span>
          </div>
          <div className="status-breakdown">
            <h3>By Status:</h3>
            {reports.orders.by_status.map((status) => (
              <div key={status.status} className="status-item">
                <span>{status.status}:</span>
                <span>{status.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="report-card">
          <h2 className="report-title">Revenue</h2>
          <div className="report-stat">
            <span className="stat-label">Total Revenue:</span>
            <span className="stat-value revenue">₹{reports.revenue.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="report-card">
          <h2 className="report-title">Medicines</h2>
          <div className="report-stat">
            <span className="stat-label">Total Medicines:</span>
            <span className="stat-value">{reports.medicines.total}</span>
          </div>
          <div className="report-stat">
            <span className="stat-label">Low Stock:</span>
            <span className={`stat-value ${reports.medicines.low_stock > 0 ? 'warning' : ''}`}>
              {reports.medicines.low_stock}
            </span>
          </div>
        </div>

        <div className="report-card">
          <h2 className="report-title">Prescriptions</h2>
          <div className="report-stat">
            <span className="stat-label">Pending:</span>
            <span className="stat-value">{reports.prescriptions.pending}</span>
          </div>
          <div className="report-stat">
            <span className="stat-label">Approved:</span>
            <span className="stat-value">{reports.prescriptions.approved}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
