const express = require('express');
const mongoose = require('mongoose');
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
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get Patient Details
router.get('/patient/:id', auth(['provider']), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }
    const patient = await User.findOne({ _id: req.params.id, role: 'patient', provider: req.user.id });
    if (!patient) return res.status(404).json({ error: 'Patient not found or not assigned to you' });
    res.json(patient);
  } catch (err) {
    console.error('Error fetching patient:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get Patient Food Logs
router.get('/patient/:id/food-logs', auth(['provider']), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }
    const patient = await User.findOne({ _id: req.params.id, role: 'patient', provider: req.user.id });
    if (!patient) return res.status(404).json({ error: 'Patient not found or not assigned to you' });
    const logs = await FoodLog.find({ userId: req.params.id }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    console.error('Error fetching food logs:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get Patient Assessment
router.get('/patient/:id/assessment', auth(['provider']), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }
    const patient = await User.findOne({ _id: req.params.id, role: 'patient', provider: req.user.id });
    if (!patient) return res.status(404).json({ error: 'Patient not found or not assigned to you' });
    const assessment = patient.assessment || { weight: 'N/A', height: 'N/A', dietHabits: 'N/A' };
    res.json(assessment);
  } catch (err) {
    console.error('Error fetching assessment:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
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
    res.status(500).json({ error: 'Server error', details: err.message });
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
    console.log('Fetched provider messages:', messages);
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get Messages with Specific Patient
router.get('/messages/:patientId', auth(['provider']), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.patientId)) {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }
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
    console.log('Fetched patient-specific messages:', messages);
    res.json(messages);
  } catch (err) {
    console.error('Error fetching patient messages:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Send Message to Patient
router.post('/message/:id', auth(['provider']), async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Message content is required' });
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }
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
    console.log('Provider message saved:', message);
    res.json(message);
  } catch (err) {
    console.error('Error sending message:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get Meal Plans
router.get('/meal-plans', auth(['provider']), async (req, res) => {
  try {
    const mealPlans = await MealPlan.find({ providerId: req.user.id }).populate('patientId', 'username');
    res.json(mealPlans);
  } catch (err) {
    console.error('Error fetching meal plans:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Save Meal Plan
router.post('/meal-plan/:id', auth(['provider']), async (req, res) => {
  const { breakfast, lunch, dinner, hemodialysisLimits, date, recommendedFoods } = req.body;
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }

    // Validate request body
    if (!breakfast || !lunch || !dinner || !hemodialysisLimits || !date) {
      return res.status(400).json({ error: 'All meal fields, hemodialysis limits, and date are required' });
    }

    const validateNutrients = (meal) => {
      return (
        typeof meal.carbohydrates === 'number' && !isNaN(meal.carbohydrates) && meal.carbohydrates >= 0 &&
        typeof meal.proteins === 'number' && !isNaN(meal.proteins) && meal.proteins >= 0 &&
        typeof meal.lipids === 'number' && !isNaN(meal.lipids) && meal.lipids >= 0
      );
    };

    const validateLimits = (limits) => {
      return (
        typeof limits.potassium === 'number' && !isNaN(limits.potassium) && limits.potassium >= 0 &&
        typeof limits.phosphorus === 'number' && !isNaN(limits.phosphorus) && limits.phosphorus >= 0 &&
        typeof limits.sodium === 'number' && !isNaN(limits.sodium) && limits.sodium >= 0 &&
        typeof limits.fluid === 'number' && !isNaN(limits.fluid) && limits.fluid >= 0
      );
    };

    if (!validateNutrients(breakfast) || !validateNutrients(lunch) || !validateNutrients(dinner)) {
      return res.status(400).json({ error: 'Invalid nutrient values for meals. All values must be non-negative numbers.' });
    }

    if (!validateLimits(hemodialysisLimits)) {
      return res.status(400).json({ error: 'Invalid hemodialysis limits. All values must be non-negative numbers.' });
    }

    // Validate date
    const mealPlanDate = new Date(date);
    if (isNaN(mealPlanDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    mealPlanDate.setHours(0, 0, 0, 0);

    const patient = await User.findOne({ _id: req.params.id, role: 'patient', provider: req.user.id });
    if (!patient) return res.status(404).json({ error: 'Patient not found or not assigned to you' });

    let mealPlan = await MealPlan.findOne({ patientId: req.params.id, date: mealPlanDate });
    if (mealPlan) {
      mealPlan.breakfast = breakfast;
      mealPlan.lunch = lunch;
      mealPlan.dinner = dinner;
      mealPlan.hemodialysisLimits = hemodialysisLimits;
      if (recommendedFoods) {
        mealPlan.recommendedFoods = recommendedFoods;
      }
      mealPlan.updatedAt = new Date();
    } else {
      mealPlan = new MealPlan({
        patientId: req.params.id,
        providerId: req.user.id,
        date: mealPlanDate,
        breakfast,
        lunch,
        dinner,
        hemodialysisLimits,
        recommendedFoods: recommendedFoods || {
          breakfast: [],
          lunch: [],
          dinner: [],
        },
      });
    }
    await mealPlan.save();
    res.json(mealPlan);
  } catch (err) {
    console.error('Error saving meal plan:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Update Meal Plan
router.put('/meal-plans/:id', auth(['provider']), async (req, res) => {
  const { breakfast, lunch, dinner, hemodialysisLimits } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid meal plan ID' });
    }

    if (!breakfast || !lunch || !dinner || !hemodialysisLimits) {
      return res.status(400).json({ error: 'All meal fields and hemodialysis limits are required' });
    }

    const validateNutrients = (meal) => {
      return (
        typeof meal.carbohydrates === 'number' && !isNaN(meal.carbohydrates) && meal.carbohydrates >= 0 &&
        typeof meal.proteins === 'number' && !isNaN(meal.proteins) && meal.proteins >= 0 &&
        typeof meal.lipids === 'number' && !isNaN(meal.lipids) && meal.lipids >= 0
      );
    };

    const validateLimits = (limits) => {
      return (
        typeof limits.potassium === 'number' && !isNaN(limits.potassium) && limits.potassium >= 0 &&
        typeof limits.phosphorus === 'number' && !isNaN(limits.phosphorus) && limits.phosphorus >= 0 &&
        typeof limits.sodium === 'number' && !isNaN(limits.sodium) && limits.sodium >= 0 &&
        typeof limits.fluid === 'number' && !isNaN(limits.fluid) && limits.fluid >= 0
      );
    };

    if (!validateNutrients(breakfast) || !validateNutrients(lunch) || !validateNutrients(dinner)) {
      return res.status(400).json({ error: 'Invalid nutrient values for meals. All values must be non-negative numbers.' });
    }

    if (!validateLimits(hemodialysisLimits)) {
      return res.status(400).json({ error: 'Invalid hemodialysis limits. All values must be non-negative numbers.' });
    }

    const mealPlan = await MealPlan.findOne({ _id: req.params.id, providerId: req.user.id });
    if (!mealPlan) return res.status(404).json({ error: 'Meal plan not found or not assigned to you' });

    mealPlan.breakfast = breakfast;
    mealPlan.lunch = lunch;
    mealPlan.dinner = dinner;
    mealPlan.hemodialysisLimits = hemodialysisLimits;
    mealPlan.updatedAt = new Date();
    await mealPlan.save();
    res.json(mealPlan);
  } catch (err) {
    console.error('Error updating meal plan:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Delete Meal Plan
router.delete('/meal-plans/:id', auth(['provider']), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid meal plan ID' });
    }
    const mealPlan = await MealPlan.findOne({ _id: req.params.id, providerId: req.user.id });
    if (!mealPlan) return res.status(404).json({ error: 'Meal plan not found or not assigned to you' });
    await MealPlan.deleteOne({ _id: req.params.id });
    res.json({ message: 'Meal plan deleted successfully' });
  } catch (err) {
    console.error('Error deleting meal plan:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get Education Resources
router.get('/education', auth(['provider']), async (req, res) => {
  try {
    const resources = await EducationResource.find({ providerId: req.user.id }).sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    console.error('Error fetching education resources:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Add Education Resource
router.post('/education', auth(['provider']), async (req, res) => {
  const { title, description, url } = req.body;
  if (!title?.trim() || !description?.trim()) return res.status(400).json({ error: 'Title and description are required' });
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
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Update Patient
router.put('/patients/:id', auth(['provider']), async (req, res) => {
  const { name, email } = req.body;
  if (!name?.trim() || !email?.trim()) return res.status(400).json({ error: 'Name and email are required' });
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }
    const patient = await User.findOne({ _id: req.params.id, role: 'patient', provider: req.user.id });
    if (!patient) return res.status(404).json({ error: 'Patient not found or not assigned to you' });
    patient.name = name;
    patient.email = email;
    await patient.save();
    res.json(patient);
  } catch (err) {
    console.error('Error updating patient:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Delete Patient
router.delete('/patients/:id', auth(['provider']), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }
    const patient = await User.findOne({ _id: req.params.id, role: 'patient', provider: req.user.id });
    if (!patient) return res.status(404).json({ error: 'Patient not found or not assigned to you' });
    await User.deleteOne({ _id: req.params.id });
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    console.error('Error deleting patient:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;