// backend/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const validator = require('validator');
const crypto = require('crypto');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error(`[${new Date().toISOString()}] Nodemailer error:`, error.stack);
  } else {
    console.log(`[${new Date().toISOString()}] Nodemailer verified`);
  }
});

const generateActivationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateTempPassword = () => {
  return crypto.randomBytes(8).toString('base64').slice(0, 10)
    .replace(/[^a-zA-Z0-9]/g, 'A')
    .replace(/^(.{0,1})(.*)$/, (_, first, rest) => first.toUpperCase() + rest + '1@');
};

const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const authController = {
  login: async (req, res) => {
    const { identifier, password } = req.body;
    console.log(`[${new Date().toISOString()}] Login attempt`, { identifier });
    try {
      if (!identifier || !password) {
        return res.status(400).json({ error: 'identifier_password_required' });
      }

      const user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }],
      }).select('_id username firstName lastName email role provider isActivated isFirstLogin tempPassword resetPasswordToken password');

      if (!user) {
        return res.status(400).json({ error: 'invalid_credentials' });
      }
      if (!user.isActivated) {
        return res.status(400).json({ error: 'account_not_activated' });
      }

      let isTempPassword = false;
      let isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch && user.tempPassword) {
        isMatch = await bcrypt.compare(password, user.tempPassword);
        isTempPassword = isMatch;
      }
      if (!isMatch) {
        return res.status(400).json({ error: 'invalid_credentials' });
      }

      const isAdmin = user.email === process.env.ADMIN_EMAIL && user.role === 'admin';

      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      const userData = {
        username: user.username,
        firstName: user.firstName || user.username.split(' ')[0] || 'Unknown',
        lastName: user.lastName || user.username.split(' ').slice(1).join(' ') || '',
        email: user.email,
        role: user.role,
        provider: user.provider ? user.provider.toString() : null,
        isAdmin,
      };

      if (isTempPassword) {
        return res.json({
          token,
          userId: user._id.toString(),
          role: user.role,
          isTempPassword: true,
          resetToken: user.resetPasswordToken,
          user: userData,
        });
      }

      if (user.isFirstLogin && user.role === 'patient') {
        const providers = await User.find({ role: 'provider' }).select('username _id');
        if (providers.length > 0) {
          return res.json({
            token,
            userId: user._id.toString(),
            role: user.role,
            isFirstLogin: true,
            needsProviderSelection: true,
            providers: providers.map(p => ({
              id: p._id.toString(),
              username: p.username,
            })),
            user: userData,
          });
        }
      }

      if (user.isFirstLogin) {
        user.isFirstLogin = false;
        if (user.role === 'provider') {
          user.provider = user._id;
        }
        await user.save();
      }

      res.json({
        token,
        userId: user._id.toString(),
        role: user.role,
        isFirstLogin: false,
        needsProviderSelection: false,
        user: userData,
      });
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Login error:`, err.stack);
      return res.status(500).json({ error: 'server_error' });
    }
  },

  selectProvider: async (req, res) => {
    const { userId, providerId } = req.body;
    try {
      if (!userId || !providerId) {
        return res.status(400).json({ error: 'user_provider_required' });
      }

      const user = await User.findById(userId);
      if (!user || user.role !== 'patient') {
        return res.status(400).json({ error: 'invalid_user_role' });
      }

      const provider = await User.findById(providerId);
      if (!provider || provider.role !== 'provider') {
        return res.status(400).json({ error: 'invalid_provider' });
      }

      user.provider = providerId;
      user.isFirstLogin = false;
      await user.save();

      res.json({ message: 'provider_selected' });
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Select provider error:`, err.stack);
      return res.status(500).json({ error: 'server_error' });
    }
  },

  activateAccount: async (req, res) => {
    const { email, code } = req.body;
    try {
      if (!email || !code) {
        return res.status(400).json({ error: 'email_code_required' });
      }

      const user = await User.findOne({
        email,
        activationCode: code,
        activationCodeExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ error: 'invalid_activation_code' });
      }

      user.isActivated = true;
      user.activationCode = null;
      user.activationCodeExpires = null;
      await user.save();

      res.json({ message: 'account_activated' });
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Activation error:`, err.stack);
      return res.status(500).json({ error: 'server_error' });
    }
  },

  changePassword: async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'passwords_required' });
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ error: 'password_requirements' });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'user_not_found' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'invalid_current_password' });
      }

      user.password = await bcrypt.hash(newPassword, 12);
      user.isFirstLogin = false;
      user.tempPassword = null;
      await user.save();

      res.json({ message: 'password_changed' });
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Change password error:`, err.stack);
      return res.status(500).json({ error: 'server_error' });
    }
  },

  forgotPassword: async (req, res) => {
    const { identifier } = req.body;
    try {
      if (!identifier) {
        return res.status(400).json({ error: 'identifier_required' });
      }

      const user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }],
      });
      if (!user) {
        return res.status(404).json({ error: 'user_not_found' });
      }

      const resetToken = generateResetToken();
      const tempPassword = generateTempPassword();
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000;
      user.tempPassword = await bcrypt.hash(tempPassword, 12);
      await user.save();

      await transporter.sendMail({
        from: `"HemoNutri" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'HemoNutri Password Reset',
        text: `Dear ${user.username},\n\nUse this temporary password to reset your password:\n${tempPassword}\n\nClick here: http://localhost:3000/reset-password?token=${resetToken}\n\nExpires in 1 hour`,
      });

      res.json({ message: 'reset_link_sent' });
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Forgot password error:`, err.stack);
      return res.status(500).json({ error: 'server_error' });
    }
  },

  resetPassword: async (req, res) => {
    const { token, tempPassword, newPassword } = req.body;
    try {
      if (!token || !tempPassword || !newPassword) {
        return res.status(400).json({ error: 'reset_fields_required' });
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ error: 'password_requirements' });
      }

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });
      if (!user) {
        return res.status(400).json({ error: 'invalid_reset_token' });
      }

      const isTempPasswordValid = await bcrypt.compare(tempPassword, user.tempPassword);
      if (!isTempPasswordValid) {
        return res.status(400).json({ error: 'invalid_temp_password' });
      }

      user.password = await bcrypt.hash(newPassword, 12);
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      user.tempPassword = null;
      user.isFirstLogin = false;
      await user.save();

      res.json({ message: 'password_reset_success', role: user.role });
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Reset password error:`, err.stack);
      return res.status(500).json({ error: 'server_error' });
    }
  },

  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id)
        .select('username email role provider firstName lastName')
        .maxTimeMS(2000);
      if (!user) {
        return res.status(404).json({ error: 'user_not_found' });
      }

      const isAdmin = user.email === process.env.ADMIN_EMAIL && user.role === 'admin';

      res.json({
        username: user.username,
        email: user.email,
        role: user.role,
        provider: user.provider ? user.provider.toString() : null,
        isAdmin,
        firstName: user.firstName || user.username.split(' ')[0] || 'Unknown',
        lastName: user.lastName || user.username.split(' ').slice(1).join(' ') || '',
      });
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Profile fetch error:`, err.stack);
      return res.status(500).json({ error: 'server_error' });
    }
  },

  updateProfile: async (req, res) => {
    const { firstName, lastName } = req.body;
    try {
      if (!firstName || !lastName) {
        return res.status(400).json({ error: 'name_required' });
      }

      const username = `${firstName} ${lastName}`;
      const existingUser = await User.findOne({ username, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ error: 'username_exists' });
      }

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { firstName, lastName, username },
        { new: true }
      ).select('username email role provider firstName lastName');
      if (!user) {
        return res.status(404).json({ error: 'user_not_found' });
      }

      res.json({
        message: 'profile_updated',
        user: {
          username: user.username,
          email: user.email,
          role: user.role,
          provider: user.provider ? user.provider.toString() : null,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Update profile error:`, err.stack);
      return res.status(500).json({ error: 'server_error' });
    }
  },

  refreshToken: async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'invalid_token' });
      }

      const newToken = jwt.sign(
        { id: req.user.id, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ token: newToken });
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Refresh token error:`, err.stack);
      return res.status(500).json({ error: 'server_error' });
    }
  },
};

module.exports = authController;