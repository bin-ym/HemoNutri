const mongoose = require('mongoose');

const nutrientSchema = new mongoose.Schema({
  carbohydrates: { type: Number, default: 0 },
  proteins: { type: Number, default: 0 },
  lipids: { type: Number, default: 0 },
});

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  isFluid: { type: Boolean, default: false },
  carbohydrates: { type: Number, default: 0 },
  proteins: { type: Number, default: 0 },
  lipids: { type: Number, default: 0 },
  potassium: { type: Number, default: 0 },
  phosphorus: { type: Number, default: 0 },
  sodium: { type: Number, default: 0 },
});

const fluidItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  units: { type: Number, required: true },
  totalFluid: { type: Number, required: true },
  potassium: { type: Number, default: 0 },
  phosphorus: { type: Number, default: 0 },
  sodium: { type: Number, default: 0 },
});

const recommendedFoodsSchema = new mongoose.Schema({
  breakfast: [foodItemSchema],
  lunch: [foodItemSchema],
  dinner: [foodItemSchema],
});

const hemodialysisLimitsSchema = new mongoose.Schema({
  potassium: { type: Number, default: 2000 },
  phosphorus: { type: Number, default: 800 },
  sodium: { type: Number, default: 2000 },
  fluid: { type: Number, default: 1000 },
});

const mealPlanSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  breakfast: nutrientSchema,
  lunch: nutrientSchema,
  dinner: nutrientSchema,
  hemodialysisLimits: hemodialysisLimitsSchema,
  consumed: {
    breakfast: { type: Boolean, default: false },
    lunch: { type: Boolean, default: false },
    dinner: { type: Boolean, default: false },
  },
  recommendedFoods: recommendedFoodsSchema,
  recommendedFluids: [fluidItemSchema], // Add recommendedFluids
  updatedAt: { type: Date, default: Date.now },
});

mealPlanSchema.index({ patientId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('MealPlan', mealPlanSchema);