import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const [teacher, setTeacher] = useState({});
  const [sessionId, setSessionId] = useState(localStorage.getItem('activeSessionId') || null);
  const [form, setForm] = useState({ className: '', subject: '', hour: '', date: '' });
  const [students, setStudents] = useState([]);
  const [historySessions, setHistorySessions] = useState([]);
  const [expandedSession, setExpandedSession] = useState(null);
  const [manualStudent, setManualStudent] = useState({ name: '', rollNo: '' });

  const token = localStorage.getItem('teacherToken');

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/teachers/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTeacher(res.data);
      } catch (err) {
        console.error('Failed to fetch teacher:', err);
        alert('Please log in again.');
      }
    };
    fetchTeacher();
  }, [token]);

  useEffect(() => {
    if (!sessionId) return;
    localStorage.setItem('activeSessionId', sessionId);
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/attendance/${sessionId}`);
        setStudents(res.data.students || []);
      } catch (err) {
        console.error('Error fetching students:', err);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [sessionId]);

  useEffect(() => {
    if (!teacher._id) return;

    const fetchAttendanceHistory = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/attendance/teacher/${teacher._id}`);
        setHistorySessions(res.data);
      } catch (err) {
        console.error('Failed to load history:', err);
      }
    };

    fetchAttendanceHistory();
  }, [teacher]);

  const handleCreateSession = async () => {
    const { className, subject, hour, date } = form;
    if (!className || !subject || !hour || !date) {
      alert('All fields are required');
      return;
    }

    try {
      const res = await axios.post(
        'http://localhost:5000/api/attendance/create',
        { ...form, teacherId: teacher._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSessionId(res.data._id);
      setForm({ className: '', subject: '', hour: '', date: '' });
    } catch (err) {
      console.error('Session creation failed:', err);
      alert('Failed to start session.');
    }
  };

  const handleAddStudent = async () => {
    if (!manualStudent.name || !manualStudent.rollNo) return alert('Enter all fields');
    try {
      await axios.post('http://localhost:5000/api/attendance/student/manual-add', {
        sessionId,
        name: manualStudent.name,
        rollNo: manualStudent.rollNo
      });

      setManualStudent({ name: '', rollNo: '' });
    } catch (err) {
      console.error('Error adding student:', err);
      alert('Failed to add student');
    }
  };

  const handleDeleteStudent = async (rollNo) => {
    try {
      await axios.put(`http://localhost:5000/api/attendance/${sessionId}/remove-student`, { rollNo });
      setStudents(students.filter((s) => s.rollNo !== rollNo));
    } catch (err) {
      console.error('Error removing student:', err);
      alert('Failed to remove student');
    }
  };

  const handleEndSession = () => {
    localStorage.removeItem('activeSessionId');
    setSessionId(null);
    setStudents([]);
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Welcome, {teacher.name || 'Teacher'}</h2>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          {sessionId ? (
            <>
              <h3 className="section-title">QR Code - Live Session</h3>
              <QRCodeCanvas value={`http://192.168.0.4:3000/attendance/${sessionId}`} size={256} />
              <button className="end-button" onClick={handleEndSession}>End Attendance</button>
            </>
          ) : (
            <>
              <h3 className="section-title">Start New Attendance</h3>
              <input type="text" placeholder="Class" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} className="form-input" required />
              <input type="text" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="form-input" required />
              <input type="text" placeholder="Hour" value={form.hour} onChange={(e) => setForm({ ...form, hour: e.target.value })} className="form-input" required />
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="form-input" required />
              <button className="submit-button" onClick={handleCreateSession}>Generate QR</button>
            </>
          )}
        </div>

        <div className="dashboard-card">
          <h3 className="section-title">Students Present</h3>
          {students.length === 0 ? (
            <p className="text-muted">No students scanned yet.</p>
          ) : (
            <ul className="student-list">
              {students.map((s, i) => (
                <li key={i} className="student-item">
                  {s.name} ({s.rollNo})
                  <button onClick={() => handleDeleteStudent(s.rollNo)} className="delete-student">Delete</button>
                </li>
              ))}
            </ul>
          )}

          {sessionId && (
            <div className="mt-4">
              <input type="text" placeholder="Name" value={manualStudent.name} onChange={(e) => setManualStudent({ ...manualStudent, name: e.target.value })} className="form-input" />
              <input type="text" placeholder="Roll No" value={manualStudent.rollNo} onChange={(e) => setManualStudent({ ...manualStudent, rollNo: e.target.value })} className="form-input" />
              <button onClick={handleAddStudent} className="submit-button">Add Student</button>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-card">
        <h3 className="section-title large">📅 Attendance History</h3>
        {historySessions.length === 0 ? (
          <p className="text-muted">No previous sessions found.</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Hour</th>
                <th>Students</th>
              </tr>
            </thead>
            <tbody>
              {historySessions.map((session) => (
                <React.Fragment key={session._id}>
                  <tr>
                    <td>{session.date}</td>
                    <td>{session.className}</td>
                    <td>{session.subject}</td>
                    <td>{session.hour}</td>
                    <td
                      className="students-count"
                      onClick={() =>
                        setExpandedSession(
                          expandedSession === session._id ? null : session._id
                        )
                      }
                    >
                      {session.students.length}
                    </td>
                  </tr>
                  {expandedSession === session._id && (
                    <tr>
                      <td colSpan="5" className="expanded-row">
                        <ul className="student-list">
                          {session.students.map((s, i) => (
                            <li key={i}>{s.name} ({s.rollNo})</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
