// backend/controllers/patientController.js
const FoodLog = require('../models/FoodLog');
const MealPlan = require('../models/MealPlan');

const addFoodLog = async (req, res) => {
  const { foodItem, quantity, isFluid } = req.body;
  try {
    const numericQuantity = parseFloat(quantity) || 0;
    if (!foodItem) throw new Error('Food item is required');

    const foodLog = new FoodLog({
      userId: req.user.id,
      foodItem,
      quantity: numericQuantity,
      isFluid: !!isFluid,
      date: new Date(),
    });
    await foodLog.save();
    console.log('Food log added:', foodLog);
    res.status(201).json(foodLog);
  } catch (err) {
    console.error('Add food log error:', err.message);
    res.status(500).json({ error: 'Failed to add food log', details: err.message });
  }
};

const getFoodLogs = async (req, res) => {
  try {
    const logs = await FoodLog.find({ userId: req.user.id });
    res.json(logs);
  } catch (err) {
    console.error('Get food logs error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const getResources = async (req, res) => {
  res.json([]); // Placeholder
};

const getNotifications = async (req, res) => {
  res.json([]); // Placeholder
};

const getMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findOne({ userId: req.user.id });
    res.json(mealPlan || { breakfast: [], lunch: [], dinner: [] });
  } catch (err) {
    console.error('Get meal plan error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  addFoodLog,
  getFoodLogs,
  getResources,
  getNotifications,
  getMealPlan,
};