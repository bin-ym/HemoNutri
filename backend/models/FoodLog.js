const mongoose = require('mongoose');

const foodLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  foodItem: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  isFluid: {
    type: Boolean,
    default: false,
  },
  carbohydrates: { type: Number, default: 0 }, // grams
  proteins: { type: Number, default: 0 }, // grams
  lipids: { type: Number, default: 0 }, // grams
  potassium: { type: Number, default: 0 }, // mg
  phosphorus: { type: Number, default: 0 }, // mg
  sodium: { type: Number, default: 0 }, // mg
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('FoodLog', foodLogSchema);