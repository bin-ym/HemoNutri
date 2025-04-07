const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'provider', 'admin'], required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Changed from providerId
  assessment: {
    weight: { type: String, default: 'N/A' },
    height: { type: String, default: 'N/A' },
    dietHabits: { type: String, default: 'N/A' },
  },
  otp: { type: String, default: null },
  isFirstLogin: { type: Boolean, default: true },
});

module.exports = mongoose.model('User', userSchema);