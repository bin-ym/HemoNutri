const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid email format'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
  },
  tempPassword: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: {
      values: ['patient', 'provider', 'admin'],
      message: 'Role must be patient, provider, or admin',
    },
    required: [true, 'Role is required'],
  },
  firstName: {
    type: String,
    trim: true,
    default: '',
  },
  lastName: {
    type: String,
    trim: true,
    default: '',
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  assessment: {
    weight: { type: String, default: 'N/A' },
    height: { type: String, default: 'N/A' },
    dietHabits: { type: String, default: 'N/A' },
  },
  otp: { type: String, default: null },
  isFirstLogin: { type: Boolean, default: true },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  activationCode: { type: String, default: null },
  activationCodeExpires: { type: Date, default: null },
  isActivated: { type: Boolean, default: false },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);