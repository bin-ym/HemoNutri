const User = require('../models/User');
const FoodLog = require('../models/FoodLog');
const MealPlan = require('../models/MealPlan');
const Message = require('../models/Message');
const EducationResource = require('../models/EducationResource');
const mongoose = require('mongoose');

const getPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient', provider: req.user.id })
      .select('username email firstName lastName assessment');
    const patientIds = patients.map((p) => p._id);
    const foodLogs = await FoodLog.find({ userId: { $in: patientIds } })
      .sort({ date: -1 })
      .lean();

    const patientsWithLogs = patients.map((patient) => {
      const patientLogs = foodLogs.filter((log) => log.userId.toString() === patient._id.toString());
      return {
        ...patient.toObject(),
        foodLogs: patientLogs,
      };
    });

    console.log('providerController: Fetched patients with logs', {
      providerId: req.user.id,
      patientCount: patientsWithLogs.length,
    });
    res.json(patientsWithLogs);
  } catch (err) {
    console.error('providerController: Get patients error:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const getPatientDetails = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('providerController: Invalid patient ID', { id: req.params.id });
      return res.status(400).json({ error: 'Invalid patient ID' });
    }
    const patient = await User.findOne({
      _id: req.params.id,
      role: 'patient',
      provider: req.user.id,
    }).select('username email firstName lastName assessment');
    if (!patient) {
      console.log('providerController: Patient not found or not assigned', {
        id: req.params.id,
        providerId: req.user.id,
      });
      return res.status(404).json({ error: 'Patient not found or not assigned to you' });
    }
    console.log('providerController: Fetched patient details', {
      patientId: req.params.id,
      providerId: req.user.id,
    });
    res.json(patient);
  } catch (err) {
    console.error('providerController: Get patient details error:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const getPatientFoodLogs = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('providerController: Invalid patient ID', { id: req.params.id });
      return res.status(400).json({ error: 'Invalid patient ID' });
    }
    const patient = await User.findOne({
      _id: req.params.id,
      role: 'patient',
      provider: req.user.id,
    });
    if (!patient) {
      console.log('providerController: Patient not found or not assigned', {
        id: req.params.id,
        providerId: req.user.id,
      });
      return res.status(404).json({ error: 'Patient not found or not assigned to you' });
    }
    const logs = await FoodLog.find({ userId: req.params.id })
      .sort({ date: -1 })
      .lean();
    console.log('providerController: Fetched patient food logs', {
      patientId: req.params.id,
      logCount: logs.length,
    });
    res.json(logs);
  } catch (err) {
    console.error('providerController: Get patient food logs error:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const getPatientAssessment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('providerController: Invalid patient ID', { id: req.params.id });
      return res.status(400).json({ error: 'Invalid patient ID' });
    }
    const patient = await User.findOne({
      _id: req.params.id,
      role: 'patient',
      provider: req.user.id,
    }).select('assessment');
    if (!patient) {
      console.log('providerController: Patient not found or not assigned', {
        id: req.params.id,
        providerId: req.user.id,
      });
      return res.status(404).json({ error: 'Patient not found or not assigned to you' });
    }
    const assessment = patient.assessment || { weight: 'N/A', height: 'N/A', dietHabits: 'N/A' };
    console.log('providerController: Fetched patient assessment', {
      patientId: req.params.id,
      providerId: req.user.id,
    });
    res.json(assessment);
  } catch (err) {
    console.error('providerController: Get patient assessment error:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const getAllLogs = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient', provider: req.user.id }).select('_id');
    const patientIds = patients.map((p) => p._id);
    const logs = await FoodLog.find({ userId: { $in: patientIds } })
      .sort({ date: -1 })
      .populate('userId', 'username')
      .lean();
    console.log('providerController: Fetched all logs', {
      providerId: req.user.id,
      logCount: logs.length,
    });
    res.json(logs);
  } catch (err) {
    console.error('providerController: Get all logs error:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const getMessages = async (req, res) => {
  console.log("getMessages called with user:", req.user);
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { recipient: req.user.id }],
    })
      .populate('sender', 'username role')
      .populate('recipient', 'username role')
      .sort({ createdAt: -1 })
      .lean();
    console.log('providerController: Fetched provider messages', {
      providerId: req.user.id,
      messageCount: messages.length,
    });
    res.json(messages);
  } catch (err) {
    console.error('providerController: Get messages error:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const getPatientMessages = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.patientId)) {
      console.log('providerController: Invalid patient ID', { patientId: req.params.patientId });
      return res.status(400).json({ error: 'Invalid patient ID' });
    }
    const patient = await User.findOne({
      _id: req.params.patientId,
      role: 'patient',
      provider: req.user.id,
    });
    if (!patient) {
      console.log('providerController: Patient not found or not assigned', {
        patientId: req.params.patientId,
        providerId: req.user.id,
      });
      return res.status(404).json({ error: 'Patient not found or not assigned to you' });
    }
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: req.params.patientId },
        { sender: req.params.patientId, recipient: req.user.id },
      ],
    })
      .populate('sender', 'username role')
      .populate('recipient', 'username role')
      .sort({ createdAt: -1 })
      .lean();
    console.log('providerController: Fetched patient-specific messages', {
      patientId: req.params.patientId,
      messageCount: messages.length,
    });
    res.json(messages);
  } catch (err) {
    console.error('providerController: Get patient messages error:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const sendMessage = async (req, res) => {
  const { content } = req.body;
  try {
    if (!content?.trim()) {
      console.log('providerController: Missing message content', { providerId: req.user.id });
      return res.status(400).json({ error: 'Message content is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('providerController: Invalid patient ID', { id: req.params.id });
      return res.status(400).json({ error: 'Invalid patient ID' });
    }
    const patient = await User.findOne({
      _id: req.params.id,
      role: 'patient',
      provider: req.user.id,
    });
    if (!patient) {
      console.log('providerController: Patient not found or not assigned', {
        id: req.params.id,
        providerId: req.user.id,
      });
      return res.status(404).json({ error: 'Patient not found or not assigned to you' });
    }
    const provider = await User.findById(req.user.id);
    const message = new Message({
      sender: req.user.id,
      recipient: req.params.id,
      content,
      providerUsername: provider.username,
      patientUsername: patient.username,
    });
    await message.save();
    console.log('providerController: Provider message saved', {
      messageId: message._id,
      patientId: req.params.id,
    });
    res.json(message);
  } catch (err) {
    console.error('providerController: Send message error:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const getMealPlans = async (req, res) => {
  try {
    const mealPlans = await MealPlan.find({ providerId: req.user.id })
      .populate('patientId', 'username')
      .lean();
    console.log('providerController: Fetched meal plans', {
      providerId: req.user.id,
      planCount: mealPlans.length,
    });
    res.json(mealPlans);
  } catch (err) {
    console.error('providerController: Get meal plans error:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const saveMealPlan = async (req, res) => {
  const { breakfast, lunch, dinner, hemodialysisLimits, date, recommendedFoods } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('providerController: Invalid patient ID', { id: req.params.id });
      return res.status(400).json({ error: 'Invalid patient ID' });
    }
    if (!breakfast || !lunch || !dinner || !hemodialysisLimits || !date) {
      console.log('providerController: Missing required fields', { body: req.body });
      return res.status(400).json({ error: 'All meal fields, hemodialysis limits, and date are required' });
    }

    const validateNutrients = (meal) => {
      return (
        typeof meal.carbohydrates === 'number' &&
        !isNaN(meal.carbohydrates) &&
        meal.carbohydrates >= 0 &&
        typeof meal.proteins === 'number' &&
        !isNaN(meal.proteins) &&
        meal.proteins >= 0 &&
        typeof meal.lipids === 'number' &&
        !isNaN(meal.lipids) &&
        meal.lipids >= 0
      );
    };

    const validateLimits = (limits) => {
      return (
        typeof limits.potassium === 'number' &&
        !isNaN(limits.potassium) &&
        limits.potassium >= 0 &&
        typeof limits.phosphorus === 'number' &&
        !isNaN(limits.phosphorus) &&
        limits.phosphorus >= 0 &&
        typeof limits.sodium === 'number' &&
        !isNaN(limits.sodium) &&
        limits.sodium >= 0 &&
        typeof limits.fluid === 'number' &&
        !isNaN(limits.fluid) &&
        limits.fluid >= 0
      );
    };

    if (!validateNutrients(breakfast) || !validateNutrients(lunch) || !validateNutrients(dinner)) {
      console.log('providerController: Invalid nutrient values', { breakfast, lunch, dinner });
      return res.status(400).json({
        error: 'Invalid nutrient values for meals. All values must be non-negative numbers.',
      });
    }

    if (!validateLimits(hemodialysisLimits)) {
      console.log('providerController: Invalid hemodialysis limits', { hemodialysisLimits });
      return res.status(400).json({
        error: 'Invalid hemodialysis limits. All values must be non-negative numbers.',
      });
    }

    const mealPlanDate = new Date(date);
    if (isNaN(mealPlanDate.getTime())) {
      console.log('providerController: Invalid date format', { date });
      return res.status(400).json({ error: 'Invalid date format' });
    }
    mealPlanDate.setHours(0, 0, 0, 0);

    const patient = await User.findOne({
      _id: req.params.id,
      role: 'patient',
      provider: req.user.id,
    });
    if (!patient) {
      console.log('providerController: Patient not found or not assigned', {
        id: req.params.id,
        providerId: req.user.id,
      });
      return res.status(404).json({ error: 'Patient not found or not assigned to you' });
    }

    let mealPlan = await MealPlan.findOne({
      patientId: req.params.id,
      date: mealPlanDate,
    });
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
    console.log('providerController: Meal plan saved', {
      mealPlanId: mealPlan._id,
      patientId: req.params.id,
    });
    res.json(mealPlan);
  } catch (err) {
    console.error('providerController: Save meal plan error:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const updateMealPlan = async (req, res) => {
  const { breakfast, lunch, dinner, hemodialysisLimits } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('providerController: Invalid meal plan ID', { id: req.params.id });
      return res.status(400).json({ error: 'Invalid meal plan ID' });
    }
    if (!breakfast || !lunch || !dinner || !hemodialysisLimits) {
      console.log('providerController: Missing required fields', { body: req.body });
      return res.status(400).json({ error: 'All meal fields and hemodialysis limits are required' });
    }

    const validateNutrients = (meal) => {
      return (
        typeof meal.carbohydrates === 'number' &&
        !isNaN(meal.carbohydrates) &&
        meal.carbohydrates >= 0 &&
        typeof meal.proteins === 'number' &&
        !isNaN(meal.proteins) &&
        meal.proteins >= 0 &&
        typeof meal.lipids === 'number' &&
        !isNaN(meal.lipids) &&
        meal.lipids >= 0
      );
    };

    const validateLimits = (limits) => {
      return (
        typeof limits.potassium === 'number' &&
        !isNaN(limits.potassium) &&
        limits.potassium >= 0 &&
        typeof limits.phosphorus === 'number' &&
        !isNaN(limits.phosphorus) &&
        limits.phosphorus >= 0 &&
        typeof limits.sodium === 'number' &&
        !isNaN(limits.sodium) &&
        limits.sodium >= 0 &&
        typeof limits.fluid === 'number' &&
        !isNaN(limits.fluid) &&
        limits.fluid >= 0
      );
    };

    if (!validateNutrients(breakfast) || !validateNutrients(lunch) || !validateNutrients(dinner)) {
      console.log('providerController: Invalid nutrient values', { breakfast, lunch, dinner });
      return res.status(400).json({
        error: 'Invalid nutrient values for meals. All values must be non-negative numbers.',
      });
    }

    if (!validateLimits(hemodialysisLimits)) {
      console.log('providerController: Invalid hemodialysis limits', { hemodialysisLimits });
      return res.status(400).json({
        error: 'Invalid hemodialysis limits. All values must be non-negative numbers.',
      });
    }

    const mealPlan = await MealPlan.findOne({
      _id: req.params.id,
      providerId: req.user.id,
    });
    if (!mealPlan) {
      console.log('providerController: Meal plan not found or not assigned', {
        id: req.params.id,
        providerId: req.user.id,
      });
      return res.status(404).json({ error: 'Meal plan not found or not assigned to you' });
    }

    mealPlan.breakfast = breakfast;
    mealPlan.lunch = lunch;
    mealPlan.dinner = dinner;
    mealPlan.hemodialysisLimits = hemodialysisLimits;
    mealPlan.updatedAt = new Date();
    await mealPlan.save();
    console.log('providerController: Meal plan updated', {
      mealPlanId: req.params.id,
      providerId: req.user.id,
    });
    res.json(mealPlan);
  } catch (err) {
    console.error('providerController: Update meal plan error:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const deleteMealPlan = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('providerController: Invalid meal plan ID', { id: req.params.id });
      return res.status(400).json({ error: 'Invalid meal plan ID' });
    }
    const mealPlan = await MealPlan.findOne({
      _id: req.params.id,
      providerId: req.user.id,
    });
    if (!mealPlan) {
      console.log('providerController: Meal plan not found or not assigned', {
        id: req.params.id,
        providerId: req.user.id,
      });
      return res.status(404).json({ error: 'Meal plan not found or not assigned to you' });
    }
    await MealPlan.deleteOne({ _id: req.params.id });
    console.log('providerController: Meal plan deleted', {
      mealPlanId: req.params.id,
      providerId: req.user.id,
    });
    res.json({ message: 'Meal plan deleted successfully' });
  } catch (err) {
    console.error('providerController: Delete meal plan error:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const getEducationResources = async (req, res) => {
  try {
    const resources = await EducationResource.find({ providerId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    console.log('providerController: Fetched education resources', {
      providerId: req.user.id,
      resourceCount: resources.length,
    });
    res.json(resources);
  } catch (err) {
    console.error('providerController: Get education resources error:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const addEducationResource = async (req, res) => {
  const { title, description, url } = req.body;
  try {
    if (!title?.trim() || !description?.trim()) {
      console.log('providerController: Missing title or description', { title, description });
      return res.status(400).json({ error: 'Title and description are required' });
    }
    const resource = new EducationResource({
      title,
      description,
      url,
      providerId: req.user.id,
    });
    await resource.save();
    console.log('providerController: Education resource added', {
      resourceId: resource._id,
      providerId: req.user.id,
    });
    res.json(resource);
  } catch (err) {
    console.error('providerController: Add education resource error:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const updatePatient = async (req, res) => {
  const { username, firstName, lastName, email } = req.body;
  try {
    if (!username?.trim() || !email?.trim()) {
      console.log('providerController: Missing username or email', { username, email });
      return res.status(400).json({ error: 'Username and email are required' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('providerController: Invalid patient ID', { id: req.params.id });
      return res.status(400).json({ error: 'Invalid patient ID' });
    }
    const patient = await User.findOne({
      _id: req.params.id,
      role: 'patient',
      provider: req.user.id,
    });
    if (!patient) {
      console.log('providerController: Patient not found or not assigned', {
        id: req.params.id,
        providerId: req.user.id,
      });
      return res.status(404).json({ error: 'Patient not found or not assigned to you' });
    }
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
      _id: { $ne: req.params.id },
    });
    if (existingUser) {
      console.log('providerController: Username or email already exists', { username, email });
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    patient.username = username;
    patient.firstName = firstName || patient.firstName;
    patient.lastName = lastName || patient.lastName;
    patient.email = email;
    await patient.save();
    console.log('providerController: Patient updated', {
      patientId: req.params.id,
      providerId: req.user.id,
    });
    res.json({
      username: patient.username,
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      role: patient.role,
    });
  } catch (err) {
    console.error('providerController: Update patient error:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const deletePatient = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('providerController: Invalid patient ID', { id: req.params.id });
      return res.status(400).json({ error: 'Invalid patient ID' });
    }
    const patient = await User.findOne({
      _id: req.params.id,
      role: 'patient',
      provider: req.user.id,
    });
    if (!patient) {
      console.log('providerController: Patient not found or not assigned', {
        id: req.params.id,
        providerId: req.user.id,
      });
      return res.status(404).json({ error: 'Patient not found or not assigned to you' });
    }
    // Delete related data
    await FoodLog.deleteMany({ userId: req.params.id });
    await MealPlan.deleteMany({ patientId: req.params.id });
    await Message.deleteMany({
      $or: [{ sender: req.params.id }, { recipient: req.params.id }],
    });
    await User.deleteOne({ _id: req.params.id });
    console.log('providerController: Patient and related data deleted', {
      patientId: req.params.id,
      providerId: req.user.id,
    });
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    console.error('providerController: Delete patient error:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

module.exports = {
  getPatients,
  getPatientDetails,
  getPatientFoodLogs,
  getPatientAssessment,
  getAllLogs,
  getMessages,
  getPatientMessages,
  sendMessage,
  getMealPlans,
  saveMealPlan,
  updateMealPlan,
  deleteMealPlan,
  getEducationResources,
  addEducationResource,
  updatePatient,
  deletePatient,
};