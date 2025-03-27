const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'provider', 'admin'], default: 'patient' },
  isFirstLogin: { type: Boolean, default: true },
});

module.exports = mongoose.model('User', userSchema);