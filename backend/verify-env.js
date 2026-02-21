#!/usr/bin/env node

/**
 * Verify .env file has all required variables
 * Usage: node verify-env.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

console.log('🔍 Verifying .env file...\n');

// Check if .env exists
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.error(`   Expected location: ${envPath}`);
  console.error('\n💡 Run: node setup-env.js to create it\n');
  process.exit(1);
}

console.log(`✅ .env file found at: ${envPath}\n`);

// Required variables
const requiredVars = {
  'SERVER_INDEX_KEY': { format: 'hex', length: 64, description: '32-byte hex key for server-side hashing' },
  'MASTER_KEY': { format: 'hex', length: 64, description: '32-byte hex key for DEK wrapping' },
  'JWT_SECRET_KEY': { format: 'any', description: 'JWT signing secret' },
  'SHARED_CLIENT_KEY': { format: 'hex', length: 64, description: '32-byte hex key shared by all clients' }
};

const optionalVars = {
  'PORT': { default: '5000', description: 'Server port' },
  'MONGO_URI': { default: 'mongodb://localhost:27017/kyc_db', description: 'MongoDB connection string' },
  'REDIS_URL': { default: 'redis://localhost:6379', description: 'Redis connection URL' }
};

console.log('📋 Checking required variables:\n');

let allValid = true;
const hexPattern = /^[0-9a-fA-F]{64}$/;

for (const [varName, config] of Object.entries(requiredVars)) {
  const value = process.env[varName];
  
  if (!value) {
    console.error(`❌ ${varName}: MISSING`);
    allValid = false;
    continue;
  }
  
  if (value.trim() === '') {
    console.error(`❌ ${varName}: EMPTY`);
    allValid = false;
    continue;
  }
  
  // Check format for hex keys
  if (config.format === 'hex' && !hexPattern.test(value)) {
    console.error(`❌ ${varName}: INVALID FORMAT`);
    console.error(`   Expected: 64 hex characters (0-9, a-f)`);
    console.error(`   Got: ${value.length} characters`);
    console.error(`   Value: ${value.substring(0, 20)}...`);
    allValid = false;
    continue;
  }
  
  // Check length for hex keys
  if (config.format === 'hex' && value.length !== config.length) {
    console.error(`❌ ${varName}: WRONG LENGTH`);
    console.error(`   Expected: ${config.length} characters`);
    console.error(`   Got: ${value.length} characters`);
    allValid = false;
    continue;
  }
  
  console.log(`✅ ${varName}: OK (${value.substring(0, 16)}...)`);
}

console.log('\n📋 Optional variables:\n');

for (const [varName, config] of Object.entries(optionalVars)) {
  const value = process.env[varName] || config.default;
  const status = process.env[varName] ? '✅' : '⚠️ ';
  console.log(`${status} ${varName}: ${value} ${!process.env[varName] ? '(using default)' : ''}`);
}

console.log('\n' + '='.repeat(50));

if (allValid) {
  console.log('\n✅ All required environment variables are set correctly!');
  console.log('   You can now start the server with: npm run dev\n');
} else {
  console.log('\n❌ Some required variables are missing or invalid!');
  console.log('\n💡 To fix:');
  console.log('   1. Run: node setup-env.js (interactive setup)');
  console.log('   2. Or run: node generate-keys.js (generate keys only)');
  console.log('   3. Make sure all keys are in backend/.env file\n');
  process.exit(1);
}
