const mongoose = require('mongoose');

async function initIndexes() {
  try {
    const db = mongoose.connection.db;

    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });

    await db.collection('kyc_records').createIndex({ created_at: -1 });
    await db.collection('kyc_records').createIndex({ created_by: 1 });
    await db.collection('kyc_records').createIndex({ is_active: 1 });

    await db.collection('search_index').createIndex({ keyword_hash: 1 });
    await db.collection('search_index').createIndex(
      { field_type: 1, keyword_hash: 1 }
    );
    await db.collection('search_index').createIndex({ kyc_record_id: 1 });

    await db.collection('access_logs').createIndex({ user_id: 1, created_at: -1 });
    await db.collection('access_logs').createIndex({ anomaly_flag: 1, created_at: -1 });
    await db.collection('access_logs').createIndex({ action: 1, created_at: -1 });
    await db.collection('access_logs').createIndex({ created_at: 1 }, { expireAfterSeconds: 31536000 });

    console.log('✅ MongoDB indexes initialized');
  } catch (error) {
    console.error('❌ Error initializing indexes:', error);
    throw error;
  }
}

module.exports = { initIndexes };
