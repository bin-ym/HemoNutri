const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const FoodLog = require('../models/FoodLog');
const MealPlan = require('../models/MealPlan');
const Message = require('../models/Message');
const EducationResource = require('../models/EducationResource');

// Get Patients
router.get('/patients', auth(['provider']), async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient', provider: req.user.id });
    res.json(patients);
  } catch (err) {
    console.error('Error fetching patients:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Patient Details
router.get('/patient/:id', auth(['provider']), async (req, res) => {
  try {
    const patient = await User.findOne({ _id: req.params.id, role: 'patient', provider: req.user.id });
    if (!patient) return res.status(404).json({ error: 'Patient not found or not assigned to you' });
    res.json(patient);
  } catch (err) {
    console.error('Error fetching patient:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Patient Food Logs
router.get('/patient/:id/food-logs', auth(['provider']), async (req, res) => {
  try {
    const patient = await User.findOne({ _id: req.params.id, role: 'patient', provider: req.user.id });
    if (!patient) return res.status(404).json({ error: 'Patient not found or not assigned to you' });
    const logs = await FoodLog.find({ userId: req.params.id }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    console.error('Error fetching food logs:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Patient Assessment
router.get('/patient/:id/assessment', auth(['provider']), async (req, res) => {
  try {
    const patient = await User.findOne({ _id: req.params.id, role: 'patient', provider: req.user.id });
    if (!patient) return res.status(404).json({ error: 'Patient not found or not assigned to you' });
    const assessment = patient.assessment || { weight: 'N/A', height: 'N/A', dietHabits: 'N/A' };
    res.json(assessment);
  } catch (err) {
    console.error('Error fetching assessment:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get All Logs for Provider's Patients
router.get('/logs', auth(['provider']), async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient', provider: req.user.id });
    const patientIds = patients.map(p => p._id);
    const logs = await FoodLog.find({ userId: { $in: patientIds } })
      .sort({ date: -1 })
      .populate('userId', 'username');
    res.json(logs);
  } catch (err) {
    console.error('Error fetching logs:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Messages (All)
router.get('/messages', auth(['provider']), async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { recipient: req.user.id }],
    })
      .populate('sender', 'username role')
      .populate('recipient', 'username role')
      .sort({ createdAt: -1 });
    console.log('Fetched provider messages:', messages); // Debug
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Messages with Specific Patient
router.get('/messages/:patientId', auth(['provider']), async (req, res) => {
  try {
    const patient = await User.findOne({ _id: req.params.patientId, role: 'patient', provider: req.user.id });
    if (!patient) return res.status(404).json({ error: 'Patient not found or not assigned to you' });
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: req.params.patientId },
        { sender: req.params.patientId, recipient: req.user.id },
      ],
    })
      .populate('sender', 'username role')
      .populate('recipient', 'username role')
      .sort({ createdAt: -1 });
    console.log('Fetched patient-specific messages:', messages); // Debug
    res.json(messages);
  } catch (err) {
    console.error('Error fetching patient messages:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send Message to Patient
router.post('/message/:id', auth(['provider']), async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Message content is required' });
  try {
    const patient = await User.findOne({ _id: req.params.id, role: 'patient', provider: req.user.id });
    if (!patient) return res.status(404).json({ error: 'Patient not found or not assigned to you' });
    const provider = await User.findById(req.user.id);
    const message = new Message({
      sender: req.user.id,
      recipient: req.params.id,
      content,
      providerUsername: provider.username,
      patientUsername: patient.username,
    });
    await message.save();
    console.log('Provider message saved:', message); // Debug
    res.json(message);
  } catch (err) {
    console.error('Error sending message:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Meal Plans
router.get('/meal-plans', auth(['provider']), async (req, res) => {
  try {
    const mealPlans = await MealPlan.find({ providerId: req.user.id }).populate('patientId', 'username');
    res.json(mealPlans);
  } catch (err) {
    console.error('Error fetching meal plans:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save Meal Plan
router.post('/meal-plan/:id', auth(['provider']), async (req, res) => {
  const { breakfast, lunch, dinner } = req.body;
  if (!breakfast || !lunch || !dinner) return res.status(400).json({ error: 'All meal fields are required' });
  try {
    const patient = await User.findOne({ _id: req.params.id, role: 'patient', provider: req.user.id });
    if (!patient) return res.status(404).json({ error: 'Patient not found or not assigned to you' });
    let mealPlan = await MealPlan.findOne({ patientId: req.params.id });
    if (mealPlan) {
      mealPlan.breakfast = breakfast;
      mealPlan.lunch = lunch;
      mealPlan.dinner = dinner;
      mealPlan.updatedAt = new Date();
    } else {
      mealPlan = new MealPlan({
        patientId: req.params.id,
        providerId: req.user.id,
        breakfast,
        lunch,
        dinner,
      });
    }
    await mealPlan.save();
    res.json(mealPlan);
  } catch (err) {
    console.error('Error saving meal plan:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Education Resources
router.get('/education', auth(['provider']), async (req, res) => {
  try {
    const resources = await EducationResource.find({ providerId: req.user.id }).sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    console.error('Error fetching education resources:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add Education Resource
router.post('/education', auth(['provider']), async (req, res) => {
  const { title, description, url } = req.body;
  if (!title || !description) return res.status(400).json({ error: 'Title and description are required' });
  try {
    const resource = new EducationResource({
      title,
      description,
      url,
      providerId: req.user.id,
    });
    await resource.save();
    res.json(resource);
  } catch (err) {
    console.error('Error adding education resource:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;