#!/usr/bin/env node

/**
 * Helper script to create the first admin user
 * Usage: node create-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createAdmin() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/kyc_db';
    console.log('🔌 Attempting to connect to MongoDB...');
    console.log(`   URI: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials if present
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      password_hash: { type: String, required: true },
      role: { type: String, enum: ['admin', 'officer', 'auditor'], required: true },
      is_active: { type: Boolean, default: true }
    }, { timestamps: true }));

    rl.question('Username: ', async (username) => {
      rl.question('Email: ', async (email) => {
        rl.question('Password: ', async (password) => {
          try {
            const password_hash = await bcrypt.hash(password, 12);
            await User.create({
              username,
              email,
              password_hash,
              role: 'admin',
              is_active: true
            });
            console.log('✅ Admin user created successfully!');
          } catch (err) {
            if (err.code === 11000) {
              console.error('❌ Username or email already exists');
            } else {
              console.error('❌ Error:', err.message);
            }
          } finally {
            rl.close();
            await mongoose.disconnect();
            process.exit(0);
          }
        });
      });
    });
  } catch (error) {
    console.error('\n❌ MongoDB Connection Failed!');
    console.error('   Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Is MongoDB running? Check with: mongosh');
    console.error('   2. Check your MONGO_URI in .env file');
    console.error('   3. For Windows: MongoDB might not be installed or running');
    console.error('   4. Consider using MongoDB Atlas (cloud) - see WINDOWS_SETUP.md');
    console.error('\n   Common connection strings:');
    console.error('   - Local (no auth): mongodb://localhost:27017/kyc_db');
    console.error('   - Local (with auth): mongodb://username:password@localhost:27017/kyc_db');
    console.error('   - Atlas: mongodb+srv://username:password@cluster.mongodb.net/kyc_db');
    process.exit(1);
  }
}

createAdmin();
