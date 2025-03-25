const User = require('../models/User');
const FoodLog = require('../models/FoodLog');
const EducationalResource = require('../models/EducationalResource');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getResources = async (req, res) => {
  try {
    const resources = await EducationalResource.find().populate('createdBy', 'username');
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteResource = async (req, res) => {
  try {
    await EducationalResource.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUsageReport = async (req, res) => {
  try {
    const userCount = await User.countDocuments({ role: { $ne: 'admin' } });
    const logCount = await FoodLog.countDocuments();
    const resourceCount = await EducationalResource.countDocuments();
    res.json({
      users: userCount,
      foodLogs: logCount,
      resources: resourceCount,
      timestamp: new Date(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const sendNotification = async (req, res) => {
  const { title, message, recipientType, recipientIds } = req.body;
  try {
    let recipients = [];
    if (recipientType === 'all') {
      recipients = await User.find({ role: { $ne: 'admin' } }).distinct('_id');
    } else if (recipientType === 'patients') {
      recipients = await User.find({ role: 'patient' }).distinct('_id');
    } else if (recipientType === 'providers') {
      recipients = await User.find({ role: 'provider' }).distinct('_id');
    } else if (recipientType === 'specific' && recipientIds) {
      recipients = recipientIds;
    }
    const notification = new Notification({
      title,
      message,
      sender: req.user.id,
      recipients,
    });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserActivity = async (req, res) => {
  try {
    const logs = await FoodLog.find()
      .populate('user', 'username')
      .sort({ date: -1 })
      .limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('sender', 'username')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addUser = async (req, res) => {
  const { username, email, role } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ error: 'Username or email already exists' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const tempPassword = otp;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
      otp,
      isFirstLogin: true,
    });
    await user.save();

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your HemoNutri OTP',
        text: `Welcome to HemoNutri! Your OTP is: ${otp}. Use it to log in for the first time and change your password.`,
      });
      console.log(`OTP sent to ${email}: ${otp}`);
    } catch (emailErr) {
      console.error('Email sending error:', emailErr);
      // Don’t fail the request if email fails—user is still created
    }

    res.status(201).json({ user: { _id: user._id, username, email, role } });
  } catch (err) {
    console.error('Add user error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUsers,
  deleteUser,
  getResources,
  deleteResource,
  getUsageReport,
  sendNotification,
  getUserActivity,
  getNotifications,
  addUser,
};