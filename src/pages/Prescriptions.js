import React, { useState, useEffect } from 'react';
import { prescriptionService } from '../services/prescriptions';
import { useAuth } from '../context/AuthContext';
import './Prescriptions.css';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { user, isAdmin, isPharmacyStaff } = useAuth();

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await prescriptionService.getAll();
      setPrescriptions(res.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('prescription_file', selectedFile);

    try {
      await prescriptionService.upload(formData);
      setShowUpload(false);
      setSelectedFile(null);
      fetchPrescriptions();
    } catch (error) {
      console.error('Error uploading prescription:', error);
      alert('Failed to upload prescription');
    }
  };

  const handleApprove = async (id) => {
    try {
      await prescriptionService.approve(id);
      fetchPrescriptions();
    } catch (error) {
      console.error('Error approving prescription:', error);
    }
  };

  const handleReject = async (id) => {
    const notes = prompt('Enter rejection reason (optional):');
    try {
      await prescriptionService.reject(id, notes || '');
      fetchPrescriptions();
    } catch (error) {
      console.error('Error rejecting prescription:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#f59e0b',
      APPROVED: '#10b981',
      REJECTED: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return <div className="loading">Loading prescriptions...</div>;
  }

  const canReview = isAdmin || isPharmacyStaff;
  const userPrescriptions = canReview ? prescriptions : prescriptions.filter(p => p.user === user?.id);

  return (
    <div className="prescriptions-page">
      <div className="page-header">
        <h1 className="page-title">Prescriptions</h1>
        {!canReview && (
          <button className="btn-primary" onClick={() => setShowUpload(!showUpload)}>
            {showUpload ? 'Cancel' : 'Upload Prescription'}
          </button>
        )}
      </div>

      {showUpload && (
        <div className="upload-section">
          <h2>Upload Prescription</h2>
          <form onSubmit={handleUpload} className="upload-form">
            <div className="form-group">
              <label htmlFor="prescription_file">Select Prescription File</label>
              <input
                type="file"
                id="prescription_file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                required
                className="form-input"
              />
            </div>
            <button type="submit" className="btn-primary" disabled={!selectedFile}>
              Upload
            </button>
          </form>
        </div>
      )}

      {userPrescriptions.length === 0 ? (
        <div className="empty-state">
          <p>No prescriptions found</p>
        </div>
      ) : (
        <div className="prescriptions-list">
          {userPrescriptions.map((prescription) => (
            <div key={prescription.id} className="prescription-card">
              <div className="prescription-header">
                <div>
                  <h3>Prescription #{prescription.id}</h3>
                  <p className="prescription-date">
                    Uploaded: {new Date(prescription.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(prescription.status) }}
                >
                  {prescription.status}
                </span>
              </div>

              {prescription.prescription_file && (
                <div className="prescription-file">
                  <a
                    href={prescription.prescription_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="file-link"
                  >
                    View Prescription
                  </a>
                </div>
              )}

              {prescription.notes && (
                <div className="prescription-notes">
                  <strong>Notes:</strong> {prescription.notes}
                </div>
              )}

              {prescription.reviewed_by_detail && (
                <div className="prescription-reviewer">
                  Reviewed by: {prescription.reviewed_by_detail.username} on{' '}
                  {new Date(prescription.reviewed_at).toLocaleDateString()}
                </div>
              )}

              {canReview && prescription.status === 'PENDING' && (
                <div className="prescription-actions">
                  <button
                    className="btn-approve"
                    onClick={() => handleApprove(prescription.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleReject(prescription.id)}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
