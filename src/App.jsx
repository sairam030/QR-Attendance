import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import TeacherLogin from './components/TeacherLogin';
import Dashboard from './components/TeacherDashboard';
import StudentForm from './pages/StudentForm';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<TeacherLogin />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/attendance/:sessionId" element={<StudentForm />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />}/>
    </Routes>
  </Router>
);

export default App;
