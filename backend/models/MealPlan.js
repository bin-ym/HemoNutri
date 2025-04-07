const mongoose = require('mongoose');

const MealPlanSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  breakfast: [{
    name: { type: String, required: true },
    quantity: { type: String, required: true }, // String to match DB, sanitized in route
    isFluid: { type: Boolean, default: false },
  }],
  lunch: [{
    name: { type: String, required: true },
    quantity: { type: String, required: true },
    isFluid: { type: Boolean, default: false },
  }],
  dinner: [{
    name: { type: String, required: true },
    quantity: { type: String, required: true },
    isFluid: { type: Boolean, default: false },
  }],
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MealPlan', MealPlanSchema);