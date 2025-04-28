const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const providerRoutes = require('./routes/providerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

const requiredEnvVars = ['MONGO_URI', 'PORT', 'JWT_SECRET'];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`Error: Environment variable ${varName} is not defined`);
    process.exit(1);
  }
});

const app = express();

// Updated CORS configuration to allow multiple origins
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:19000',
      'http://192.168.1.5:19000',
      'http://192.168.1.5:5000',
      'https://abc123.ngrok.io', // Replace with your actual ngrok URL
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS error: Origin ${origin} not allowed`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Debug logging for incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  const statusCode = err.status || 500;
  const errorMessage = err.message || 'Internal server error';
  res.status(statusCode).json({ error: errorMessage });
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Mount routes with debug logging
console.log('Mounting routes...');
app.use('/api/auth', authRoutes);
console.log('Mounted /api/auth routes');
app.use('/api/patient', patientRoutes);
console.log('Mounted /api/patient routes');
app.use('/api/provider', providerRoutes);
console.log('Mounted /api/provider routes');
app.use('/api/admin', adminRoutes);
console.log('Mounted /api/admin routes');
app.use('/api/notifications', notificationRoutes);
console.log('Mounted /api/notifications routes');

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    }).on('error', (err) => {
      console.error('Server startup error:', err.message);
      process.exit(1);
    });
  } catch (err) {
    console.error('Startup error:', err.message);
    process.exit(1);
  }
};

startServer();