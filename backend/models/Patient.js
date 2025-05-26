const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'patient',
    enum: ['patient', 'provider', 'admin'],
  },
  medicalHistory: {
    type: String,
    default: '',
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient', // Assuming providers are also stored in the same collection
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);