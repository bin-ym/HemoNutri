// backend/seedLogs.js
const FoodLog = require('./models/FoodLog');
const User = require('./models/User');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/hemonutri', { useNewUrlParser: true, useUnifiedTopology: true });

const seedLogs = async () => {
  try {
    const hamerekal = await User.findOne({ username: 'Hamerekal Sendeku' });
    const elbetel = await User.findOne({ username: 'Elbetel Shineda' });
    await FoodLog.deleteMany({});
    await FoodLog.insertMany([
      { user: hamerekal._id, foodItem: 'Apple', quantity: 100, date: new Date() },
      { user: elbetel._id, foodItem: 'Bread', quantity: 200, date: new Date() },
    ]);
    console.log('Food logs seeded');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

seedLogs();