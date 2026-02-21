const express = require('express');
const { queryLogs } = require('../models/accessLog');
const verifyJWT     = require('../middleware/verifyJWT');
const rolesRequired = require('../middleware/rbac');

const router = express.Router();

router.get('/', verifyJWT, rolesRequired('admin', 'auditor'), async (req, res) => {
  try {
    const { user_id, action, anomaly_only, page = 1, limit = 20 } = req.query;
    const result = await queryLogs({
      user_id, action,
      anomaly_only: anomaly_only === 'true',
      page: parseInt(page), limit: parseInt(limit)
    });
    res.json(result);
  } catch (error) {
    console.error('Query logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
