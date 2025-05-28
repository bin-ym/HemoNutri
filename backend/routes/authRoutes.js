const express = require("express");
const {
  login,
  register,
  activateAccount,
  changePassword,
  forgotPassword,
  resetPassword,
  getProfile,
  selectProvider,
  updateProfile,
  refreshToken, // Add refreshToken to imports
} = require("../controllers/authController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/activate", activateAccount);
router.post("/change-password", auth(["patient", "provider", "admin"]), changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/profile", auth(["patient", "provider", "admin"]), (req, res, next) => {
  console.log("authRoutes: Handling /profile request", { userId: req.user?.id });
  getProfile(req, res, next);
});
router.post("/profile/update", auth(["patient", "provider", "admin"]), updateProfile);
router.post("/select-provider", selectProvider);
router.get("/verify", auth(["patient", "provider", "admin"]), (req, res) => {
  res.status(200).json({ message: "Token valid", userId: req.user.id });
});
router.post("/refresh", async (req, res) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  console.log("authRoutes: Refresh token request", { token: token?.slice(0, 10) + "..." });
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const newToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    console.log("authRoutes: New token generated", { userId: user._id });
    res.json({ token: newToken });
  } catch (err) {
    console.error("authRoutes: Refresh token error", err.stack);
    return res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;