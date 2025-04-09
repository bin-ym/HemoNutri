const User = require('../models/User');
const FoodLog = require('../models/FoodLog');
const EducationalResource = require('../models/EducationResource');
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

const adminController = {
  getUsers: async (req, res) => {
    try {
      const users = await User.find().select('-password');
      console.log('Fetched users:', users.length);
      res.json(users);
    } catch (err) {
      console.error('Users fetch error:', err.stack);
      res.status(500).json({ error: 'Server error' });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      console.log('Deleted user:', req.params.id);
      res.status(204).send();
    } catch (err) {
      console.error('User delete error:', err.stack);
      res.status(500).json({ error: 'Server error' });
    }
  },

  getResources: async (req, res) => {
    try {
      const resources = await EducationalResource.find()
        .populate('providerId', 'username');
      console.log('Fetched resources:', resources);
      res.json(resources);
    } catch (err) {
      console.error('Resources fetch error:', err.stack);
      res.status(500).json({ error: 'Server error' });
    }
  },

  deleteResource: async (req, res) => {
    try {
      const resource = await EducationalResource.findByIdAndDelete(req.params.id);
      if (!resource) return res.status(404).json({ error: 'Resource not found' });
      console.log('Deleted resource:', req.params.id);
      res.status(204).send();
    } catch (err) {
      console.error('Resource delete error:', err.stack);
      res.status(500).json({ error: 'Server error' });
    }
  },

  getUsageReport: async (req, res) => {
    try {
      const filter = req.query.filter || 'all';
      let userQuery = {};
      if (filter === 'patient') userQuery.role = 'patient';
      else if (filter === 'provider') userQuery.role = 'provider';

      const [users, foodLogsCount, resources] = await Promise.all([
        User.find(userQuery).select('username role'), // Fetch username and role
        FoodLog.countDocuments(),
        EducationalResource.find().populate('providerId', 'username'), // Fetch all resources
      ]);

      const report = {
        users: users.map(user => ({ username: user.username, role: user.role })),
        foodLogs: foodLogsCount,
        resources: resources.map(res => ({
          title: res.title,
          description: res.description,
          url: res.url,
          provider: res.providerId?.username || 'Unknown',
        })),
        timestamp: new Date(),
      };
      console.log('Generated detailed report:', report);
      res.json(report);
    } catch (err) {
      console.error('Report generation error:', err.stack);
      res.status(500).json({ error: 'Server error' });
    }
  },

  sendNotification: async (req, res) => {
    const { title, message, recipientType, recipientIds } = req.body;
    try {
      if (!title || !message) {
        return res.status(400).json({ error: 'Title and message are required' });
      }
      let recipients = [];
      if (recipientType === 'all') {
        recipients = await User.find().distinct('_id');
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
      console.log('Notification sent:', notification);
      res.status(201).json(notification);
    } catch (err) {
      console.error('Notification send error:', err.stack);
      res.status(500).json({ error: 'Server error' });
    }
  },

  getUserActivity: async (req, res) => {
    try {
      const logs = await FoodLog.find()
        .populate('user', 'username')
        .sort({ date: -1 })
        .limit(50);
      console.log('Fetched user activity:', logs.length);
      res.json(logs);
    } catch (err) {
      console.error('User activity fetch error:', err.stack);
      res.status(500).json({ error: 'Server error' });
    }
  },

  getNotifications: async (req, res) => {
    try {
      const notifications = await Notification.find()
        .populate('sender', 'username')
        .sort({ createdAt: -1 })
        .limit(50);
      console.log('Fetched notifications:', notifications.length);
      res.json(notifications);
    } catch (err) {
      console.error('Notifications fetch error:', err.stack);
      res.status(500).json({ error: 'Server error' });
    }
  },

  addUser: async (req, res) => {
    const { username, email, role } = req.body;
    try {
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedPassword = await bcrypt.hash(otp, 10);

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
        console.error('Email sending error:', emailErr.stack);
      }

      console.log('Added user:', user._id);
      res.status(201).json({ user: { _id: user._id, username, email, role } });
    } catch (err) {
      console.error('Add user error:', err.stack);
      res.status(500).json({ error: 'Server error' });
    }
  },

  createResource: async (req, res) => {
    const { title, description, url, providerId } = req.body;
    try {
      if (!title || !description || !providerId) {
        return res.status(400).json({ error: 'Title, description, and providerId are required' });
      }
      const resource = new EducationalResource({
        title,
        description,
        url,
        providerId,
      });
      await resource.save();
      const populatedResource = await EducationalResource.findById(resource._id).populate('providerId', 'username');
      console.log('Created resource:', populatedResource);
      res.status(201).json(populatedResource);
    } catch (err) {
      console.error('Create resource error:', err.stack);
      res.status(500).json({ error: 'Server error' });
    }
  },
};

module.exports = adminController;