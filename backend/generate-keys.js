#!/usr/bin/env node

/**
 * Helper script to generate secure 32-byte hex keys for the KYC SSE system
 * Usage: node generate-keys.js
 */

const crypto = require('crypto');

function generateKey() {
  return crypto.randomBytes(32).toString('hex');
}

console.log('🔐 Generating secure keys for KYC SSE System\n');
console.log('Copy these into your .env file:\n');
console.log(`SERVER_INDEX_KEY=${generateKey()}`);
console.log(`MASTER_KEY=${generateKey()}`);
console.log(`JWT_SECRET_KEY=${crypto.randomBytes(32).toString('base64')}`);
console.log(`SHARED_CLIENT_KEY=${generateKey()}`);
console.log('\n✅ Keys generated! Keep them secure and never commit them to version control.');
