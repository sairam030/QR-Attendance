import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // 👈 Add CSS import

const TeacherLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/teachers/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('teacherName', res.data.teacher.name);
      localStorage.setItem('teacherId', res.data.teacher._id);
      alert('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  return (
    <div className="login-container teacher">
      <form onSubmit={handleLogin} className="login-form">
        <h2 className="login-title">Teacher Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
          required
        />
        <button type="submit" className="login-button blue">Login</button>
        <button type="button" className="login-button red" onClick={() => navigate('/admin-login')}>
          Go to Admin Portal
        </button>
      </form>
    </div>
  );
};

export default TeacherLogin;
