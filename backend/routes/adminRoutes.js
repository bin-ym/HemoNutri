// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const notificationController = require("../controllers/notificationController");
const auth = require("../middleware/auth");

router.get("/users", auth(["admin"]), adminController.getUsers);
router.delete("/users/:id", auth(["admin"]), adminController.deleteUser);
router.get("/resources", auth(["admin"]), adminController.getResources);
router.post("/resources", auth(["admin"]), adminController.createResource);
router.put("/resources/:id", auth(["admin"]), adminController.updateResource);
router.delete("/resources/:id", auth(["admin"]), adminController.deleteResource);
router.get("/report", auth(["admin"]), adminController.getUsageReport);
router.post("/notifications", auth(["admin"]), notificationController.createNotification);
router.get("/notifications", auth(["patient", "provider", "admin"]), notificationController.getNotifications);
router.get("/notifications/all", auth(["admin"]), adminController.getNotifications); // Differentiate admin route
router.put("/notifications/:notificationId/read", auth(["patient", "provider", "admin"]), notificationController.markNotificationRead);
router.get("/activity", auth(["admin"]), adminController.getUserActivity);
router.post("/add-user", auth(["admin"]), adminController.addUser);
router.get("/backup", auth(["admin"]), adminController.createBackup);
router.get("/backup/history", auth(["admin"]), adminController.getBackupHistory);
router.get("/backup/:id", auth(["admin"]), adminController.downloadBackup);
router.get("/resources/public", auth(["patient", "provider", "admin"]), adminController.getResources);
router.get("/contacts", auth(["admin"]), adminController.getContacts);

module.exports = router;