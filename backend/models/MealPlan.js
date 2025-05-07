const mongoose = require("mongoose");

const nutrientSchema = new mongoose.Schema({
  carbohydrates: { type: Number, default: 0 }, // grams
  proteins: { type: Number, default: 0 }, // grams
  lipids: { type: Number, default: 0 }, // grams
});

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true }, // grams or ml
  isFluid: { type: Boolean, default: false },
  carbohydrates: { type: Number, default: 0 }, // grams per serving
  proteins: { type: Number, default: 0 }, // grams per serving
  lipids: { type: Number, default: 0 }, // grams per serving
});

const recommendedFoodsSchema = new mongoose.Schema({
  breakfast: [foodItemSchema],
  lunch: [foodItemSchema],
  dinner: [foodItemSchema],
});

const hemodialysisLimitsSchema = new mongoose.Schema({
  potassium: { type: Number, default: 0 }, // mg (target limit)
  phosphorus: { type: Number, default: 0 }, // mg (target limit)
  sodium: { type: Number, default: 0 }, // mg (target limit)
  fluid: { type: Number, default: 0 }, // ml (target limit)
});

const mealPlanSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
  updatedAt: { type: Date, default: Date.now },
});

mealPlanSchema.index({ patientId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("MealPlan", mealPlanSchema);