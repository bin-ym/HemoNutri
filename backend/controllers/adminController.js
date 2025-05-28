// backend/controllers/adminController.js
const User = require("../models/User");
const FoodLog = require("../models/FoodLog");
const EducationalResource = require("../models/EducationResource");
const Notification = require("../models/Notification");
const MealPlan = require("../models/MealPlan");
const Message = require("../models/Message");
const Contact = require("../models/Contact");
const Backup = require("../models/Backup");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const validator = require("validator");
const { generateTempPassword } = require("./authController");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateActivationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const adminController = {
  getContacts: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const [contacts, total] = await Promise.all([
        Contact.find().sort({ createdAt: -1 }).limit(Number(limit)).skip(skip),
        Contact.countDocuments(),
      ]);
      res.setHeader("X-Total-Count", total);
      res.json(contacts);
    } catch (err) {
      console.error(
        `[${new Date().toISOString()}] Contacts fetch error:`,
        err.stack
      );
      res.status(500).json({ error: "server_error" });
    }
  },

  getUsers: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const [users, total] = await Promise.all([
        User.find()
          .select("-password -tempPassword")
          .limit(Number(limit))
          .skip(skip),
        User.countDocuments(),
      ]);
      res.setHeader("X-Total-Count", total);
      res.json(users);
    } catch (err) {
      console.error(
        `[${new Date().toISOString()}] Users fetch error:`,
        err.stack
      );
      res.status(500).json({ error: "server_error" });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ error: "user_not_found" });
      res.status(204).send();
    } catch (err) {
      console.error(
        `[${new Date().toISOString()}] User delete error:`,
        err.stack
      );
      res.status(500).json({ error: "server_error" });
    }
  },

  getResources: async (req, res) => {
    try {
      const resources = await EducationalResource.find().populate(
        "providerId",
        "username"
      );
      res.json(resources);
    } catch (err) {
      console.error(
        `[${new Date().toISOString()}] Resources fetch error:`,
        err.stack
      );
      res.status(500).json({ error: "server_error" });
    }
  },

  deleteResource: async (req, res) => {
    try {
      const resource = await EducationalResource.findByIdAndDelete(
        req.params.id
      );
      if (!resource)
        return res.status(404).json({ error: "resource_not_found" });
      res.status(204).send();
    } catch (err) {
      console.error(
        `[${new Date().toISOString()}] Resource delete error:`,
        err.stack
      );
      res.status(500).json({ error: "server_error" });
    }
  },

  updateResource: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, url } = req.body;

      if (!title || !description) {
        return res.status(400).json({ error: "title_description_required" });
      }

      const resource = await EducationalResource.findById(id);
      if (!resource) {
        return res.status(404).json({ error: "resource_not_found" });
      }

      resource.title = title.trim();
      resource.description = description.trim();
      resource.url = url?.trim() || resource.url;
      resource.updatedAt = Date.now();

      await resource.save();
      const populatedResource = await EducationalResource.findById(id).populate(
        "providerId",
        "username"
      );
      res.json(populatedResource);
    } catch (err) {
      console.error(
        `[${new Date().toISOString()}] Resource update error:`,
        err.stack
      );
      res.status(500).json({ error: "server_error" });
    }
  },

  getUsageReport: async (req, res) => {
    try {
      const filter = req.query.filter || "all";
      let userQuery = {};
      if (filter === "patient") userQuery.role = "patient";
      else if (filter === "provider") userQuery.role = "provider";

      const [users, foodLogsCount, resources] = await Promise.all([
        User.find(userQuery).select("username role"),
        FoodLog.countDocuments(),
        EducationalResource.find().populate("providerId", "username"),
      ]);

      const report = {
        users: users.map((user) => ({
          username: user.username,
          role: user.role,
        })),
        foodLogs: foodLogsCount,
        resources: resources.map((res) => ({
          title: res.title,
          description: res.description,
          url: res.url,
          provider: res.providerId?.username || "Unknown",
        })),
        timestamp: new Date(),
      };
      res.json(report);
    } catch (err) {
      console.error(
        `[${new Date().toISOString()}] Report generation error:`,
        err.stack
      );
      res.status(500).json({ error: "server_error" });
    }
  },

  sendNotification: async (req, res) => {
    const { title, message, recipientType, recipientIds } = req.body;
    try {
      if (!title || !message) {
        return res.status(400).json({ error: "title_message_required" });
      }
      let recipients = [];
      if (recipientType === "all") {
        recipients = await User.find().distinct("_id");
      } else if (recipientType === "patients") {
        recipients = await User.find({ role: "patient" }).distinct("_id");
      } else if (recipientType === "providers") {
        recipients = await User.find({ role: "provider" }).distinct("_id");
      } else if (recipientType === "specific" && Array.isArray(recipientIds)) {
        recipients = await User.find({ _id: { $in: recipientIds } }).distinct(
          "_id"
        );
      } else {
        return res.status(400).json({ error: "invalid_recipient_type" });
      }

      const notification = new Notification({
        title: title.trim(),
        message: message.trim(),
        sender: req.user.id,
        recipients,
      });
      await notification.save();
      res.status(201).json(notification);
    } catch (err) {
      console.error(
        `[${new Date().toISOString()}] Notification send error:`,
        err.stack
      );
      res.status(500).json({ error: "server_error" });
    }
  },

  getUserActivity: async (req, res) => {
    try {
      const { page = 1, limit = 50 } = req.query;
      const logs = await FoodLog.find()
        .populate("userId", "username")
        .sort({ date: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));
      res.json(logs);
    } catch (err) {
      console.error(
        `[${new Date().toISOString()}] User activity fetch error:`,
        err.stack
      );
      res.status(500).json({ error: "server_error" });
    }
  },

  getNotifications: async (req, res) => {
    try {
      const { page = 1, limit = 50 } = req.query;
      const notifications = await Notification.find()
        .populate("sender", "username")
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));
      res.json(notifications);
    } catch (err) {
      console.error(
        `[${new Date().toISOString()}] Notifications fetch error:`,
        err.stack
      );
      res.status(500).json({ error: "server_error" });
    }
  },

  addUser: async (req, res) => {
    const { firstName, lastName, email, role } = req.body;
    try {
      if (!firstName || !lastName || !email || !role) {
        return res.status(400).json({ error: "fields_required" });
      }

      if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "invalid_email" });
      }

      if (!["patient", "provider", "admin"].includes(role)) {
        return res.status(400).json({ error: "invalid_role" });
      }

      const username = `${firstName} ${lastName}`.trim();
      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username }],
      });
      if (existingUser) {
        return res.status(400).json({ error: "user_exists" });
      }

      const tempPassword = generateTempPassword();
      const hashedPassword = await bcrypt.hash(tempPassword, 12);
      const activationCode = generateActivationCode();

      const user = new User({
        username,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        activationCode,
        activationCodeExpires: Date.now() + 600000,
        isActivated: false,
        isFirstLogin: true,
      });

      await user.save();

      try {
        await transporter.sendMail({
          from: `"HemoNutri" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "HemoNutri Account Activation",
          text: `Dear ${firstName} ${lastName},\n\nYour HemoNutri account has been created. Use this temporary password to log in:\n${tempPassword}\n\nActivate your account with this code: ${activationCode}\n\nVisit: http://localhost:3000/activate\n\nCode expires in 10 minutes.`,
        });
      } catch (emailErr) {
        console.error(
          `[${new Date().toISOString()}] Email sending error:`,
          emailErr.stack
        );
        return res.status(200).json({
          message: "user_added_email_failed",
          userId: user._id,
        });
      }

      res.json({ message: "user_added", userId: user._id });
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Add user error:`, err.stack);
      if (err.code === 11000) {
        return res.status(400).json({ error: "user_exists" });
      }
      if (err.name === "ValidationError") {
        return res
          .status(400)
          .json({ error: "validation_error", details: err.message });
      }
      res.status(500).json({ error: "server_error" });
    }
  },

  createResource: async (req, res) => {
    const { title, description, url, providerId } = req.body;
    try {
      if (!title || !description || !providerId) {
        return res.status(400).json({ error: "resource_fields_required" });
      }
      const resource = new EducationalResource({
        title: title.trim(),
        description: description.trim(),
        url: url?.trim(),
        providerId,
      });
      await resource.save();
      const populatedResource = await EducationalResource.findById(
        resource._id
      ).populate("providerId", "username");
      res.status(201).json(populatedResource);
    } catch (err) {
      console.error(
        `[${new Date().toISOString()}] Create resource error:`,
        err.stack
      );
      res.status(500).json({ error: "server_error" });
    }
  },

  createBackup: async (req, res) => {
    try {
      const [users, foodLogs, resources, notifications, mealPlans, messages] =
        await Promise.all([
          User.find().select("-password -tempPassword").lean(),
          FoodLog.find().populate("userId", "username").lean(),
          EducationalResource.find().populate("providerId", "username").lean(),
          Notification.find().populate("sender", "username").lean(),
          MealPlan.find()
            .populate("patientId providerId", "username")
            .lean()
            .catch(() => []),
          Message.find()
            .populate("sender recipient", "username")
            .lean()
            .catch(() => []),
        ]);

      const backupData = {
        users,
        foodLogs,
        resources,
        notifications,
        mealPlans,
        messages,
        timestamp: new Date(),
      };

      const filename = `HemoNutri_Backup_${
        new Date().toISOString().split("T")[0]
      }.json`;
      const backupEntry = new Backup({ filename, data: backupData });
      await backupEntry.save();

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Type", "application/json");
      res.status(200).send(JSON.stringify(backupData, null, 2));
    } catch (err) {
      console.error(
        `[${new Date().toISOString()}] Backup creation error:`,
        err.stack
      );
      res.status(500).json({ error: "server_error" });
    }
  },

  getBackupHistory: async (req, res) => {
    try {
      const backups = await Backup.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .select("filename timestamp");
      res.json(backups);
    } catch (err) {
      console.error(
        `[${new Date().toISOString()}] Backup history fetch error:`,
        err.stack
      );
      res.status(500).json({ error: "server_error" });
    }
  },

  downloadBackup: async (req, res) => {
    try {
      const backup = await Backup.findById(req.params.id);
      if (!backup) {
        return res.status(404).json({ error: "backup_not_found" });
      }

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${backup.filename}"`
      );
      res.setHeader("Content-Type", "application/json");
      res.status(200).send(JSON.stringify(backup.data, null, 2));
    } catch (err) {
      console.error(
        `[${new Date().toISOString()}] Backup download error:`,
        err.stack
      );
      res.status(500).json({ error: "server_error" });
    }
  },
};

module.exports = adminController;
