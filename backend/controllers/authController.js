const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const validator = require("validator");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// Email setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Nodemailer configuration error:", error);
  } else {
    console.log("Nodemailer configuration verified:", success);
  }
});

const generateActivationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

const login = async (req, res) => {
  const { identifier, password } = req.body;
  try {
    if (!identifier || !password) {
      return res
        .status(400)
        .json({ error: "Email/username and password are required" });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    if (!user.isActivated)
      return res.status(400).json({ error: "Account not activated" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    if (user.isFirstLogin) {
      if (user.role === "provider") {
        // Providers are assigned as their own provider
        user.provider = user._id;
        user.isFirstLogin = false;
        await user.save();
        console.log(`Provider ${user.username} assigned as own provider`);
      } else if (user.role === "patient") {
        // Patients need to select a provider
        const providers = await User.find({ role: "provider" }).select(
          "username _id"
        );
        if (providers.length > 0) {
          return res.json({
            token,
            role: user.role,
            userId: user._id.toString(),
            isFirstLogin: true,
            needsProviderSelection: true,
            providers: providers.map((p) => ({
              id: p._id.toString(),
              username: p.username,
            })),
          });
        } else {
          // No providers available, proceed without provider
          user.isFirstLogin = false;
          await user.save();
          console.log(`No providers available for patient ${user.username}`);
        }
      } else {
        // Admins or other roles proceed normally
        user.isFirstLogin = false;
        await user.save();
      }
    }

    console.log(`Login successful - User: ${user.username}`);
    res.json({
      token,
      role: user.role,
      userId: user._id.toString(),
      isFirstLogin: user.isFirstLogin,
      needsProviderSelection: false,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const selectProvider = async (req, res) => {
  const { userId, providerId } = req.body;
  try {
    if (!userId || !providerId) {
      return res
        .status(400)
        .json({ error: "User ID and provider ID are required" });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== "patient") {
      return res.status(400).json({ error: "Invalid user or role" });
    }

    const provider = await User.findById(providerId);
    if (!provider || provider.role !== "provider") {
      return res.status(400).json({ error: "Invalid provider" });
    }

    user.provider = providerId;
    user.isFirstLogin = false;
    await user.save();

    console.log(
      `Provider ${provider.username} assigned to patient ${user.username}`
    );
    res.json({ message: "Provider selected successfully" });
  } catch (err) {
    console.error("Select provider error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const register = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  try {
    console.log("Register request received:", {
      firstName,
      lastName,
      email,
      role,
    });
    if (!firstName || !lastName || !email || !password || !role) {
      console.log("Missing fields:", {
        firstName,
        lastName,
        email,
        password,
        role,
      });
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!validator.isEmail(email)) {
      console.log("Invalid email:", email);
      return res.status(400).json({ error: "Invalid email format" });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      console.log("Password does not meet requirements");
      return res.status(400).json({
        error:
          "Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username: `${firstName} ${lastName}` }],
    });
    if (existingUser) {
      console.log("User already exists:", {
        email,
        username: `${firstName} ${lastName}`,
      });
      return res
        .status(400)
        .json({ error: "Email or username already exists" });
    }

    const activationCode = generateActivationCode();
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      username: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      role,
      activationCode,
      activationCodeExpires: Date.now() + 600000, // 10 minutes
      isActivated: false,
    });
    await user.save();
    console.log("User saved:", user);

    try {
      await transporter.sendMail({
        from: `"HemoNutri" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "HemoNutri Account Activation",
        text: `
              Dear ${firstName} ${lastName},
              Thank you for registering with HemoNutri. Please use the following 6-digit code to activate your account:
              ${activationCode}
              Enter this code on the activation page to complete your registration. The code expires in 10 minutes.
              If you did not request this, please ignore this email.
            `,
      });
      console.log(`Activation code sent to ${email}: ${activationCode}`);
    } catch (emailErr) {
      console.error("Email sending error:", emailErr);
      return res.status(500).json({ error: "Failed to send activation email" });
    }

    res.status(201).json({
      message:
        "Registration successful. Please check your email for the activation code.",
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const activateAccount = async (req, res) => {
  const { email, code } = req.body;
  try {
    if (!email || !code) {
      return res
        .status(400)
        .json({ error: "Email and activation code are required" });
    }

    const user = await User.findOne({
      email,
      activationCode: code,
      activationCodeExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: "Invalid or expired activation code" });
    }

    user.isActivated = true;
    user.activationCode = null;
    user.activationCodeExpires = null;
    await user.save();

    res.json({ message: "Account activated successfully" });
  } catch (err) {
    console.error("Activation error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Old and new passwords are required" });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        error:
          "New password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character",
      });
    }

    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid old password" });

    user.password = await bcrypt.hash(newPassword, 12);
    user.isFirstLogin = false;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  const { identifier } = req.body;
  try {
    if (!identifier) {
      return res.status(400).json({ error: "Email or username is required" });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const resetToken = Math.random().toString(36).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await transporter.sendMail({
      from: `"HemoNutri" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "HemoNutri Password Reset",
      text: `
            Dear ${user.username},
            You requested a password reset. Use the token below to reset your password:
            ${resetToken}
            Or click the link: http://localhost:3000/reset-password?token=${resetToken}
            This link expires in 1 hour.
            If you did not request this, please ignore this email.
          `,
    });

    console.log(`Reset email sent to ${user.email}`);
    res.json({ message: "A password reset link has been sent to your email." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token and new password are required" });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        error:
          "New password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character",
      });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ error: "Invalid or expired reset token" });

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "username email role provider"
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      username: user.username,
      email: user.email,
      role: user.role,
      provider: user.provider,
    });
  } catch (err) {
    console.error("Profile fetch error:", err.stack);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
exports.selectProvider = async (req, res) => {
  try {
    const { userId, providerId } = req.body;
    const patient = await User.findById(userId);
    if (!patient || patient.role !== "patient") {
      return res.status(400).json({ error: "Invalid patient" });
    }
    const provider = await User.findById(providerId);
    if (!provider || provider.role !== "provider") {
      return res.status(400).json({ error: "Invalid provider" });
    }
    patient.provider = providerId;
    patient.isFirstLogin = false;
    await patient.save();
    console.log(
      `Provider ${provider.username} assigned to patient ${patient.firstName} ${patient.lastName}`
    );
    res.status(200).json({ message: "Provider selected successfully" });
  } catch (err) {
    console.error("Select provider error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  login,
  register,
  activateAccount,
  changePassword,
  forgotPassword,
  resetPassword,
  getProfile,
  selectProvider,
};
