const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weight: { type: String, default: 'N/A' },
  height: { type: String, default: 'N/A' },
  dietHabits: { type: String, default: 'N/A' },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Assessment', assessmentSchema);