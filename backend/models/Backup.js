const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['success', 'failed'], default: 'success' },
  description: { type: String, default: '' },
});

module.exports = mongoose.model('Backup', backupSchema);