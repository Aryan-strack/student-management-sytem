const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const studentRoutes = require('./routes/studentRoutes');
const classRoutes = require('./routes/classRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const courseRoutes = require('./routes/courseRoutes');

// Import error handler
const errorHandler = require('./middlewares/errorHandler');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:4200', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API documentation endpoint
app.get('/api-docs', (req, res) => {
  res.json({
    message: 'Student Management System API Documentation',
    endpoints: {
      students: {
        getAll: 'GET /api/students',
        getOne: 'GET /api/students/:id',
        create: 'POST /api/students',
        update: 'PUT /api/students/:id',
        delete: 'DELETE /api/students/:id',
        search: 'GET /api/students/search'
      },
      classes: {
        getAll: 'GET /api/classes',
        getOne: 'GET /api/classes/:id',
        create: 'POST /api/classes',
        update: 'PUT /api/classes/:id',
        delete: 'DELETE /api/classes/:id'
      },
      departments: {
        getAll: 'GET /api/departments',
        getOne: 'GET /api/departments/:id',
        create: 'POST /api/departments',
        update: 'PUT /api/departments/:id',
        delete: 'DELETE /api/departments/:id'
      },
      courses: {
        getAll: 'GET /api/courses',
        getOne: 'GET /api/courses/:id',
        create: 'POST /api/courses',
        update: 'PUT /api/courses/:id',
        delete: 'DELETE /api/courses/:id'
      }
    }
  });
});

// API Routes
app.use('/api/students', studentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/courses', courseRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Student Management System API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Database connection with retry logic
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_management', {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    
    // Start server only after DB connection
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  });
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('👋 Received SIGINT. Closing connections...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('👋 Received SIGTERM. Closing connections...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

// Connect to database
connectWithRetry();

module.exports = app;