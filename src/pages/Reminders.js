import React, { useState, useEffect } from 'react';
import { reminderService } from '../services/reminders';
import { medicineService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Reminders.css';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    medicine: '',
    dosage_pattern: '',
    start_date: '',
    duration_days: '',
    reminder_times: '',
    is_active: true,
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchReminders();
    fetchMedicines();
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await reminderService.getAll();
      setReminders(res.data);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicines = async () => {
    try {
      const res = await medicineService.getAll();
      setMedicines(res.data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const reminderData = {
        ...formData,
        reminder_times: formData.reminder_times.split(',').map(t => t.trim()),
        medicine: parseInt(formData.medicine),
      };
      await reminderService.create(reminderData);
      setShowAdd(false);
      setFormData({
        medicine: '',
        dosage_pattern: '',
        start_date: '',
        duration_days: '',
        reminder_times: '',
        is_active: true,
      });
      fetchReminders();
    } catch (error) {
      console.error('Error creating reminder:', error);
      alert('Failed to create reminder');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        await reminderService.delete(id);
        fetchReminders();
      } catch (error) {
        console.error('Error deleting reminder:', error);
      }
    }
  };

  const handleToggle = async (id, isActive) => {
    try {
      await reminderService.update(id, { is_active: !isActive });
      fetchReminders();
    } catch (error) {
      console.error('Error updating reminder:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading reminders...</div>;
  }

  return (
    <div className="reminders-page">
      <div className="page-header">
        <h1 className="page-title">Medicine Reminders</h1>
        <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : 'Add Reminder'}
        </button>
      </div>

      {showAdd && (
        <div className="add-reminder-section">
          <h2>Add Medicine Reminder</h2>
          <form onSubmit={handleSubmit} className="reminder-form">
            <div className="form-group">
              <label htmlFor="medicine">Medicine *</label>
              <select
                id="medicine"
                name="medicine"
                value={formData.medicine}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="">Select a medicine</option>
                {medicines.map((medicine) => (
                  <option key={medicine.id} value={medicine.id}>
                    {medicine.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dosage_pattern">Dosage Pattern * (e.g., 1-0-1 for morning-none-evening)</label>
              <input
                type="text"
                id="dosage_pattern"
                name="dosage_pattern"
                value={formData.dosage_pattern}
                onChange={handleChange}
                required
                pattern="\d+-\d+-\d+"
                className="form-input"
                placeholder="1-0-1"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="start_date">Start Date *</label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="duration_days">Duration (days) *</label>
                <input
                  type="number"
                  id="duration_days"
                  name="duration_days"
                  value={formData.duration_days}
                  onChange={handleChange}
                  required
                  min="1"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reminder_times">Reminder Times (comma-separated, e.g., 08:00, 14:00, 20:00) *</label>
              <input
                type="text"
                id="reminder_times"
                name="reminder_times"
                value={formData.reminder_times}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="08:00, 14:00, 20:00"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
                Active
              </label>
            </div>

            <button type="submit" className="btn-primary">
              Create Reminder
            </button>
          </form>
        </div>
      )}

      {reminders.length === 0 ? (
        <div className="empty-state">
          <p>No reminders set up yet</p>
        </div>
      ) : (
        <div className="reminders-list">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="reminder-card">
              <div className="reminder-header">
                <div>
                  <h3>{reminder.medicine_detail?.name || 'Medicine'}</h3>
                  <p className="reminder-pattern">Pattern: {reminder.dosage_pattern}</p>
                </div>
                <span className={`status-badge ${reminder.is_active ? 'active' : 'inactive'}`}>
                  {reminder.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="reminder-details">
                <p><strong>Start Date:</strong> {new Date(reminder.start_date).toLocaleDateString()}</p>
                <p><strong>Duration:</strong> {reminder.duration_days} days</p>
                <p><strong>Reminder Times:</strong> {reminder.reminder_times.join(', ')}</p>
              </div>

              <div className="reminder-actions">
                <button
                  className={`btn-toggle ${reminder.is_active ? 'btn-deactivate' : 'btn-activate'}`}
                  onClick={() => handleToggle(reminder.id, reminder.is_active)}
                >
                  {reminder.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(reminder.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reminders;
