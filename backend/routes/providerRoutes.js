const express = require('express');
const { getPatientLogs } = require('../controllers/providerController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/logs', auth(['provider']), getPatientLogs);

module.exports = router;