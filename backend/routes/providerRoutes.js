const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const providerController = require("../controllers/providerController");
const Message = require("../models/Message");

// Middleware: Only providers can access
const providerAuth = auth(["provider"]);

/* ─────── PATIENT MANAGEMENT ─────── */
router.get("/patients", providerAuth, providerController.getPatients);
router.get("/patient/:id", providerAuth, providerController.getPatientDetails);
router.put("/patient/:id", providerAuth, providerController.updatePatient);
router.delete("/patient/:id", providerAuth, providerController.deletePatient);

/* ─────── FOOD LOGS ─────── */
router.get("/patient/:id/food-logs", providerAuth, providerController.getPatientFoodLogs);
router.get("/logs", providerAuth, providerController.getAllLogs);

/* ─────── ASSESSMENT ─────── */
router.get("/patient/:id/assessment", providerAuth, providerController.getPatientAssessment);
router.put("/patient/:id/assessment", providerAuth, providerController.updatePatientAssessment);

/* ─────── MESSAGES ─────── */
// All messages for provider
router.get("/messages", providerAuth, providerController.getMessages);
// Messages with a specific patient
router.get("/patient/:patientId/messages", providerAuth, providerController.getPatientMessages);
// Send a message to a patient
router.post("/message/:id", providerAuth, providerController.sendMessage);
// Mark all messages as read
router.put("/messages/read", providerAuth, async (req, res) => {
  try {
    const result = await Message.updateMany(
      { recipient: req.user.id, read: false },
      { $set: { read: true } }
    );
    console.log('Messages marked as read', { providerId: req.user.id, modifiedCount: result.modifiedCount });
    res.json({ message: "Messages marked as read", updatedCount: result.modifiedCount });
  } catch (error) {
    console.error('Error marking messages as read:', error.stack);
    res.status(500).json({ error: "Failed to update messages", details: error.message });
  }
});

/* ─────── MEAL PLANS ─────── */
router.get("/meal-plans", providerAuth, providerController.getMealPlans);
router.post("/meal-plan/:id", providerAuth, providerController.saveMealPlan);
router.put("/meal-plan/:id", providerAuth, providerController.updateMealPlan);
router.delete("/meal-plan/:id", providerAuth, providerController.deleteMealPlan);

/* ─────── EDUCATION RESOURCES ─────── */
router.get("/education-resources", providerAuth, providerController.getEducationResources);
router.post("/education-resource", providerAuth, providerController.createEducationResource);
router.put("/education-resource/:id", providerAuth, providerController.updateEducationResource);
router.delete("/education-resource/:id", providerAuth, providerController.deleteEducationResource);

/* ─────── CONSULTATIONS ─────── */
router.post("/consultation/:patientId", providerAuth, providerController.scheduleConsultation);
router.get("/consultation/:patientId", providerAuth, providerController.getConsultations);

module.exports = router;