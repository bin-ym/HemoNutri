// backend/controllers/notificationController.js
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const User = require("../models/User");

const createNotification = async (req, res) => {
  const { title, message, recipientType, recipientIds } = req.body;
  try {
    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    // Validate sender
    const senderId = req.userId || req.user?.id;
    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      console.error(`[${new Date().toISOString()}] Invalid sender ID:`, senderId);
      return res.status(400).json({ error: "Invalid sender ID" });
    }
    const sender = await User.findById(senderId);
    if (!sender) {
      console.error(`[${new Date().toISOString()}] Sender not found:`, senderId);
      return res.status(404).json({ error: "Sender not found" });
    }

    let recipients = [];
    if (recipientType === "specific" && recipientIds?.length) {
      const validIds = recipientIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
      if (!validIds.length) {
        console.error(`[${new Date().toISOString()}] No valid recipient IDs provided:`, recipientIds);
        return res.status(400).json({ error: "No valid recipient IDs provided" });
      }
      const users = await User.find({ _id: { $in: validIds } }).select("_id");
      recipients = users.map((u) => u._id);
      if (!recipients.length) {
        console.error(`[${new Date().toISOString()}] No valid recipients found for IDs:`, validIds);
        return res.status(400).json({ error: "No valid recipients found" });
      }
    } else if (["all", "patients", "providers"].includes(recipientType)) {
      const roles =
        recipientType === "patients"
          ? ["patient"]
          : recipientType === "providers"
          ? ["provider"]
          : ["patient", "provider", "admin"];
      const users = await User.find({ role: { $in: roles } }).select("_id");
      recipients = users.map((u) => u._id);
      if (!recipients.length) {
        console.error(`[${new Date().toISOString()}] No users found for roles:`, roles);
        return res.status(400).json({ error: `No users found for ${recipientType}` });
      }
    } else {
      console.error(`[${new Date().toISOString()}] Invalid recipientType:`, recipientType);
      return res.status(400).json({ error: "Invalid recipientType" });
    }

    const notification = new Notification({
      title,
      message,
      sender: senderId,
      recipients,
    });
    await notification.save();
    console.log(`[${new Date().toISOString()}] Notification created:`, notification._id);
    res.status(201).json(notification);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Notification creation error:`, {
      message: err.message,
      stack: err.stack,
      body: req.body,
      user: req.user,
    });
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

const getNotifications = async (req, res) => {
  console.log("notificationController: Get notifications", { userId: req.user.id });
  try {
    const notifications = await Notification.find({ recipients: req.user.id })
      .populate("sender", "username")
      .sort({ createdAt: -1 });
    console.log("notificationController: Notifications fetched", { count: notifications.length });
    res.json(notifications);
  } catch (err) {
    console.error("notificationController: Get notifications error:", err.stack);
    res.status(500).json({ error: "Server error" });
  }
};

const markNotificationRead = async (req, res) => {
  const { notificationId } = req.params;
  console.log("notificationController: Mark notification read", { notificationId, userId: req.user.id });
  try {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipients: req.user.id,
    });
    if (!notification) {
      console.log("notificationController: Notification not found or not authorized", { notificationId });
      return res.status(404).json({ error: "Notification not found" });
    }
    notification.read = true;
    await notification.save();
    console.log("notificationController: Notification marked as read", { notificationId });
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("notificationController: Mark notification read error:", err.stack);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markNotificationRead,
};