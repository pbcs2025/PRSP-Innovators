const express = require('express');
const { storeKYCWithIndex, searchByTrapdoor } = require('../services/sseService');
const { checkAndRecordSearch } = require('../services/anomalyService');
const { insertLog } = require('../models/accessLog');
const { getKYCRecordById } = require('../models/kycRecord');
const verifyJWT     = require('../middleware/verifyJWT');
const rolesRequired = require('../middleware/rbac');

const router = express.Router();

router.post('/add', verifyJWT, rolesRequired('admin', 'officer'), async (req, res) => {
  try {
    const { encrypted_payload, iv, auth_tag, encrypted_dek, index } = req.body;
    // auth_tag is optional because Web Crypto includes the tag in the ciphertext
    if (!encrypted_payload || !iv || !encrypted_dek) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const record_id = await storeKYCWithIndex({
      encrypted_payload,
      iv,
      auth_tag: auth_tag || '',
      encrypted_dek,
      index_entries: index || [],
      created_by_id: req.user.sub
    });
    await insertLog({
      user_id: req.user.sub, username: req.user.username,
      action: 'add_kyc', kyc_record_id: record_id, 
      ip_address: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      user_agent: req.headers['user-agent'] || 'unknown',
      result_found: true
    });
    res.status(201).json({ record_id, message: 'KYC stored securely' });
  } catch (error) {
    console.error('Add KYC error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/search', verifyJWT, rolesRequired('admin', 'officer', 'auditor'), async (req, res) => {
  try {
    const { field_type, trapdoor } = req.body;
    if (!field_type || !trapdoor) {
      return res.status(400).json({ error: 'field_type and trapdoor required' });
    }
    const role = req.user.role;

    // Rate limit check FIRST – block before running search
    const is_anomaly = await checkAndRecordSearch(req.user.sub);
    if (is_anomaly) {
      await insertLog({
        user_id: req.user.sub, username: req.user.username,
        action: 'search_blocked', field_searched: field_type,
        kyc_record_id: null,
        ip_address: req.ip || req.headers['x-forwarded-for'] || 'unknown',
        user_agent: req.headers['user-agent'] || 'unknown',
        result_found: false,
        anomaly_flag: true
      });
      return res.status(429).json({
        error: 'Too many searches. You have been temporarily blocked (max 10 per minute). This has been reported to administrators.'
      });
    }

    const record = await searchByTrapdoor(field_type, trapdoor);

    await insertLog({
      user_id: req.user.sub, username: req.user.username,
      action: 'search', field_searched: field_type,
      kyc_record_id: record?.id || null,
      ip_address: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      user_agent: req.headers['user-agent'] || 'unknown',
      result_found: !!record,
      anomaly_flag: false
    });

    if (!record) return res.json({ found: false });

    const response = {
      found: true, record_id: record.id,
      encrypted_payload: record.encrypted_payload,
      iv: record.iv, auth_tag: record.auth_tag
    };
    if (role === 'admin' || role === 'officer') {
      response.encrypted_dek = record.encrypted_dek;
    }
    res.json(response);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:record_id', verifyJWT, rolesRequired('admin', 'officer'), async (req, res) => {
  try {
    const record = await getKYCRecordById(req.params.record_id);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (error) {
    console.error('Get record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
