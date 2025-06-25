const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch((err) => console.error('❌ MongoDB Error:', err));

// Routes
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

const attendanceRoutes = require('./routes/attendance');
app.use('/api/attendance', attendanceRoutes);


const teacherRoutes = require('./routes/teachers');
app.use('/api/teachers', teacherRoutes);       // for add/delete/get all teachers
app.use('/api/teacher', teacherRoutes);        // for teacher login and /me route


const PORT = process.env.PORT || 5000;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


// server.js or seed.js
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

const createDefaultAdmin = async () => {
  const existingAdmin = await Admin.findOne({ username: 'admin' });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('12345', 10);
    await Admin.create({ username: 'admin', password: hashedPassword });
    console.log('✅ Admin created: username=admin, password=12345');
  } else {
    console.log('ℹ️ Admin already exists');
  }
};


createDefaultAdmin();

