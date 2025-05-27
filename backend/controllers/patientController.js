const FoodLog = require("../models/FoodLog");
const MealPlan = require("../models/MealPlan");
const User = require("../models/User");
const Message = require("../models/Message");
const EducationResource = require("../models/EducationResource");

// Predefined nutrient database (per 100g or 100ml)
const nutrientDatabase = {
  "White Rice": {
    carbohydrates: 28,
    proteins: 2.7,
    lipids: 0.3,
    potassium: 35,
    phosphorus: 43,
    sodium: 1,
  },
  "Bread (White)": {
    carbohydrates: 49,
    proteins: 9,
    lipids: 3.6,
    potassium: 100,
    phosphorus: 90,
    sodium: 491,
  },
  "Pasta (Cooked)": {
    carbohydrates: 25,
    proteins: 5,
    lipids: 1.1,
    potassium: 44,
    phosphorus: 58,
    sodium: 1,
  },
  Apple: {
    carbohydrates: 14,
    proteins: 0.3,
    lipids: 0.2,
    potassium: 107,
    phosphorus: 11,
    sodium: 1,
  },
  "Chicken Breast (Skinless)": {
    carbohydrates: 0,
    proteins: 31,
    lipids: 3.6,
    potassium: 256,
    phosphorus: 220,
    sodium: 74,
  },
  "Egg Whites": {
    carbohydrates: 0.7,
    proteins: 11,
    lipids: 0.2,
    potassium: 163,
    phosphorus: 15,
    sodium: 166,
  },
  "Fish (Cod)": {
    carbohydrates: 0,
    proteins: 18,
    lipids: 0.7,
    potassium: 413,
    phosphorus: 203,
    sodium: 54,
  },
  Tofu: {
    carbohydrates: 1.9,
    proteins: 8,
    lipids: 4.8,
    potassium: 121,
    phosphorus: 97,
    sodium: 7,
  },
  "Olive Oil": {
    carbohydrates: 0,
    proteins: 0,
    lipids: 100,
    potassium: 1,
    phosphorus: 0,
    sodium: 2,
  },
  Avocado: {
    carbohydrates: 9,
    proteins: 2,
    lipids: 15,
    potassium: 485,
    phosphorus: 52,
    sodium: 7,
  },
  Almonds: {
    carbohydrates: 22,
    proteins: 21,
    lipids: 50,
    potassium: 733,
    phosphorus: 481,
    sodium: 1,
  },
  "Butter (Unsalted)": {
    carbohydrates: 0.1,
    proteins: 0.9,
    lipids: 81,
    potassium: 24,
    phosphorus: 24,
    sodium: 11,
  },
  Water: {
    carbohydrates: 0,
    proteins: 0,
    lipids: 0,
    potassium: 0,
    phosphorus: 0,
    sodium: 0,
  }, // Fluid example
};

const getFoodLogs = async (req, res) => {
  try {
    const logs = await FoodLog.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    console.error("Get food logs error:", err.stack);
    res.status(500).json({ error: "Server error" });
  }
};

const addFoodLog = async (req, res) => {
  const { foodItem, quantity, isFluid } = req.body;
  try {
    const numericQuantity = parseFloat(quantity) || 0;
    if (!foodItem || numericQuantity <= 0) {
      throw new Error("Food item and a valid quantity are required");
    }

    const nutrientData = nutrientDatabase[foodItem] || {
      carbohydrates: 0,
      proteins: 0,
      lipids: 0,
      potassium: 0,
      phosphorus: 0,
      sodium: 0,
    };

    const scalingFactor = numericQuantity / 100;
    const foodLog = new FoodLog({
      userId: req.user.id,
      foodItem,
      quantity: numericQuantity,
      isFluid: !!isFluid,
      carbohydrates: (nutrientData.carbohydrates * scalingFactor).toFixed(1),
      proteins: (nutrientData.proteins * scalingFactor).toFixed(1),
      lipids: (nutrientData.lipids * scalingFactor).toFixed(1),
      potassium: (nutrientData.potassium * scalingFactor).toFixed(1),
      phosphorus: (nutrientData.phosphorus * scalingFactor).toFixed(1),
      sodium: (nutrientData.sodium * scalingFactor).toFixed(1),
      date: new Date(),
    });
    await foodLog.save();
    console.log("Food log added:", foodLog.toObject());
    res.status(201).json(foodLog);
  } catch (err) {
    console.error("Add food log error:", err.stack);
    res
      .status(400)
      .json({ error: "Failed to add food log", details: err.message });
  }
};

const getMealPlan = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mealPlan = await MealPlan.findOne({
      patientId: req.user.id,
      date: today,
    });
    if (!mealPlan) {
      return res.json({
        breakfast: { carbohydrates: 0, proteins: 0, lipids: 0 },
        lunch: { carbohydrates: 0, proteins: 0, lipids: 0 },
        dinner: { carbohydrates: 0, proteins: 0, lipids: 0 },
        hemodialysisLimits: {
          potassium: 2000,
          phosphorus: 800,
          sodium: 2000,
          fluid: 1000,
        },
        consumed: { breakfast: false, lunch: false, dinner: false },
        recommendedFoods: { breakfast: [], lunch: [], dinner: [] },
        recommendedFluids: [], // Add recommendedFluids
      });
    }
    const sanitizedPlan = {
      breakfast: {
        carbohydrates: Number(mealPlan.breakfast.carbohydrates) || 0,
        proteins: Number(mealPlan.breakfast.proteins) || 0,
        lipids: Number(mealPlan.breakfast.lipids) || 0,
      },
      lunch: {
        carbohydrates: Number(mealPlan.lunch.carbohydrates) || 0,
        proteins: Number(mealPlan.lunch.proteins) || 0,
        lipids: Number(mealPlan.lunch.lipids) || 0,
      },
      dinner: {
        carbohydrates: Number(mealPlan.dinner.carbohydrates) || 0,
        proteins: Number(mealPlan.dinner.proteins) || 0,
        lipids: Number(mealPlan.dinner.lipids) || 0,
      },
      hemodialysisLimits: {
        potassium: Number(mealPlan.hemodialysisLimits.potassium) || 2000,
        phosphorus: Number(mealPlan.hemodialysisLimits.phosphorus) || 800,
        sodium: Number(mealPlan.hemodialysisLimits.sodium) || 2000,
        fluid: Number(mealPlan.hemodialysisLimits.fluid) || 1000,
      },
      consumed: mealPlan.consumed || {
        breakfast: false,
        lunch: false,
        dinner: false,
      },
      recommendedFoods: mealPlan.recommendedFoods || {
        breakfast: [],
        lunch: [],
        dinner: [],
      },
      recommendedFluids: mealPlan.recommendedFluids || [], // Include recommendedFluids
    };
    res.json(sanitizedPlan);
  } catch (err) {
    console.error("Meal plan fetch error:", err.stack);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

const updateMealConsumption = async (req, res) => {
  const { mealType, consumed } = req.body;
  try {
    if (!["breakfast", "lunch", "dinner"].includes(mealType)) {
      return res.status(400).json({ error: "Invalid meal type" });
    }
    if (typeof consumed !== "boolean") {
      return res.status(400).json({ error: "Consumed must be a boolean" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mealPlan = await MealPlan.findOne({
      patientId: req.user.id,
      date: today,
    });
    if (!mealPlan) {
      return res.status(404).json({ error: "No meal plan found for today" });
    }

    mealPlan.consumed[mealType] = consumed;
    mealPlan.updatedAt = new Date();
    await mealPlan.save();

    const sanitizedPlan = {
      breakfast: {
        carbohydrates: Number(mealPlan.breakfast.carbohydrates) || 0,
        proteins: Number(mealPlan.breakfast.proteins) || 0,
        lipids: Number(mealPlan.breakfast.lipids) || 0,
      },
      lunch: {
        carbohydrates: Number(mealPlan.lunch.carbohydrates) || 0,
        proteins: Number(mealPlan.lunch.proteins) || 0,
        lipids: Number(mealPlan.lunch.lipids) || 0,
      },
      dinner: {
        carbohydrates: Number(mealPlan.dinner.carbohydrates) || 0,
        proteins: Number(mealPlan.dinner.proteins) || 0,
        lipids: Number(mealPlan.dinner.lipids) || 0,
      },
      hemodialysisLimits: {
        potassium: Number(mealPlan.hemodialysisLimits.potassium) || 0,
        phosphorus: Number(mealPlan.hemodialysisLimits.phosphorus) || 0,
        sodium: Number(mealPlan.hemodialysisLimits.sodium) || 0,
        fluid: Number(mealPlan.hemodialysisLimits.fluid) || 0,
      },
      consumed: mealPlan.consumed,
      recommendedFoods: mealPlan.recommendedFoods || {
        breakfast: [],
        lunch: [],
        dinner: [],
      },
    };
    res.json(sanitizedPlan);
  } catch (err) {
    console.error("Meal plan consumption update error:", err.stack);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

const sendMessage = async (req, res) => {
  const { content, recipientId } = req.body;
  if (!content?.trim())
    return res.status(400).json({ error: "Message content is required" });
  try {
    const patient = await User.findById(req.user.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    const recipient = recipientId
      ? await User.findById(recipientId)
      : await User.findById(patient.provider);
    if (!recipient)
      return res.status(400).json({ error: "Recipient not found" });

    const message = new Message({
      sender: req.user.id,
      recipient: recipient._id,
      content,
      patientUsername: patient.username,
      providerUsername: recipient.role === "provider" ? recipient.username : "",
    });
    await message.save();
    console.log("Patient message saved:", message.toObject());
    res.status(201).json(message);
  } catch (err) {
    console.error("Message send error:", err.stack);
    res.status(500).json({ error: "Server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { recipient: req.user.id }],
    })
      .populate("sender", "username role")
      .populate("recipient", "username role")
      .sort({ createdAt: -1 });
    console.log(
      "Fetched patient messages:",
      messages.map((msg) => msg.toObject())
    );
    res.json(messages);
  } catch (err) {
    console.error("Messages fetch error:", err.stack);
    res.status(500).json({ error: "Server error" });
  }
};

const markMessagesRead = async (req, res) => {
  try {
    const patientId = req.user.id;
    const result = await Message.updateMany(
      { recipient: patientId, read: false },
      { $set: { read: true } }
    );
    console.log("Messages marked as read:", result.modifiedCount);
    res.json({
      message: "Messages marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("Mark messages read error:", err.stack);
    res.status(500).json({ error: "Server error" });
  }
};

const getResources = async (req, res) => {
  try {
    const patient = await User.findById(req.user.id);
    if (!patient) return res.status(404).json({ error: "User not found" });
    const providerId =
      req.user.role === "patient" ? patient.provider : req.user.id;
    const resources = await EducationResource.find({ providerId });
    res.json(
      resources.map((r) => ({
        _id: r._id,
        title: r.title,
        content: r.description,
      }))
    );
  } catch (err) {
    console.error("Resources fetch error:", err.stack);
    res.status(500).json({ error: "Server error" });
  }
};

const sendEmergency = async (req, res) => {
  const { message } = req.body;
  try {
    const patient = await User.findById(req.user.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    if (!patient.provider)
      return res.status(400).json({ error: "No provider assigned" });
    const provider = await User.findById(patient.provider);
    const emergencyMessage = new Message({
      sender: req.user.id,
      recipient: patient.provider,
      content: message?.trim() || "Urgent: Patient needs immediate assistance!",
      isEmergency: true,
      patientUsername: patient.username,
      providerUsername: provider.username,
    });
    await emergencyMessage.save();
    console.log("Emergency message saved:", emergencyMessage.toObject());
    res
      .status(201)
      .json({ success: true, message: "Emergency alert sent to provider" });
  } catch (err) {
    console.error("Emergency send error:", err.stack);
    res.status(500).json({ error: "Server error" });
  }
};

const getNotifications = async (req, res) => {
  res.json([]); // Placeholder implementation
};
const getConversation = async (req, res) => {
  try {
    const patientId = req.user.id; // Logged-in patient ID
    const { userId } = req.params; // ID of the admin or provider to fetch messages with

    // Fetch messages where the patient is either the sender or recipient, and the other user matches userId
    const messages = await Message.find({
      $or: [
        { sender: patientId, recipient: userId },
        { sender: userId, recipient: patientId },
      ],
    })
      .populate("sender", "username role")
      .populate("recipient", "username role")
      .sort({ createdAt: -1 }); // Sort by most recent

    if (!messages || messages.length === 0) {
      return res.status(200).json([]); // Return empty array if no messages found
    }

    console.log(
      "Fetched conversation messages:",
      messages.map((msg) => msg.toObject())
    );
    res.status(200).json(messages);
  } catch (err) {
    console.error("Get conversation error:", err.stack);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getFoodLogs,
  addFoodLog,
  getMealPlan,
  updateMealConsumption,
  sendMessage,
  getMessages,
  markMessagesRead,
  getResources,
  sendEmergency,
  getNotifications,
  getConversation,
};
