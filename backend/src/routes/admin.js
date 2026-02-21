const express = require('express');
const { listUsers, deactivateUser } = require('../models/user');
const { queryLogs } = require('../models/accessLog');
const verifyJWT     = require('../middleware/verifyJWT');
const rolesRequired = require('../middleware/rbac');

const router = express.Router();

router.get('/users', verifyJWT, rolesRequired('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const users = await listUsers(page, limit);
    res.json({ users });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/users/:id/deactivate', verifyJWT, rolesRequired('admin'), async (req, res) => {
  try {
    await deactivateUser(req.params.id);
    res.json({ message: 'User deactivated' });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/anomalies', verifyJWT, rolesRequired('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await queryLogs({ anomaly_only: true, page, limit });
    res.json(result);
  } catch (error) {
    console.error('Get anomalies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
