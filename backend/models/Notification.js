const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin who sent it
  recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of user IDs
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }, // Optional: track if read
});

module.exports = mongoose.model('Notification', notificationSchema);