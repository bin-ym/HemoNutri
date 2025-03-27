// backend/seedResources.js
const EducationalResource = require('./models/EducationalResource');
const User = require('./models/User');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/hemonutri', { useNewUrlParser: true, useUnifiedTopology: true });

const seedResources = async () => {
  try {
    const admin = await User.findOne({ role: 'admin' });
    await EducationalResource.deleteMany({});
    await EducationalResource.insertMany([
      { title: 'Kidney-Friendly Diets', content: 'Limit sodium; try injera with low-salt stews.', createdBy: admin._id },
      { title: 'Hydration Tips', content: 'Aim for 2L water daily, adjust for kidney needs.', createdBy: admin._id },
    ]);
    console.log('Resources seeded');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

seedResources();