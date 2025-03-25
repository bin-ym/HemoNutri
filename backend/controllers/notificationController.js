const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipients: req.user.id })
      .populate('sender', 'username')
      .sort({ createdAt: -1 }); // Newest first
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getNotifications };