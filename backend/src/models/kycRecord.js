const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  encrypted_payload: { type: String, required: true },
  iv:                { type: String, required: true },
  // auth_tag is not used separately because Web Crypto includes the tag in the ciphertext
  auth_tag:          { type: String, required: false, default: '' },
  encrypted_dek:     { type: String, required: true },
  created_by:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  is_active:         { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const KYCRecord = mongoose.model('KYCRecord', kycSchema);

async function insertKYCRecord({ encrypted_payload, iv, auth_tag, encrypted_dek, created_by_id }) {
  const record = await KYCRecord.create({
    encrypted_payload, iv, auth_tag, encrypted_dek,
    created_by: created_by_id
  });
  return record._id.toString();
}

async function getKYCRecordById(id) {
  const doc = await KYCRecord.findOne({ _id: id, is_active: true }).lean();
  if (!doc) return null;
  return { ...doc, id: doc._id.toString(), _id: undefined, created_by: doc.created_by?.toString() };
}

module.exports = { insertKYCRecord, getKYCRecordById };
