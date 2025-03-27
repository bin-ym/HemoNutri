// backend/routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const auth = require('../middleware/auth');

router.get('/food-logs', auth(['patient']), patientController.getFoodLogs);
router.post('/food-logs', auth(['patient']), patientController.addFoodLog);
router.get('/resources', auth(['patient', 'provider']), patientController.getResources);
router.get('/notifications', auth(['patient', 'provider']), patientController.getNotifications);
router.get('/meal-plan', auth(['patient']), patientController.getMealPlan);

module.exports = router;