// backend/controllers/notificationController.js
const Notification = require('../models/Notification');
const User = require('../models/User');
const mongoose = require('mongoose');

const notificationController = {
  // Send notification (admin only)
  sendNotification: async (req, res) => {
    const { title, message, recipientType, recipientIds } = req.body;
    try {
      if (!title || !message?.trim()) {
        return res.status(400).json({ error: 'title_required' });
      }
      let recipients = [];
      if (recipientType === 'all') {
        recipients = await User.find().distinct('_id');
      } else if (recipientType === 'patients') {
        recipients = await User.find({ role: 'patient' }).distinct('_id');
      } else if (recipientType === 'providers') {
        recipients = await User.find({ role: 'provider' }).distinct('_id');
      } else if (recipientType === 'specific' && Array.isArray(recipientIds)) {
        recipients = await User.find({ _id: { $in: recipientIds } }).distinct('_id');
      } else {
        return res.status(400).json({ error: 'invalid_recipient_type' });
      }
      const notification = new Notification({
        title: title.trim(),
        description: message.trim(),
        sender: req.user.id,
        recipients,
      });
      await notification.save();
      console.log(`[${new Date().toISOString()}] Notification sent by ${req.user.id}: ${notification._id}`);
      res.status(201).json({ message: 'notification_created', notification });
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Notification send error:`, err.stack);
      res.status(500).json({ error: 'server_error', details: err.message });
    }
  },

  // Get notifications for the current user
  getUserNotifications: async (req, res) => {
    try {
      const { page = 1, limit = 50 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const [notifications, total] = await Promise.all([
        Notification.find({ recipients: req.user.id })
          .populate('sender', 'username')
          .sort({ createdAt: -1 })
          .limit(Number(limit))
          .skip(skip),
        Notification.countDocuments({ recipients: req.user.id }),
      ]);
      res.setHeader('X-Total-Count', total);
      console.log(`[${new Date().toISOString()}] Fetched ${notifications.length} notifications for user ${req.user.id}`);
      res.json(notifications);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Fetch notifications error:`, err.stack);
      res.status(500).json({ error: 'server_error', details: err.message });
    }
  },

  // Delete a notification (admin only)
  deleteNotification: async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'invalid_notification_id' });
      }
      const notification = await Notification.findByIdAndDelete(req.params.id);
      if (!notification) {
        return res.status(404).json({ error: 'notification_not_found' });
      }
      console.log(`[${new Date().toISOString()}] Deleted notification: ${req.params.id}`);
      res.status(204).json();
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Delete notification error:`, err.stack);
      res.status(500).json({ error: 'server_error', details: err.message });
    }
  },

  // Mark notification as read
  markAsRead: async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'invalid_notification_id' });
      }
      const notification = await Notification.findOne({
        _id: req.params.id,
        recipients: req.user.id,
      });
      if (!notification) {
        return res.status(404).json({ error: 'notification_not_found' });
      }
      notification.read = true;
      await notification.save();
      console.log(`[${new Date().toISOString()}] Marked notification as read: ${req.params.id}`);
      res.json({ message: 'notification_read' });
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Mark notification error:`, err.stack);
      res.status(500).json({ error: 'server_error', details: err.message });
    }
  },
};

module.exports = notificationController;