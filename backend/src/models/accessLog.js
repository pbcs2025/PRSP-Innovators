const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  user_id:        { type: mongoose.Schema.Types.ObjectId },
  username:       String,
  action:         String,
  field_searched: String,
  kyc_record_id:  { type: mongoose.Schema.Types.ObjectId },
  ip_address:     String,
  user_agent:     String,
  result_found:   Boolean,
  anomaly_flag:   { type: Boolean, default: false },
  created_at:     { type: Date, default: Date.now }
});

const AccessLog = mongoose.model('AccessLog', logSchema);

async function insertLog(data) {
  await AccessLog.create(data);
}

async function queryLogs({ user_id, action, anomaly_only, page = 1, limit = 20 }) {
  const query = {};
  if (user_id)     query.user_id     = user_id;
  if (action)      query.action      = action;
  if (anomaly_only) query.anomaly_flag = true;

  const skip  = (page - 1) * limit;
  const total = await AccessLog.countDocuments(query);
  const logs  = await AccessLog.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).lean();

  return {
    total,
    logs: logs.map(l => ({
      ...l,
      id: l._id.toString(), _id: undefined,
      user_id:       l.user_id?.toString(),
      kyc_record_id: l.kyc_record_id?.toString()
    }))
  };
}

module.exports = { insertLog, queryLogs };
