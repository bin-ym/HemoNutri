const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const providerController = require('../controllers/providerController');

// Get Patients
router.get('/patients', auth(['provider']), providerController.getPatients);

// Get Patient Details
router.get('/patient/:id', auth(['provider']), providerController.getPatientDetails);

// Get Patient Food Logs
router.get('/patient/:id/food-logs', auth(['provider']), providerController.getPatientFoodLogs);

// Get Patient Assessment
router.get('/patient/:id/assessment', auth(['provider']), providerController.getPatientAssessment);

// Get All Logs for Provider's Patients
router.get('/logs', auth(['provider']), providerController.getAllLogs);

// Get Messages (All)
router.get('/messages', auth(['provider']), providerController.getMessages);

// Get Messages with Specific Patient
router.get('/messages/:patientId', auth(['provider']), providerController.getPatientMessages);

// Send Message to Patient
router.post('/message/:id', auth(['provider']), providerController.sendMessage);

// Get Meal Plans
router.get('/meal-plans', auth(['provider']), providerController.getMealPlans);

// Save Meal Plan
router.post('/meal-plan/:id', auth(['provider']), providerController.saveMealPlan);

// Update Meal Plan
router.put('/meal-plans/:id', auth(['provider']), providerController.updateMealPlan);

// Delete Meal Plan
router.delete('/meal-plans/:id', auth(['provider']), providerController.deleteMealPlan);

// Get Education Resources
router.get('/education', auth(['provider']), providerController.getEducationResources);

// Add Education Resource
router.post('/education', auth(['provider']), providerController.addEducationResource);

// Update Patient
router.put('/patients/:id', auth(['provider']), providerController.updatePatient);

// Delete Patient
router.delete('/patients/:id', auth(['provider']), providerController.deletePatient);

module.exports = router;