const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'provider', 'admin'], default: 'patient' },
  otp: { type: String }, // Store OTP temporarily
  isFirstLogin: { type: Boolean, default: true }, // Flag for first-time login
});

module.exports = mongoose.model('User', userSchema);