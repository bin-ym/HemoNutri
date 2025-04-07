const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const auth = require('../middleware/auth');
const MealPlan = require('../models/MealPlan');
const User = require('../models/User');
const Message = require('../models/Message');
const EducationResource = require('../models/EducationResource');

router.get('/food-logs', auth(['patient']), patientController.getFoodLogs);
router.post('/food-logs', auth(['patient']), patientController.addFoodLog);
router.get('/notifications', auth(['patient', 'provider']), patientController.getNotifications);

router.get('/meal-plan', auth(['patient']), async (req, res) => {
  try {
    const mealPlan = await MealPlan.findOne({ patientId: req.user.id });
    if (!mealPlan) {
      return res.json({ breakfast: [], lunch: [], dinner: [] });
    }
    const sanitizedPlan = {
      breakfast: mealPlan.breakfast.map(item => ({
        ...item.toObject(),
        quantity: Number(item.quantity),
      })),
      lunch: mealPlan.lunch.map(item => ({
        ...item.toObject(),
        quantity: Number(item.quantity),
      })),
      dinner: mealPlan.dinner.map(item => ({
        ...item.toObject(),
        quantity: Number(item.quantity),
      })),
    };
    res.json(sanitizedPlan);
  } catch (err) {
    console.error('Meal plan fetch error:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/message', auth(['patient']), async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Message content is required' });
  try {
    const patient = await User.findById(req.user.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    if (!patient.provider) return res.status(400).json({ error: 'No provider assigned' });
    const message = new Message({
      sender: req.user.id,
      recipient: patient.provider,
      content,
      patientUsername: patient.username,
    });
    await message.save();
    res.json(message);
  } catch (err) {
    console.error('Message send error:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/messages', auth(['patient']), async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { recipient: req.user.id }],
    })
      .populate('sender', 'username')
      .populate('recipient', 'username')
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error('Messages fetch error:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/resources', auth(['patient', 'provider']), async (req, res) => {
  try {
    const patient = await User.findById(req.user.id);
    if (!patient) return res.status(404).json({ error: 'User not found' });
    if (req.user.role === 'patient' && !patient.provider) {
      return res.status(400).json({ error: 'No provider assigned' });
    }
    const providerId = req.user.role === 'patient' ? patient.provider : req.user.id;
    const resources = await EducationResource.find({ providerId });
    res.json(resources.map(r => ({ _id: r._id, title: r.title, content: r.description })));
  } catch (err) {
    console.error('Resources fetch error:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/emergency', auth(['patient']), async (req, res) => {
  const { message } = req.body;
  try {
    const patient = await User.findById(req.user.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    if (!patient.provider) return res.status(400).json({ error: 'No provider assigned' });
    const emergencyMessage = new Message({
      sender: req.user.id,
      recipient: patient.provider,
      content: message || 'Urgent: Patient needs immediate assistance!',
      isEmergency: true,
      patientUsername: patient.username,
    });
    await emergencyMessage.save();
    res.json({ success: true, message: 'Emergency alert sent to provider' });
  } catch (err) {
    console.error('Emergency send error:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;