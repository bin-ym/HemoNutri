// backend/config/database.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      retryWrites: true,
      w: "majority",
    });
    console.log(chalk.green(`[${new Date().toISOString()}] ✅ MongoDB connected`));
  } catch (err) {
    console.error(chalk.red(`[${new Date().toISOString()}] ❌ MongoDB connection error:`), err.message);
    process.exit(1);
  }
};

module.exports = connectDB;