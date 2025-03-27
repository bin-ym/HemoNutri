const mongoose = require('mongoose');

const foodLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodItem: { type: String, required: true },
  quantity: { type: Number, required: true },
  isFluid: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FoodLog', foodLogSchema);