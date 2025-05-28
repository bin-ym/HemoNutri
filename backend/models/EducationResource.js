const mongoose = require('mongoose');

const educationResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin or Provider
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('EducationResource', educationResourceSchema);