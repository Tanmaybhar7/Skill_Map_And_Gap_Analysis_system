const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const skillRoutes = require('./routes/skillRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const mappingRoutes = require('./routes/mappingRoutes');
const gapRoutes = require('./routes/gapRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

// Security & Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Asset Directories
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../client')));

// API Endpoint Registrations
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/mapping', mappingRoutes);
app.use('/api/gap', gapRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'Skill_Map - Skill Mapping & Gap Analysis System',
    timestamp: new Date()
  });
});

// Fallback index.html route for client-side navigation
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../client/index.html'));
  } else {
    res.status(404).json({ success: false, message: 'API Route Not Found' });
  }
});

// Global Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 SKILL_MAP PLATFORM SERVER RUNNING ON PORT ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`====================================================`);
});

module.exports = app;
