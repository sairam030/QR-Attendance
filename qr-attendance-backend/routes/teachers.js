const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

// Add a new teacher
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await Teacher.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Teacher already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newTeacher = new Teacher({ name, email, password: hashedPassword });
    await newTeacher.save();

    res.status(201).json({ message: 'Teacher added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while adding teacher' });
  }
});

// ✅ Get all teachers
router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching teachers' });
  }
});

// Delete a teacher by ID
router.delete('/:id', async (req, res) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ message: 'Teacher deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting teacher' });
  }
});

const jwt = require('jsonwebtoken');

// Teacher login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: teacher._id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1d' });
    res.json({ token, teacher });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current teacher info
router.get('/me', auth, (req, res) => {
  res.json(req.teacher);
});



module.exports = router;
