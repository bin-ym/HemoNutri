const express = require('express');
const router = express.Router();
const { submitContactForm } = require('../controllers/contactController');

router.post('/api/contact', submitContactForm);

module.exports = router;