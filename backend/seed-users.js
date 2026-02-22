#!/usr/bin/env node

/**
 * Seed script to create default users for all roles
 * Usage: node seed-users.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const users = [
  {
    username: 'admin',
    email: 'admin@bank.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    username: 'officer1',
    email: 'officer1@bank.com',
    password: 'officer1123',
    role: 'officer'
  },
  {
    username: 'auditor1',
    email: 'auditor1@bank.com',
    password: 'auditor1123',
    role: 'auditor'
  }
];

async function seedUsers() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/kyc_db';
    console.log('🔌 Connecting to MongoDB...');
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      password_hash: { type: String, required: true },
      role: { type: String, enum: ['admin', 'officer', 'auditor'], required: true },
      is_active: { type: Boolean, default: true }
    }, { timestamps: true }));

    console.log('\n📝 Creating users...\n');

    for (const userData of users) {
      try {
        // Check if user already exists
        const existing = await User.findOne({ username: userData.username });
        if (existing) {
          console.log(`⚠️  User '${userData.username}' already exists, skipping...`);
          continue;
        }

        const password_hash = await bcrypt.hash(userData.password, 12);
        await User.create({
          username: userData.username,
          email: userData.email,
          password_hash,
          role: userData.role,
          is_active: true
        });
        console.log(`✅ Created ${userData.role}: ${userData.username}`);
      } catch (err) {
        if (err.code === 11000) {
          console.log(`⚠️  User '${userData.username}' already exists, skipping...`);
        } else {
          console.error(`❌ Error creating ${userData.username}:`, err.message);
        }
      }
    }

    console.log('\n✅ User seeding completed!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin:   username=admin, password=admin123');
    console.log('   Officer: username=officer1, password=officer1123');
    console.log('   Auditor: username=auditor1, password=auditor1123\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Is MongoDB running? Check with: mongosh');
    console.error('   2. Check your MONGO_URI in .env file');
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedUsers();
