// backend/controllers/patientController.js
const FoodLog = require('../models/FoodLog');
const Notification = require('../models/Notification');
const MealPlan = require('../models/MealPlan');
const Message = require('../models/Message');
const EducationResource = require('../models/EducationResource');
const User = require('../models/User');

const patientController = {
  getFoodLogs: async (req, res) => {
    try {
      const userId = req.user.id;
      const foodLogs = await FoodLog.find({ user: userId })
        .sort({ date: -1 })
        .lean();
      res.json(foodLogs);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Get food logs error:`, err.stack);
      res.status(500).json({ error: 'server_error' });
    }
  },

  addFoodLog: async (req, res) => {
    try {
      const userId = req.user.id;
      const { foodItem, quantity, isFluid, carbohydrates, proteins, lipids, potassium, phosphorus, sodium } = req.body;

      if (!foodItem || !quantity) {
        return res.status(400).json({ error: 'food_item_quantity_required' });
      }

      const foodLog = new FoodLog({
        user: userId,
        foodItem,
        quantity,
        isFluid: isFluid || false,
        carbohydrates: carbohydrates || 0,
        proteins: proteins || 0,
        lipids: lipids || 0,
        potassium: potassium || 0,
        phosphorus: phosphorus || 0,
        sodium: sodium || 0,
        date: new Date(),
      });

      await foodLog.save();
      res.status(201).json({ message: 'food_log_added', foodLog });
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Add food log error:`, err.stack);
      res.status(500).json({ error: 'server_error' });
    }
  },

  getNotifications: async (req, res) => {
    try {
      const userId = req.user.id;
      const notifications = await Notification.find({ recipients: userId })
        .sort({ createdAt: -1 })
        .populate('sender', 'username')
        .lean();
      res.json(notifications);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Get notifications error:`, err.stack);
      res.status(500).json({ error: 'server_error' });
    }
  },

  getMealPlan: async (req, res) => {
    try {
      const userId = req.user.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mealPlan = await MealPlan.findOne({
        patientId: userId,
        date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
      })
        .populate('providerId', 'username')
        .lean();

      if (!mealPlan) {
        return res.status(404).json({ error: 'meal_plan_not_found' });
      }
      res.json(mealPlan);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Get meal plan error:`, err.stack);
      res.status(500).json({ error: 'server_error' });
    }
  },

  updateMealConsumption: async (req, res) => {
    try {
      const userId = req.user.id;
      const { mealType, consumed } = req.body;

      if (!mealType || typeof consumed !== 'boolean') {
        return res.status(400).json({ error: 'meal_type_consumed_required' });
      }

      if (!['breakfast', 'lunch', 'dinner'].includes(mealType)) {
        return res.status(400).json({ error: 'invalid_meal_type' });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mealPlan = await MealPlan.findOne({
        patientId: userId,
        date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
      });

      if (!mealPlan) {
        return res.status(404).json({ error: 'meal_plan_not_found' });
      }

      mealPlan.consumed[mealType] = consumed;
      mealPlan.updatedAt = new Date();
      await mealPlan.save();

      res.json({ message: 'meal_consumption_updated', mealPlan });
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Update meal consumption error:`, err.stack);
      res.status(500).json({ error: 'server_error' });
    }
  },

  sendMessage: async (req, res) => {
    try {
      const senderId = req.user.id;
      const { recipientId, content, isEmergency } = req.body;

      if (!recipientId || !content) {
        return res.status(400).json({ error: 'recipient_content_required' });
      }

      const recipient = await User.findById(recipientId);
      if (!recipient) {
        return res.status(404).json({ error: 'recipient_not_found' });
      }

      const message = new Message({
        sender: senderId,
        recipient: recipientId,
        content,
        isEmergency: isEmergency || false,
      });

      await message.save();

      if (isEmergency) {
        const notification = new Notification({
          title: 'Emergency Message',
          description: `Emergency from ${req.user.username}: ${content}`,
          sender: senderId,
          recipients: [recipientId],
        });
        await notification.save();
      }

      res.status(201).json({ message: 'message_sent', message });
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Send message error:`, err.stack);
      res.status(500).json({ error: 'server_error' });
    }
  },

  getMessages: async (req, res) => {
    try {
      const userId = req.user.id;
      const messages = await Message.find({
        $or: [{ sender: userId }, { recipient: userId }],
      })
        .populate('sender', 'username role')
        .populate('recipient', 'username role')
        .sort({ createdAt: -1 })
        .lean();
      res.json(messages);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Get messages error:`, err.stack);
      res.status(500).json({ error: 'server_error' });
    }
  },

  markMessagesRead: async (req, res) => {
    try {
      const userId = req.user.id;
      const { messageIds } = req.body;

      if (!messageIds || !Array.isArray(messageIds)) {
        return res.status(400).json({ error: 'message_ids_required' });
      }

      await Message.updateMany(
        { _id: { $in: messageIds }, recipient: userId },
        { read: true }
      );

      res.json({ message: 'messages_marked_read' });
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Mark messages read error:`, err.stack);
      res.status(500).json({ error: 'server_error' });
    }
  },

  getConversation: async (req, res) => {
    try {
      const userId = req.user.id;
      const { userId: otherUserId } = req.params;

      const messages = await Message.find({
        $or: [
          { sender: userId, recipient: otherUserId },
          { sender: otherUserId, recipient: userId },
        ],
      })
        .populate('sender', 'username role')
        .populate('recipient', 'username role')
        .sort({ createdAt: 1 })
        .lean();

      res.json(messages);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Get conversation error:`, err.stack);
      res.status(500).json({ error: 'server_error' });
    }
  },

  getResources: async (req, res) => {
    try {
      const resources = await EducationResource.find()
        .sort({ createdAt: -1 })
        .lean();
      res.json(resources);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Get resources error:`, err.stack);
      res.status(500).json({ error: 'server_error' });
    }
  },

  sendEmergency: async (req, res) => {
    try {
      const userId = req.user.id;
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'message_required' });
      }

      const user = await User.findById(userId).select('username provider');
      if (!user.provider) {
        return res.status(404).json({ error: 'provider_not_found' });
      }

      const notification = new Notification({
        title: 'Emergency Alert',
        description: `Emergency from ${user.username}: ${message}`,
        sender: userId,
        recipients: [user.provider],
      });

      await notification.save();
      res.status(201).json({ message: 'emergency_sent' });
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Send emergency error:`, err.stack);
      res.status(500).json({ error: 'server_error' });
    }
  },
};

module.exports = patientController;