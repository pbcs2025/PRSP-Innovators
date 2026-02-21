require('dotenv').config();

// Required environment variables
const requiredVars = [
  'SERVER_INDEX_KEY',
  'MASTER_KEY',
  'JWT_SECRET_KEY',
  'SHARED_CLIENT_KEY'
];

// Check for missing required variables
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('\n❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n💡 To fix this:');
  console.error('   1. Make sure you have a .env file in the backend directory');
  console.error('   2. Run: node generate-keys.js');
  console.error('   3. Copy the generated keys to your .env file');
  console.error('   4. Or copy .env.example to .env and fill in the values\n');
  process.exit(1);
}

// Validate key format (should be 64 hex characters for 32-byte keys)
const hexKeyPattern = /^[0-9a-fA-F]{64}$/;
const invalidKeys = [];

if (!hexKeyPattern.test(process.env.SERVER_INDEX_KEY)) {
  invalidKeys.push('SERVER_INDEX_KEY (must be 64 hex characters)');
}
if (!hexKeyPattern.test(process.env.MASTER_KEY)) {
  invalidKeys.push('MASTER_KEY (must be 64 hex characters)');
}
if (!hexKeyPattern.test(process.env.SHARED_CLIENT_KEY)) {
  invalidKeys.push('SHARED_CLIENT_KEY (must be 64 hex characters)');
}

if (invalidKeys.length > 0) {
  console.error('\n❌ Invalid key format:');
  invalidKeys.forEach(key => console.error(`   - ${key}`));
  console.error('\n💡 Run: node generate-keys.js to generate valid keys\n');
  process.exit(1);
}

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/kyc_db',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  SERVER_INDEX_KEY: process.env.SERVER_INDEX_KEY,
  MASTER_KEY: process.env.MASTER_KEY,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  SHARED_CLIENT_KEY: process.env.SHARED_CLIENT_KEY
};
