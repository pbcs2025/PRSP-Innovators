const mongoose = require('mongoose');

const searchIndexSchema = new mongoose.Schema({
  kyc_record_id: { type: mongoose.Schema.Types.ObjectId, ref: 'KYCRecord' },
  field_type:    { type: String, enum: ['pan', 'aadhaar', 'name', 'passport'] },
  keyword_hash:  { type: String },
  created_at:    { type: Date, default: Date.now }
});

const SearchIndex = mongoose.model('SearchIndex', searchIndexSchema);

const ALLOWED_FIELDS = new Set(['pan', 'aadhaar', 'name', 'passport']);

async function insertIndexEntry(kyc_record_id, field_type, keyword_hash) {
  if (!ALLOWED_FIELDS.has(field_type)) return;
  await SearchIndex.create({ kyc_record_id, field_type, keyword_hash });
}

async function findRecordIdByHash(field_type, keyword_hash) {
  // Return the first matching record (multiple records can share the same keyword)
  const doc = await SearchIndex.findOne({ field_type, keyword_hash }).lean();
  return doc ? doc.kyc_record_id.toString() : null;
}

module.exports = { insertIndexEntry, findRecordIdByHash, ALLOWED_FIELDS };
