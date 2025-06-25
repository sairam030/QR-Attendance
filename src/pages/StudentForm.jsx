import React, { useState } from 'react';
import axios from 'axios';
import './StudentForm.css'; // 👈 Import the CSS

const StudentForm = ({ sessionId }) => {
  const [form, setForm] = useState({ name: '', rollNo: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://${window.location.hostname}:5000/api/attendance/student/mark-attendance`, {
        qrData: window.location.href,
        name: form.name,
        rollNo: form.rollNo,
        deviceId: navigator.userAgent,
      });

      alert('Attendance marked successfully!');
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert('Error: ' + (err.response?.data?.message || 'Server error'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="student-form-container">
      <h2>Fill Your Details</h2>
      <input
        type="text"
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="student-form-input"
        required
      />
      <input
        type="text"
        placeholder="Roll No"
        value={form.rollNo}
        onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
        className="student-form-input"
        required
      />
      <button type="submit" className="student-form-button">
        Submit Attendance
      </button>
    </form>
  );
};

export default StudentForm;
