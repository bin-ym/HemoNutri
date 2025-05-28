// backend/routes/providerRoutes.js
const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const auth = require("../middleware/auth");
const providerController = require("../controllers/providerController");

// Get Patients
router.get("/patients", auth(["provider"]), providerController.getPatients);

// Get Patient Details
router.get("/patient/:id", auth(["provider"]), providerController.getPatientDetails);

// Get Patient Food Logs
router.get("/patient/:id/food-logs", auth(["provider"]), providerController.getPatientFoodLogs);

// Get Patient Assessment
router.get("/patient/:id/assessment", auth(["provider"]), providerController.getPatientAssessment);

// Get All Logs for Provider's Patients
router.get("/logs", auth(["provider"]), providerController.getAllLogs);

// Get Messages (All)
router.get("/messages", auth(["provider"]), providerController.getMessages);

// Get Messages with Specific Patient
router.get("/messages/:patientId", auth(["provider"]), providerController.getPatientMessages);

// Send Message to Patient
router.post("/message/:id", auth(["provider"]), providerController.sendMessage);

// Mark Messages as Read (Provider)
router.put("/messages/read", auth(["provider"]), async (req, res) => {
  try {
    const result = await Message.updateMany(
      { recipient: req.user.id, read: false },
      { $set: { read: true } }
    );
    console.log('providerController: Messages marked as read', { providerId: req.user.id, modifiedCount: result.modifiedCount });
    res.json({ message: "Messages marked as read", modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error('providerController: Mark read error:', err.stack);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Get Meal Plans
router.get("/meal-plans", auth(["provider"]), providerController.getMealPlans);

// Save Meal Plan
router.post("/meal-plan/:id", auth(["provider"]), providerController.saveMealPlan);

// Update Meal Plan
router.put("/meal-plans/:id", auth(["provider"]), providerController.updateMealPlan);

// Delete Meal Plan
router.delete("/meal-plans/:id", auth(["provider"]), providerController.deleteMealPlan);

// Get Education Resources
router.get("/education", auth(["provider"]), providerController.getEducationResources);

// Add Education Resource
router.post("/education", auth(["provider"]), providerController.createEducationResource);

// Update Education Resource
router.put("/education/:id", auth(["provider"]), providerController.updateEducationResource);

// Delete Education Resource
router.delete("/education/:id", auth(["provider"]), providerController.deleteEducationResource);

// Update Patient
router.put("/patients/:id", auth(["provider"]), providerController.updatePatient);

// Delete Patient
router.delete("/patients/:id", auth(["provider"]), providerController.deletePatient);

module.exports = router;