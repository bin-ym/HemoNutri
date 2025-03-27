const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  breakfast: [{ name: String, quantity: Number, isFluid: Boolean }],
  lunch: [{ name: String, quantity: Number, isFluid: Boolean }],
  dinner: [{ name: String, quantity: Number, isFluid: Boolean }],
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MealPlan', mealPlanSchema);