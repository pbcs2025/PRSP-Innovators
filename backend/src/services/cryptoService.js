const crypto = require('crypto');
const config = require('../config');

// These should be validated in config.js, but add safety check here too
if (!config.SERVER_INDEX_KEY || !config.MASTER_KEY) {
  throw new Error('SERVER_INDEX_KEY and MASTER_KEY must be set in environment variables');
}

const SERVER_INDEX_KEY = Buffer.from(config.SERVER_INDEX_KEY, 'hex');
const MASTER_KEY       = Buffer.from(config.MASTER_KEY, 'hex');

function computeServerHash(trapdoor) {
  return crypto.createHmac('sha256', SERVER_INDEX_KEY)
    .update(trapdoor, 'hex')
    .digest('hex');
}

function wrapDEK(dek) {
  const iv     = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', MASTER_KEY, iv);
  const enc    = Buffer.concat([cipher.update(dek), cipher.final()]);
  const tag    = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

function unwrapDEK(wrappedB64) {
  const raw    = Buffer.from(wrappedB64, 'base64');
  const iv     = raw.slice(0, 12);
  const tag    = raw.slice(12, 28);
  const enc    = raw.slice(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', MASTER_KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]);
}

module.exports = { computeServerHash, wrapDEK, unwrapDEK };
