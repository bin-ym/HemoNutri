const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, "Please provide a valid email address"],
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Contact", contactSchema);