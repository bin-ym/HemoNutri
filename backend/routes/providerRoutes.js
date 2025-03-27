const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getPatients } = require('../controllers/providerController');

router.get('/patients', auth(['provider']), getPatients);

module.exports = router;