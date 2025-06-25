// routes/attendance.js
const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// Helper to check subnet match
const isSameNetwork = (ip1, ip2) => {
  const getSubnet = ip => ip.split('.').slice(0, 3).join('.');
  return getSubnet(ip1) === getSubnet(ip2);
};

// POST /api/attendance/create
router.post('/create', async (req, res) => {
  try {
    const { className, subject, hour, date, teacherId } = req.body;
    const teacherIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const newSession = await Attendance.create({
      className,
      subject,
      hour,
      date,
      teacherId,
      students: [],
      teacherIp
    });

    res.status(201).json(newSession);
  } catch (err) {
    console.error('Error creating attendance session:', err);
    res.status(500).json({ message: 'Failed to create session' });
  }
});

// GET /api/attendance/:sessionId
router.get('/:sessionId', async (req, res) => {
  try {
    const session = await Attendance.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching session' });
  }
});

// POST /api/attendance/submit/:sessionId
router.post('/submit/:sessionId', async (req, res) => {
  try {
    const { name, rollNo } = req.body;
    const studentIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const sessionId = req.params.sessionId;

    const session = await Attendance.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (!isSameNetwork(studentIp, session.teacherIp)) {
      return res.status(403).json({ message: 'You must be on the same network as the teacher' });
    }

    const alreadyPresent = session.students.some(s => s.rollNo === rollNo);
    if (alreadyPresent) return res.status(400).json({ message: 'Attendance already marked' });

    session.students.push({ name, rollNo, ip: studentIp });
    await session.save();

    res.json({ message: 'Attendance submitted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit attendance' });
  }
});

// ✅ POST /api/attendance/student/mark-attendance

router.post('/student/mark-attendance', async (req, res) => {
  try {
    const { qrData, name, rollNo, deviceId } = req.body;

    if (!qrData || !name || !rollNo || !deviceId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    console.log("Received qrData:", qrData); // ✅ log it

    const parts = qrData.split('/');
    const sessionId = parts[parts.length - 1];

    if (!sessionId || sessionId === "undefined") {
      return res.status(400).json({ message: 'Invalid session ID in QR data' });
    }

    const session = await Attendance.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const alreadyMarked = session.students.some(s => s.deviceId === deviceId);
    if (alreadyMarked) return res.status(409).json({ message: 'Already marked' });

    session.students.push({ name, rollNo, deviceId });
    await session.save();

    res.status(200).json({ message: 'Attendance marked' });
  } catch (err) {
    console.error('❌ Error in student mark-attendance:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/attendance/teacher/:teacherId
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const sessions = await Attendance.find({ teacherId: req.params.teacherId }).sort({ date: -1 });
    res.json(sessions);
  } catch (err) {
    console.error('❌ Error fetching history:', err);
    res.status(500).json({ message: 'Failed to fetch attendance history' });
  }
});


// PUT /api/attendance/:sessionId/remove-student
router.put('/:sessionId/remove-student', async (req, res) => {
  try {
    const { rollNo } = req.body;
    const session = await Attendance.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.students = session.students.filter((s) => s.rollNo !== rollNo);
    await session.save();

    res.json({ message: 'Student removed' });
  } catch (err) {
    console.error('❌ Error removing student:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Example: in routes/attendance.js
router.post('/student/manual-add', async (req, res) => {
  try {
    const { sessionId, name, rollNo } = req.body;

    if (!sessionId || !name || !rollNo) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const session = await Attendance.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const alreadyMarked = session.students.some(s => s.rollNo === rollNo);
    if (alreadyMarked) return res.status(409).json({ message: 'Student already added' });

    session.students.push({ name, rollNo, deviceId: 'manual-entry' });
    await session.save();

    res.status(200).json({ message: 'Student added manually' });
  } catch (err) {
    console.error('❌ Error adding student manually:', err);
    res.status(500).json({ message: 'Server error' });
  }
});





module.exports = router;
