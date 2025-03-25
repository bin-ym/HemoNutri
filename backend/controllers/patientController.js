const FoodLog = require('../models/FoodLog');

const getLogs = async (req, res) => {
  try {
    const logs = await FoodLog.find({ userId: req.user.id });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addLog = async (req, res) => {
  const { food, amount } = req.body;
  try {
    const log = new FoodLog({ userId: req.user.id, food, amount });
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getLogs, addLog };