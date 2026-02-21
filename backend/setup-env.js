#!/usr/bin/env node

/**
 * Setup script to create .env file with generated keys
 * Usage: node setup-env.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function generateKey() {
  return crypto.randomBytes(32).toString('hex');
}

function generateJWTSecret() {
  return crypto.randomBytes(32).toString('base64');
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🔐 KYC SSE System - Environment Setup\n');
  console.log('='.repeat(50));
  
  const envPath = path.join(__dirname, '.env');
  
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    const overwrite = await question('\n⚠️  .env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('❌ Cancelled. Existing .env file preserved.');
      rl.close();
      process.exit(0);
    }
  }
  
  console.log('\n📝 Please provide the following information:\n');
  
  // Get MongoDB URI
  const mongoUri = await question('MongoDB URI (default: mongodb://localhost:27017/kyc_db): ') || 'mongodb://localhost:27017/kyc_db';
  
  // Get Redis URL
  const redisUrl = await question('Redis URL (default: redis://localhost:6379): ') || 'redis://localhost:6379';
  
  // Generate keys
  console.log('\n🔑 Generating secure keys...');
  const serverIndexKey = generateKey();
  const masterKey = generateKey();
  const jwtSecret = generateJWTSecret();
  const sharedClientKey = generateKey();
  
  // Create .env content
  const envContent = `PORT=5000
MONGO_URI=${mongoUri}
REDIS_URL=${redisUrl}

# 32-byte keys as 64-char hex (generated automatically)
SERVER_INDEX_KEY=${serverIndexKey}
MASTER_KEY=${masterKey}
JWT_SECRET_KEY=${jwtSecret}

# THE SHARED CLIENT KEY — same for ALL authorized users
SHARED_CLIENT_KEY=${sharedClientKey}
`;

  // Write .env file
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!\n');
    console.log('📋 Generated keys:');
    console.log(`   SERVER_INDEX_KEY: ${serverIndexKey.substring(0, 16)}...`);
    console.log(`   MASTER_KEY: ${masterKey.substring(0, 16)}...`);
    console.log(`   JWT_SECRET_KEY: ${jwtSecret.substring(0, 16)}...`);
    console.log(`   SHARED_CLIENT_KEY: ${sharedClientKey.substring(0, 16)}...`);
    console.log('\n✅ Setup complete! You can now:');
    console.log('   1. Test connection: node test-connection.js');
    console.log('   2. Create admin: node create-admin.js');
    console.log('   3. Start server: npm run dev\n');
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
    process.exit(1);
  }
  
  rl.close();
}

main().catch(err => {
  console.error('Unexpected error:', err);
  rl.close();
  process.exit(1);
});
