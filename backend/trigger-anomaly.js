/**
 * Script to trigger anomaly records for testing.
 *
 * Prerequisites:
 * 1. Redis must be running (docker run -d -p 6379:6379 redis)
 * 2. Backend must be running (npm run dev)
 * 3. You need at least one KYC record to search for
 *
 * Usage:
 *   node trigger-anomaly.js <username> <password>
 *
 * This script performs 12 KYC searches rapidly. Searches 11 and 12 will be
 * flagged as anomalies (limit is 10 per 60 seconds per user).
 */

require('dotenv').config();
const axios = require('axios');

const BASE = process.env.API_BASE || 'http://localhost:5000';

async function main() {
  const [username, password] = process.argv.slice(2);
  if (!username || !password) {
    console.log('Usage: node trigger-anomaly.js <username> <password>');
    console.log('');
    console.log('Example: node trigger-anomaly.js admin Admin@123');
    process.exit(1);
  }

  // 1. Login
  console.log('Logging in as', username, '...');
  const loginRes = await axios.post(`${BASE}/auth/login`, { username, password });
  const { access_token } = loginRes.data;
  const headers = { Authorization: `Bearer ${access_token}` };

  // 2. Get a valid trapdoor – we need to search for something that might exist.
  //    Use a base64-encoded trapdoor. For "test" the trapdoor depends on SHARED_CLIENT_KEY.
  //    Since we don't have the key here, we'll use a dummy trapdoor – search will return "not found"
  //    but the anomaly will still be logged (the log is created before we check if record exists).
  const trapdoor = Buffer.from('dummy-trapdoor-for-anomaly-test').toString('base64');

  // 3. Perform 12 searches rapidly
  console.log('Performing 12 searches to trigger anomaly (limit is 10/60s)...');
  const searches = Array(12)
    .fill(null)
    .map((_, i) =>
      axios.post(
        `${BASE}/kyc/search`,
        { field_type: 'name', trapdoor },
        { headers }
      )
    );

  await Promise.all(searches);
  console.log('Done. Searches 11 and 12 should be flagged as anomalies.');
  console.log('');
  console.log('Log in as Admin and open the Anomalies tab to see them.');
}

main().catch((err) => {
  console.error(err.response?.data || err.message);
  process.exit(1);
});
