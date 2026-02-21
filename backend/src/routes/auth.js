const express = require('express');
const jwt     = require('jsonwebtoken');
const { createUser, findUserByUsername, verifyPassword } = require('../models/user');
const verifyJWT     = require('../middleware/verifyJWT');
const rolesRequired = require('../middleware/rbac');
const config = require('../config');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    const user = await findUserByUsername(username);
    if (!user || !(await verifyPassword(user, password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { sub: user._id.toString(), username: user.username, role: user.role },
      config.JWT_SECRET_KEY,
      { expiresIn: '8h' }
    );
    res.json({
      access_token:      token,
      role:              user.role,
      username:          user.username,
      shared_client_key: config.SHARED_CLIENT_KEY   // same key for ALL users
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register', verifyJWT, rolesRequired('admin'), async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields required' });
    }
    if (!['admin', 'officer', 'auditor'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const uid = await createUser(username, email, password, role);
    res.status(201).json({ user_id: uid, message: 'User created' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
