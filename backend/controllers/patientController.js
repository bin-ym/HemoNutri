const FoodLog = require('../models/FoodLog');
const MealPlan = require('../models/MealPlan');

// Predefined nutrient database (per 100g or 100ml)
const nutrientDatabase = {
  'White Rice': { carbohydrates: 28, proteins: 2.7, lipids: 0.3, potassium: 35, phosphorus: 43, sodium: 1 },
  'Bread (White)': { carbohydrates: 49, proteins: 9, lipids: 3.6, potassium: 100, phosphorus: 90, sodium: 491 },
  'Pasta (Cooked)': { carbohydrates: 25, proteins: 5, lipids: 1.1, potassium: 44, phosphorus: 58, sodium: 1 },
  'Apple': { carbohydrates: 14, proteins: 0.3, lipids: 0.2, potassium: 107, phosphorus: 11, sodium: 1 },
  'Chicken Breast (Skinless)': { carbohydrates: 0, proteins: 31, lipids: 3.6, potassium: 256, phosphorus: 220, sodium: 74 },
  'Egg Whites': { carbohydrates: 0.7, proteins: 11, lipids: 0.2, potassium: 163, phosphorus: 15, sodium: 166 },
  'Fish (Cod)': { carbohydrates: 0, proteins: 18, lipids: 0.7, potassium: 413, phosphorus: 203, sodium: 54 },
  'Tofu': { carbohydrates: 1.9, proteins: 8, lipids: 4.8, potassium: 121, phosphorus: 97, sodium: 7 },
  'Olive Oil': { carbohydrates: 0, proteins: 0, lipids: 100, potassium: 1, phosphorus: 0, sodium: 2 },
  'Avocado': { carbohydrates: 9, proteins: 2, lipids: 15, potassium: 485, phosphorus: 52, sodium: 7 },
  'Almonds': { carbohydrates: 22, proteins: 21, lipids: 50, potassium: 733, phosphorus: 481, sodium: 1 },
  'Butter (Unsalted)': { carbohydrates: 0.1, proteins: 0.9, lipids: 81, potassium: 24, phosphorus: 24, sodium: 11 },
  'Water': { carbohydrates: 0, proteins: 0, lipids: 0, potassium: 0, phosphorus: 0, sodium: 0 }, // Fluid example
};

const addFoodLog = async (req, res) => {
  const { foodItem, quantity, isFluid } = req.body;
  try {
    const numericQuantity = parseFloat(quantity) || 0;
    if (!foodItem || numericQuantity <= 0) {
      throw new Error('Food item and a valid quantity are required');
    }

    // Look up nutrient data
    const nutrientData = nutrientDatabase[foodItem] || {
      carbohydrates: 0,
      proteins: 0,
      lipids: 0,
      potassium: 0,
      phosphorus: 0,
      sodium: 0,
    };

    // Calculate nutrients based on quantity (per 100g or 100ml)
    const scalingFactor = numericQuantity / 100;
    const foodLog = new FoodLog({
      userId: req.user.id,
      foodItem,
      quantity: numericQuantity,
      isFluid: !!isFluid,
      carbohydrates: (nutrientData.carbohydrates * scalingFactor).toFixed(1),
      proteins: (nutrientData.proteins * scalingFactor).toFixed(1),
      lipids: (nutrientData.lipids * scalingFactor).toFixed(1),
      potassium: (nutrientData.potassium * scalingFactor).toFixed(1),
      phosphorus: (nutrientData.phosphorus * scalingFactor).toFixed(1),
      sodium: (nutrientData.sodium * scalingFactor).toFixed(1),
      date: new Date(),
    });
    await foodLog.save();
    console.log('Food log added:', foodLog.toObject());
    res.status(201).json(foodLog);
  } catch (err) {
    console.error('Add food log error:', err.message);
    res.status(400).json({ error: 'Failed to add food log', details: err.message });
  }
};

const getFoodLogs = async (req, res) => {
  try {
    const logs = await FoodLog.find({ userId: req.user.id }).sort({ date: -1 });
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
    const mealPlan = await MealPlan.findOne({ patientId: req.user.id });
    if (!mealPlan) {
      return res.json({
        breakfast: { carbohydrates: 0, proteins: 0, lipids: 0 },
        lunch: { carbohydrates: 0, proteins: 0, lipids: 0 },
        dinner: { carbohydrates: 0, proteins: 0, lipids: 0 },
        hemodialysisLimits: { potassium: 0, phosphorus: 0, sodium: 0, fluid: 0 },
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
    };
    res.json(sanitizedPlan);
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