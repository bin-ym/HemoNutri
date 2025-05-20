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

   // Load environment variables
   const envPath = path.resolve(__dirname, '.env');
   dotenv.config({ path: envPath });

   // Validate required environment variables
   const requiredEnvVars = ['MONGO_URI', 'PORT', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS'];
   requiredEnvVars.forEach((varName) => {
     if (!process.env[varName]) {
       console.error(`Error: Environment variable ${varName} is not defined`);
       process.exit(1);
     }
   });

   const app = express();

   // CORS configuration
   app.use(cors({
     origin: (origin, callback) => {
       const allowedOrigins = [
         'http://localhost:3000',
         'http://localhost:19000',
         'http://192.168.1.4:19000',
         'http://192.168.1.4:5000',
         'http://192.168.1.3:19000', // Added
         'http://192.168.1.3:5000',  // Added
         'http://10.0.2.2:5000',
         'http://localhost:5000',
       ];
       if (!origin || allowedOrigins.includes(origin)) {
         console.log(`[${new Date().toISOString()}] CORS allowed for origin: ${origin || 'No origin'}`);
         callback(null, true);
       } else {
         console.log(`[${new Date().toISOString()}] CORS error: Origin ${origin} not allowed`);
         callback(new Error('Not allowed by CORS'));
       }
     },
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization'],
   }));
   app.use(express.json());

   // Debug logging for incoming requests
   app.use((req, res, next) => {
     console.log(`[${new Date().toISOString()}] Incoming request: ${req.method} ${req.url} from ${req.headers.origin || 'No origin'}`);
     console.log('Request headers:', req.headers);
     console.log('Request body:', req.body);
     next();
   });

   // Global error handler
   app.use((err, req, res, next) => {
     console.error(`[${new Date().toISOString()}] Unhandled error:`, err.stack);
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
     console.log(`[${new Date().toISOString()}] 404 error: ${req.method} ${req.url}`);
     res.status(404).json({ error: 'Route not found' });
   });

   const PORT = process.env.PORT || 5000;

   const startServer = async () => {
     try {
       await connectDB();
       app.listen(PORT, '0.0.0.0', () => {
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