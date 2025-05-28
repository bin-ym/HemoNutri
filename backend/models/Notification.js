// backend/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ createdAt: -1, recipients: 1 });

module.exports = mongoose.model('Notification', notificationSchema);