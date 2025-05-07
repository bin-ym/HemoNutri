const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const auth = require('../middleware/auth');
const MealPlan = require('../models/MealPlan');
const User = require('../models/User');
const Message = require('../models/Message');
const EducationResource = require('../models/EducationResource');

// Food Logs
router.get('/food-logs', auth(['patient']), patientController.getFoodLogs);
router.post('/food-logs', auth(['patient']), patientController.addFoodLog);

// Notifications
router.get('/notifications', auth(['patient', 'provider']), patientController.getNotifications);

// Meal Plan
router.get('/meal-plan', auth(['patient']), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mealPlan = await MealPlan.findOne({ patientId: req.user.id, date: today });
    if (!mealPlan) {
      return res.json({
        breakfast: { carbohydrates: 0, proteins: 0, lipids: 0 },
        lunch: { carbohydrates: 0, proteins: 0, lipids: 0 },
        dinner: { carbohydrates: 0, proteins: 0, lipids: 0 },
        hemodialysisLimits: { potassium: 0, phosphorus: 0, sodium: 0, fluid: 0 },
        consumed: { breakfast: false, lunch: false, dinner: false },
        recommendedFoods: { breakfast: [], lunch: [], dinner: [] },
      });
    }
    const sanitizedPlan = {
      breakfast: {
        carbohydrates: Number(mealPlan.breakfast.carbohydrates) || 0,
        proteins: Number(mealPlan.breakfast.proteins) || 0,
        lipids: Number(mealPlan.breakfast.lipids) || 0,
      },
      lunch: {
        carbohydrates: Number(mealPlan.lunch.carbohydrates) || 0,
        proteins: Number(mealPlan.lunch.proteins) || 0,
        lipids: Number(mealPlan.lunch.lipids) || 0,
      },
      dinner: {
        carbohydrates: Number(mealPlan.dinner.carbohydrates) || 0,
        proteins: Number(mealPlan.dinner.proteins) || 0,
        lipids: Number(mealPlan.dinner.lipids) || 0,
      },
      hemodialysisLimits: {
        potassium: Number(mealPlan.hemodialysisLimits.potassium) || 0,
        phosphorus: Number(mealPlan.hemodialysisLimits.phosphorus) || 0,
        sodium: Number(mealPlan.hemodialysisLimits.sodium) || 0,
        fluid: Number(mealPlan.hemodialysisLimits.fluid) || 0,
      },
      consumed: mealPlan.consumed || { breakfast: false, lunch: false, dinner: false },
      recommendedFoods: mealPlan.recommendedFoods || { breakfast: [], lunch: [], dinner: [] },
    };
    res.json(sanitizedPlan);
  } catch (err) {
    console.error('Meal plan fetch error:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Mark a meal as consumed
router.put('/meal-plan/consume', auth(['patient']), async (req, res) => {
  const { mealType, consumed } = req.body; // mealType: 'breakfast', 'lunch', or 'dinner'
  try {
    if (!['breakfast', 'lunch', 'dinner'].includes(mealType)) {
      return res.status(400).json({ error: 'Invalid meal type' });
    }
    if (typeof consumed !== 'boolean') {
      return res.status(400).json({ error: 'Consumed must be a boolean' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mealPlan = await MealPlan.findOne({ patientId: req.user.id, date: today });
    if (!mealPlan) {
      return res.status(404).json({ error: 'No meal plan found for today' });
    }

    mealPlan.consumed[mealType] = consumed;
    mealPlan.updatedAt = new Date();
    await mealPlan.save();

    const sanitizedPlan = {
      breakfast: {
        carbohydrates: Number(mealPlan.breakfast.carbohydrates) || 0,
        proteins: Number(mealPlan.breakfast.proteins) || 0,
        lipids: Number(mealPlan.breakfast.lipids) || 0,
      },
      lunch: {
        carbohydrates: Number(mealPlan.lunch.carbohydrates) || 0,
        proteins: Number(mealPlan.lunch.proteins) || 0,
        lipids: Number(mealPlan.lunch.lipids) || 0,
      },
      dinner: {
        carbohydrates: Number(mealPlan.dinner.carbohydrates) || 0,
        proteins: Number(mealPlan.dinner.proteins) || 0,
        lipids: Number(mealPlan.dinner.lipids) || 0,
      },
      hemodialysisLimits: {
        potassium: Number(mealPlan.hemodialysisLimits.potassium) || 0,
        phosphorus: Number(mealPlan.hemodialysisLimits.phosphorus) || 0,
        sodium: Number(mealPlan.hemodialysisLimits.sodium) || 0,
        fluid: Number(mealPlan.hemodialysisLimits.fluid) || 0,
      },
      consumed: mealPlan.consumed,
      recommendedFoods: mealPlan.recommendedFoods || { breakfast: [], lunch: [], dinner: [] },
    };
    res.json(sanitizedPlan);
  } catch (err) {
    console.error('Meal plan consumption update error:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Send Message
router.post('/message', auth(['patient']), async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Message content is required' });
  try {
    const patient = await User.findById(req.user.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    if (!patient.provider) return res.status(400).json({ error: 'No provider assigned' });
    const provider = await User.findById(patient.provider);
    const message = new Message({
      sender: req.user.id,
      recipient: patient.provider,
      content,
      patientUsername: patient.username,
      providerUsername: provider.username,
    });
    await message.save();
    console.log('Patient message saved:', message.toObject());
    res.status(201).json(message);
  } catch (err) {
    console.error('Message send error:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Messages
router.get('/messages', auth(['patient']), async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { recipient: req.user.id }],
    })
      .populate('sender', 'username role')
      .populate('recipient', 'username role')
      .sort({ createdAt: -1 });
    console.log('Fetched patient messages:', messages.map(msg => msg.toObject()));
    res.json(messages);
  } catch (err) {
    console.error('Messages fetch error:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark Messages as Read
router.put('/messages/read', auth(['patient']), async (req, res) => {
  try {
    const patientId = req.user.id;
    const result = await Message.updateMany(
      { recipient: patientId, read: false },
      { $set: { read: true } }
    );
    console.log('Messages marked as read:', result.modifiedCount);
    res.json({ message: 'Messages marked as read', modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error('Mark messages read error:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Education Resources
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

// Emergency Message
router.post('/emergency', auth(['patient']), async (req, res) => {
  const { message } = req.body;
  try {
    const patient = await User.findById(req.user.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    if (!patient.provider) return res.status(400).json({ error: 'No provider assigned' });
    const provider = await User.findById(patient.provider);
    const emergencyMessage = new Message({
      sender: req.user.id,
      recipient: patient.provider,
      content: message?.trim() || 'Urgent: Patient needs immediate assistance!',
      isEmergency: true,
      patientUsername: patient.username,
      providerUsername: provider.username,
    });
    await emergencyMessage.save();
    console.log('Emergency message saved:', emergencyMessage.toObject());
    res.status(201).json({ success: true, message: 'Emergency alert sent to provider' });
  } catch (err) {
    console.error('Emergency send error:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;