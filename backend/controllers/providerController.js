const FoodLog = require('../models/FoodLog');
const User = require('../models/User');

const getPatientLogs = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' });
    const logs = await FoodLog.find({ userId: { $in: patients.map(p => p._id) } });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getPatientLogs };