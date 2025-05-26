const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const validator = require("validator");
const path = require("path");
const crypto = require("crypto");
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
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Ensure at least one of each required type
  if (!/[A-Z]/.test(password)) password = password.slice(0, -1) + "A";
  if (!/[a-z]/.test(password)) password = password.slice(0, -1) + "a";
  if (!/\d/.test(password)) password = password.slice(0, -1) + "1";
  if (!/[@$!%*?&]/.test(password)) password = password.slice(0, -1) + "@";
  return password;
};

const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex"); // Secure random token
};

const login = async (req, res) => {
  const { identifier, password } = req.body;
  console.log("authController: Login attempt", { identifier });
  try {
    if (!identifier || !password) {
      console.log("authController: Missing fields", { identifier, password });
      return res
        .status(400)
        .json({ error: "Email/username and password are required" });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select(
      "_id username firstName lastName email role provider isActivated isFirstLogin tempPassword resetPasswordToken password"
    );
    if (!user) {
      console.log("authController: User not found", { identifier });
      return res.status(400).json({ error: "Invalid credentials" });
    }
    if (!user.isActivated) {
      console.log("authController: Account not activated", { identifier });
      return res.status(400).json({ error: "Account not activated" });
    }

    let isTempPassword = false;
    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch && user.tempPassword) {
      isMatch = await bcrypt.compare(password, user.tempPassword);
      isTempPassword = isMatch;
    }
    if (!isMatch) {
      console.log("authController: Invalid credentials", { identifier });
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Prepare user data for response
    let firstName = user.firstName;
    let lastName = user.lastName;
    if (!firstName || !lastName) {
      const nameParts = user.username
        ? user.username.split(" ")
        : ["Unknown", ""];
      firstName = nameParts[0] || "Unknown";
      lastName = nameParts.slice(1).join(" ") || "";
    }

    const userData = {
      username: user.username,
      firstName,
      lastName,
      email: user.email,
      role: user.role,
      provider: user.provider ? user.provider.toString() : null,
    };

    if (isTempPassword) {
      console.log("authController: Login with temp password", {
        userId: user._id,
      });
      return res.json({
        token,
        userId: user._id.toString(),
        role: user.role, // Add role
        isTempPassword: true,
        resetToken: user.resetPasswordToken,
        user: userData,
      });
    }

    if (user.isFirstLogin) {
      if (user.role === "provider") {
        user.provider = user._id;
        user.isFirstLogin = false;
        await user.save();
        console.log(
          `authController: Provider ${user.username} assigned as own provider`
        );
      } else if (user.role === "patient") {
        const providers = await User.find({ role: "provider" }).select(
          "username _id"
        );
        if (providers.length > 0) {
          console.log("authController: Providers available for patient", {
            userId: user._id,
          });
          return res.json({
            token,
            userId: user._id.toString(),
            role: user.role, // Add role
            isFirstLogin: true,
            needsProviderSelection: true,
            providers: providers.map((p) => ({
              id: p._id.toString(),
              username: p.username,
            })),
            user: userData,
          });
        } else {
          user.isFirstLogin = false;
          await user.save();
          console.log(
            `authController: No providers available for patient ${user.username}`
          );
        }
      } else {
        user.isFirstLogin = false;
        await user.save();
      }
    }

    console.log(`authController: Login successful`, {
      userId: user._id,
      role: user.role,
      username: user.username,
    });
    res.json({
      token,
      userId: user._id.toString(),
      role: user.role, // Add role
      isFirstLogin: user.isFirstLogin,
      needsProviderSelection: false,
      user: userData,
    });
  } catch (err) {
    console.error("authController: Login error:", err.stack);
    res.status(500).json({ error: "Server error" });
  }
};

const selectProvider = async (req, res) => {
  const { userId, providerId } = req.body;
  console.log("authController: selectProvider", { userId, providerId });
  try {
    if (!userId || !providerId) {
      console.log("authController: Missing fields", { userId, providerId });
      return res
        .status(400)
        .json({ error: "User ID and provider ID are required" });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== "patient") {
      console.log("authController: Invalid user or role", { userId });
      return res.status(400).json({ error: "Invalid user or role" });
    }

    const provider = await User.findById(providerId);
    if (!provider || provider.role !== "provider") {
      console.log("authController: Invalid provider", { providerId });
      return res.status(400).json({ error: "Invalid provider" });
    }

    user.provider = providerId;
    user.isFirstLogin = false;
    await user.save();

    console.log(
      `authController: Provider ${provider.username} assigned to patient ${user.username}`
    );
    res.json({ message: "Provider selected successfully" });
  } catch (err) {
    console.error("authController: Select provider error:", err.stack);
    res.status(500).json({ error: "Server error" });
  }
};

const register = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  console.log("authController: Register request", {
    firstName,
    lastName,
    email,
    role,
  });
  try {
    if (!firstName || !lastName || !email || !password || !role) {
      console.log("authController: Missing fields", {
        firstName,
        lastName,
        email,
        role,
      });
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!validator.isEmail(email)) {
      console.log("authController: Invalid email", { email });
      return res.status(400).json({ error: "Invalid email format" });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      console.log("authController: Password does not meet requirements");
      return res.status(400).json({
        error: "password_requirements",
      });
    }

    const username = `${firstName} ${lastName}`;
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      console.log("authController: User already exists", { email, username });
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
    console.log("authController: User saved", { userId: user._id, email });

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
      console.log(`authController: Activation code sent to ${email}`);
    } catch (emailErr) {
      console.error("authController: Email sending error:", emailErr.stack);
      return res.status(500).json({ error: "Failed to send activation email" });
    }

    res.status(201).json({
      message:
        "Registration successful. Please check your email for the activation code.",
    });
  } catch (err) {
    console.error("authController: Register error:", err.stack);
    res.status(500).json({ error: "Server error" });
  }
};

const activateAccount = async (req, res) => {
  const { email, code } = req.body;
  console.log("authController: activateAccount", { email, code });
  try {
    if (!email || !code) {
      console.log("authController: Missing fields", { email, code });
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
      console.log("authController: Invalid or expired code", { email });
      return res
        .status(400)
        .json({ error: "Invalid or expired activation code" });
    }

    user.isActivated = true;
    user.activationCode = null;
    user.activationCodeExpires = null;
    await user.save();

    console.log("authController: Account activated", { email });
    res.json({ message: "Account activated successfully" });
  } catch (err) {
    console.error("authController: Activation error:", err.stack);
    res.status(500).json({ error: "Server error" });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  console.log("authController: changePassword", { userId: req.user.id });
  try {
    if (!currentPassword || !newPassword) {
      console.log("authController: Missing fields", {
        currentPassword,
        newPassword,
      });
      return res
        .status(400)
        .json({ error: "Current and new passwords are required" });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      console.log("authController: Invalid new password");
      return res.status(400).json({
        error: "password_requirements",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log("authController: User not found", { userId: req.user.id });
      return res.status(404).json({ error: "user_not_found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      console.log("authController: Invalid current password", {
        userId: req.user.id,
      });
      return res.status(400).json({ error: "invalid_current_password" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.isFirstLogin = false;
    user.tempPassword = null; // Clear tempPassword after change
    await user.save();

    console.log("authController: Password changed", { userId: req.user.id });
    res.json({ message: "password_changed" });
  } catch (err) {
    console.error("authController: Change password error:", err.stack);
    res.status(500).json({ error: "server_error" });
  }
};

const forgotPassword = async (req, res) => {
  const { identifier } = req.body;
  console.log("authController: forgotPassword", { identifier });
  try {
    if (!identifier) {
      console.log("authController: Missing identifier");
      return res.status(400).json({ error: "Email or username is required" });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user) {
      console.log("authController: User not found", { identifier });
      return res.status(404).json({ error: "User not found" });
    }

    const resetToken = generateResetToken();
    const tempPassword = generateTempPassword();
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

    console.log(`authController: Reset email sent to ${user.email}`);
    res.json({ message: "A password reset link has been sent to your email." });
  } catch (err) {
    console.error("authController: Forgot password error:", err.stack);
    res.status(500).json({ error: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { token, tempPassword, newPassword } = req.body;
  console.log("authController: resetPassword", { token });
  try {
    if (!token || !tempPassword || !newPassword) {
      console.log("authController: Missing fields", {
        token,
        tempPassword,
        newPassword,
      });
      return res
        .status(400)
        .json({
          error: "Token, temporary password, and new password are required",
        });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      console.log("authController: Invalid new password");
      return res.status(400).json({
        error: "password_requirements",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      console.log("authController: Invalid or expired token");
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const isTempPasswordValid = await bcrypt.compare(
      tempPassword,
      user.tempPassword
    );
    if (!isTempPasswordValid) {
      console.log("authController: Invalid temp password");
      return res.status(400).json({ error: "Invalid temporary password" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.tempPassword = null;
    user.isFirstLogin = false;
    await user.save();

    console.log("authController: Password reset", { userId: user._id });
    res.json({ message: "Password reset successfully", role: user.role });
  } catch (err) {
    console.error("authController: Reset password error:", err.stack);
    res.status(500).json({ error: "Server error" });
  }
};

const getProfile = async (req, res) => {
  console.log("authController: getProfile request received", {
    userId: req.user.id,
  });
  try {
    const user = await User.findById(req.user.id)
      .select("username email role provider firstName lastName")
      .maxTimeMS(2000); // 2s query timeout
    if (!user) {
      console.log("authController: User not found", { userId: req.user.id });
      return res.status(404).json({ error: "user_not_found" });
    }

    let firstName = user.firstName;
    let lastName = user.lastName;
    if (!firstName || !lastName) {
      const nameParts = user.username
        ? user.username.split(" ")
        : ["Unknown", ""];
      firstName = nameParts[0] || "Unknown";
      lastName = nameParts.slice(1).join(" ") || "";
    }

    console.log("authController: Profile fetched", {
      userId: user._id,
      email: user.email,
      username: user.username,
    });
    res.json({
      username: user.username,
      email: user.email,
      role: user.role,
      provider: user.provider ? user.provider.toString() : null,
      firstName,
      lastName,
    });
  } catch (err) {
    console.error("authController: Profile fetch error:", err.stack);
    res.status(500).json({ error: "server_error", details: err.message });
  }
};

const updateProfile = async (req, res) => {
  const { firstName, lastName } = req.body;
  console.log("authController: updateProfile", {
    userId: req.user.id,
    firstName,
    lastName,
  });
  try {
    if (!firstName || !lastName) {
      console.log("authController: Missing fields", { firstName, lastName });
      return res.status(400).json({ error: "firstName_lastName_required" });
    }

    const username = `${firstName} ${lastName}`;
    const existingUser = await User.findOne({
      username,
      _id: { $ne: req.user.id },
    });
    if (existingUser) {
      console.log("authController: Username exists", { username });
      return res.status(400).json({ error: "username_already_exists" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, username },
      { new: true }
    ).select("username email role provider firstName lastName");
    if (!user) {
      console.log("authController: User not found", { userId: req.user.id });
      return res.status(404).json({ error: "user_not_found" });
    }

    console.log("authController: Profile updated", {
      userId: user._id,
      username,
    });
    res.json({
      message: "profile_updated",
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        provider: user.provider ? user.provider.toString() : null,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    console.error("authController: Update profile error:", err.stack);
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
  generateTempPassword, // Export for use in adminController
};