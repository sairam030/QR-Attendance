const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
  console.error('❌ Admin login error:', err);
  res.status(500).json({ message: 'Server error' });
}
});

// Add Teacher
router.post('/add-teacher', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await Teacher.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newTeacher = new Teacher({ name, email, password: hashedPassword });
    await newTeacher.save();

    res.json({ message: 'Teacher added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error adding teacher' });
  }
});

module.exports = router;
