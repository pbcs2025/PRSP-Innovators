const mongoose = require('mongoose');
const config = require('../config');

async function connectDB() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

module.exports = { connectDB };
