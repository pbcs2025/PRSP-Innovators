const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username:      { type: String, required: true, unique: true },
  email:         { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role:          { type: String, enum: ['admin', 'officer', 'auditor'], required: true },
  is_active:     { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const User = mongoose.model('User', userSchema);

async function createUser(username, email, password, role) {
  const password_hash = await bcrypt.hash(password, 12);
  const user = await User.create({ username, email, password_hash, role });
  return user._id.toString();
}

async function findUserByUsername(username) {
  return User.findOne({ username, is_active: true }).lean();
}

async function findUserById(id) {
  return User.findById(id).lean();
}

async function verifyPassword(user, password) {
  return bcrypt.compare(password, user.password_hash);
}

async function listUsers(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const users = await User.find({}, { password_hash: 0 }).skip(skip).limit(limit).lean();
  return users.map(u => ({ ...u, id: u._id.toString(), _id: undefined }));
}

async function deactivateUser(userId) {
  await User.findByIdAndUpdate(userId, { is_active: false });
}

async function activateUser(userId) {
  await User.findByIdAndUpdate(userId, { is_active: true });
}

module.exports = { createUser, findUserByUsername, findUserById, verifyPassword, listUsers, deactivateUser, activateUser };
