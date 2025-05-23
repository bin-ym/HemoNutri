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

const generateTempPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Ensure at least one of each required type
  if (!/[A-Z]/.test(password)) password = password.slice(0, -1) + 'A';
  if (!/[a-z]/.test(password)) password = password.slice(0, -1) + 'a';
  if (!/\d/.test(password)) password = password.slice(0, -1) + '1';
  if (!/[@$!%*?&]/.test(password)) password = password.slice(0, -1) + '@';
  return password;
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

    let isTempPassword = false;
    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch && user.tempPassword) {
      isMatch = await bcrypt.compare(password, user.tempPassword);
      isTempPassword = isMatch;
    }
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    if (isTempPassword) {
      return res.json({
        token,
        role: user.role,
        userId: user._id.toString(),
        isTempPassword: true,
        resetToken: user.resetPasswordToken,
      });
    }

    if (user.isFirstLogin) {
      if (user.role === "provider") {
        user.provider = user._id;
        user.isFirstLogin = false;
        await user.save();
        console.log(`Provider ${user.username} assigned as own provider`);
      } else if (user.role === "patient") {
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
          user.isFirstLogin = false;
          await user.save();
          console.log(`No providers available for patient ${user.username}`);
        }
      } else {
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
        error: "password_requirements",
      });
    }

    const username = `${firstName} ${lastName}`;
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      console.log("User already exists:", { email, username });
      return res
        .status(400)
        .json({ error: "Email or username already exists" });
    }

    const activationCode = generateActivationCode();
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      username,
      firstName,
      lastName,
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
  const { currentPassword, newPassword } = req.body;
  try {
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current and new passwords are required" });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        error: "password_requirements",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "user_not_found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "invalid_current_password" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.isFirstLogin = false;
    await user.save();

    res.json({ message: "password_changed" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "server_error" });
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

    const resetToken = Math.random().toString(36).slice(2); // Secure random token
    const tempPassword = generateTempPassword(); // Standard password
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    user.tempPassword = await bcrypt.hash(tempPassword, 12);
    await user.save();

    await transporter.sendMail({
      from: `"HemoNutri" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "HemoNutri Password Reset",
      text: `
        Dear ${user.username},
        You requested a password reset. Use the temporary password below to reset your password:
        Temporary Password: ${tempPassword}
        Click the link: http://localhost:3000/reset-password?token=${resetToken}
        This link and password expire in 1 hour.
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
  const { token, tempPassword, newPassword } = req.body;
  try {
    if (!token || !tempPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token, temporary password, and new password are required" });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        error: "password_requirements",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ error: "Invalid or expired reset token" });

    const isTempPasswordValid = await bcrypt.compare(tempPassword, user.tempPassword);
    if (!isTempPasswordValid)
      return res.status(400).json({ error: "Invalid temporary password" });

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.tempPassword = null;
    user.isFirstLogin = false;
    await user.save();

    res.json({ message: "Password reset successfully", role: user.role });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "username email role provider firstName lastName"
    );
    if (!user) return res.status(404).json({ error: "user_not_found" });
    res.json({
      username: user.username,
      email: user.email,
      role: user.role,
      provider: user.provider,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (err) {
    console.error("Profile fetch error:", err.stack);
    res.status(500).json({ error: "server_error", details: err.message });
  }
};

const updateProfile = async (req, res) => {
  const { firstName, lastName } = req.body;
  try {
    if (!firstName || !lastName) {
      return res.status(400).json({ error: "firstName_lastName_required" });
    }

    const username = `${firstName} ${lastName}`;
    const existingUser = await User.findOne({
      username,
      _id: { $ne: req.user.id },
    });
    if (existingUser) {
      return res.status(400).json({ error: "username_already_exists" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, username },
      { new: true }
    ).select("username email role provider firstName lastName");
    if (!user) return res.status(404).json({ error: "user_not_found" });

    res.json({
      message: "profile_updated",
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "server_error" });
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
  updateProfile,
};