const { insertKYCRecord, getKYCRecordById } = require('../models/kycRecord');
const { insertIndexEntry, findRecordIdByHash, ALLOWED_FIELDS } = require('../models/searchIndex');
const { computeServerHash } = require('./cryptoService');

async function storeKYCWithIndex({ encrypted_payload, iv, auth_tag, encrypted_dek, index_entries, created_by_id }) {
  const record_id = await insertKYCRecord({ encrypted_payload, iv, auth_tag, encrypted_dek, created_by_id });
  for (const entry of index_entries) {
    const { field_type, trapdoor } = entry;
    if (!ALLOWED_FIELDS.has(field_type) || !trapdoor) continue;
    const server_hash = computeServerHash(trapdoor);
    await insertIndexEntry(record_id, field_type, server_hash);
  }
  return record_id;
}

async function searchByTrapdoor(field_type, trapdoor) {
  if (!ALLOWED_FIELDS.has(field_type)) return null;
  const server_hash = computeServerHash(trapdoor);
  const record_id   = await findRecordIdByHash(field_type, server_hash);
  if (!record_id) return null;
  return getKYCRecordById(record_id);
}

module.exports = { storeKYCWithIndex, searchByTrapdoor };
