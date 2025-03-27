const User = require('../models/User');
const FoodLog = require('../models/FoodLog');

const getPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' });
    const patientIds = patients.map((p) => p._id);
    const foodLogs = await FoodLog.find({ userId: { $in: patientIds } }).sort({ date: -1 });

    const patientsWithLogs = patients.map((patient) => {
      const patientLogs = foodLogs.filter((log) => log.userId.equals(patient._id));
      return { ...patient.toObject(), foodLogs: patientLogs };
    });

    console.log('Fetched patients with logs:', patientsWithLogs);
    res.json(patientsWithLogs);
  } catch (err) {
    console.error('Get patients error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getPatients }; // Ensure this line exists