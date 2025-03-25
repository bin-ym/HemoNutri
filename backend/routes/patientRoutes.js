const express = require('express');
const { getLogs, addLog } = require('../controllers/patientController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/logs', auth, getLogs);
router.post('/log', auth, addLog);

module.exports = router;