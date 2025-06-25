import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [teachers, setTeachers] = useState([]);
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', password: '' });

  const fetchTeachers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/teachers');
      setTeachers(res.data);
    } catch (err) {
      alert('Error fetching teachers');
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/teachers', newTeacher);
      alert('Teacher added');
      setNewTeacher({ name: '', email: '', password: '' });
      fetchTeachers();
    } catch (err) {
      alert('Error adding teacher');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/teachers/${id}`);
      alert('Teacher deleted');
      fetchTeachers();
    } catch (err) {
      alert('Error deleting teacher');
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin Dashboard</h1>

      {/* Add Teacher Form */}
      <form onSubmit={handleAddTeacher} className="admin-form">
        <h2>Add New Teacher</h2>
        <input
          type="text"
          placeholder="Name"
          value={newTeacher.name}
          onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
          className="admin-input"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={newTeacher.email}
          onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
          className="admin-input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={newTeacher.password}
          onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
          className="admin-input"
          required
        />
        <button type="submit" className="admin-button">Add Teacher</button>
      </form>

      {/* Teachers List */}
      <div className="admin-table-container">
        <h2>All Teachers</h2>
        {teachers.length === 0 ? (
          <p>No teachers found.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td>{teacher.name}</td>
                  <td>{teacher.email}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(teacher._id)}
                      className="admin-delete-button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
