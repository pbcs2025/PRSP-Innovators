require('dotenv').config();

// Suppress Redis connection errors (Redis is optional)
const originalEmit = process.emit;
process.emit = function(event, error) {
  if (event === 'uncaughtException' || event === 'unhandledRejection') {
    if (error) {
      // Check for ECONNREFUSED in various error formats
      const isRedisError = 
        error.code === 'ECONNREFUSED' ||
        (error.message && error.message.includes('ECONNREFUSED')) ||
        (error.message && error.message.includes('Redis')) ||
        (error.errors && Array.isArray(error.errors) && error.errors.some(e => e.code === 'ECONNREFUSED')) ||
        (error.cause && error.cause.code === 'ECONNREFUSED');
      
      if (isRedisError) {
        // Suppress Redis connection errors - they're handled in anomalyService
        return false;
      }
    }
  }
  return originalEmit.apply(this, arguments);
};

// Also suppress ioredis AggregateError console output
const originalConsoleError = console.error;
console.error = function(...args) {
  const message = args[0]?.toString() || '';
  if (message.includes('[ioredis]') && message.includes('ECONNREFUSED')) {
    // Suppress ioredis connection error spam
    return;
  }
  originalConsoleError.apply(console, args);
};

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db/mongo');
const { initIndexes } = require('./db/initIndexes');

const authRoutes  = require('./routes/auth');
const kycRoutes   = require('./routes/kyc');
const adminRoutes = require('./routes/admin');
const logsRoutes  = require('./routes/logs');

const app = express();
app.use(cors({ 
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5176', 'http://127.0.0.1:5176'],
  credentials: true 
}));
app.use(express.json());

app.use('/auth',  authRoutes);
app.use('/kyc',   kycRoutes);
app.use('/admin', adminRoutes);
app.use('/logs',  logsRoutes);

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    await initIndexes();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Backend running on http://localhost:${PORT}`);
      console.log(`   Listening on all interfaces (0.0.0.0:${PORT})`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();
