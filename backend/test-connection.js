#!/usr/bin/env node

/**
 * Test script to verify MongoDB and Redis connections
 * Usage: node test-connection.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Redis = require('ioredis');

async function testMongoDB() {
  console.log('\n🔌 Testing MongoDB connection...');
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/kyc_db';
  console.log(`   URI: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
  
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB: Connected successfully!');
    
    // Test a simple operation
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`   Found ${collections.length} collections`);
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error('❌ MongoDB: Connection failed!');
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

async function testRedis() {
  console.log('\n🔌 Testing Redis connection...');
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  console.log(`   URL: ${redisUrl.replace(/\/\/.*@/, '//***:***@')}`);
  
  try {
    const redis = new Redis(redisUrl, {
      connectTimeout: 5000,
      retryStrategy: () => null, // Don't retry on failure
    });
    
    const result = await redis.ping();
    console.log('✅ Redis: Connected successfully!');
    console.log(`   Response: ${result}`);
    
    await redis.quit();
    return true;
  } catch (error) {
    console.error('❌ Redis: Connection failed!');
    console.error(`   Error: ${error.message}`);
    console.error('   ⚠️  Note: Anomaly detection will not work, but other features will.');
    return false;
  }
}

async function main() {
  console.log('🧪 Testing Database Connections\n');
  console.log('=' .repeat(50));
  
  const mongoOk = await testMongoDB();
  const redisOk = await testRedis();
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Summary:');
  console.log(`   MongoDB: ${mongoOk ? '✅ OK' : '❌ FAILED'}`);
  console.log(`   Redis:   ${redisOk ? '✅ OK' : '❌ FAILED (optional)'}`);
  
  if (!mongoOk) {
    console.log('\n💡 MongoDB is required! Please:');
    console.log('   1. Check if MongoDB is running');
    console.log('   2. Verify MONGO_URI in .env file');
    console.log('   3. See WINDOWS_SETUP.md for help');
    process.exit(1);
  }
  
  if (!redisOk) {
    console.log('\n⚠️  Redis is optional (for anomaly detection)');
    console.log('   The system will work without it, but anomaly detection will be disabled.');
  }
  
  console.log('\n✅ Ready to create admin user! Run: node create-admin.js\n');
  process.exit(0);
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
