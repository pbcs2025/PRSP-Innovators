const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user_id:      { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  count:        { type: Number, default: 0 },
  window_start: { type: Date, default: Date.now }
});

const SearchRateLimit = mongoose.model('SearchRateLimit', schema);

const SEARCH_LIMIT   = 10;
const WINDOW_MS      = 60 * 1000;

/**
 * Check and increment search count. Returns true if rate limit exceeded (anomaly).
 * Uses MongoDB so it works without Redis.
 */
async function checkAndIncrementSearchCount(user_id) {
  const now = new Date();
  const userId = typeof user_id === 'string' ? new mongoose.Types.ObjectId(user_id) : user_id;

  const doc = await SearchRateLimit.findOneAndUpdate(
    { user_id: userId },
    { $setOnInsert: { count: 0, window_start: now } },
    { upsert: true, new: true }
  ).lean();

  const elapsed = now - new Date(doc.window_start);
  let count = doc.count;

  if (elapsed >= WINDOW_MS) {
    // Window expired, reset and count this as 1st request
    await SearchRateLimit.updateOne(
      { user_id: userId },
      { $set: { count: 1, window_start: now } }
    );
    return false; // first search in new window
  }

  const updated = await SearchRateLimit.findOneAndUpdate(
    { user_id: userId },
    { $inc: { count: 1 } },
    { new: true }
  ).lean();

  return (updated?.count ?? 0) > SEARCH_LIMIT;
}

module.exports = { checkAndIncrementSearchCount };
