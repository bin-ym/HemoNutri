const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");

router.get("/users", auth(["admin"]), adminController.getUsers);
router.delete("/users/:id", auth(["admin"]), adminController.deleteUser);
router.get("/resources", auth(["admin"]), adminController.getResources);
router.post("/resources", auth(["admin"]), adminController.createResource);
router.put("/resources/:id", auth(["admin"]), adminController.updateResource); // Add this line
router.delete("/resources/:id", auth(["admin"]), adminController.deleteResource);
router.get("/report", auth(["admin"]), adminController.getUsageReport);
router.post("/notifications", auth(["admin"]), adminController.sendNotification);
router.get("/activity", auth(["admin"]), adminController.getUserActivity);
router.get("/notifications", auth(["admin"]), adminController.getNotifications);
router.post("/add-user", auth(["admin"]), adminController.addUser);
router.get("/backup", auth(["admin"]), adminController.createBackup);
router.get("/backup/history", auth(["admin"]), adminController.getBackupHistory);
router.get("/backup/:id", auth(["admin"]), adminController.downloadBackup);
router.get("/resources/public", auth(["patient", "provider", "admin"]), adminController.getResources);
router.get("/contacts", auth(["admin"]), adminController.getContacts);

module.exports = router;