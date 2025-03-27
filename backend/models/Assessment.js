const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weight: { type: String },
  height: { type: String },
  dietHabits: { type: String },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Assessment', assessmentSchema);