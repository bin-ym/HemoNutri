const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

// Route imports
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const providerRoutes = require("./routes/providerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const contactRoutes = require("./routes/contactRoutes");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Validate required environment variables
const requiredEnvVars = [
  "MONGO_URI",
  "PORT",
  "JWT_SECRET",
  "EMAIL_USER",
  "EMAIL_PASS",
];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`❌ Error: Environment variable ${varName} is not defined`);
    process.exit(1);
  }
});

const app = express();

// CORS config
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://hemonutri.onrender.com", // 👈 Add your deployed frontend domain
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());

app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url} from ${
      req.headers.origin || "N/A"
    }`
  );
  if (req.url === "/api/auth/profile") {
    console.log("🔐 Profile route hit", { headers: req.headers });
  }
  next();
});

// Mount API routes
console.log("🚀 Mounting API routes...");
app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/provider", providerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", contactRoutes);
console.log("✅ API routes mounted");

// Serve React frontend
const buildPath = path.join(__dirname, "..", "frontend", "build");
app.use(express.static(buildPath));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(buildPath, "index.html"));
});

// 404 handler for API
app.use((req, res) => {
  console.log(
    `[${new Date().toISOString()}] 404 Not Found: ${req.method} ${req.url}`
  );
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Unhandled Error:`, err.stack);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal server error" });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
    });
    console.log("📦 MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  const PORT = process.env.PORT || 5000;
  try {
    await connectDB();
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`🌍 Server running on http://localhost:${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log("🛑 Shutting down...");
      server.close(() => {
        console.log("💤 Server closed");
        mongoose.connection.close(false, () => {
          console.log("📴 MongoDB connection closed");
          process.exit(0);
        });
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (err) {
    console.error("❌ Server startup error:", err.message);
    process.exit(1);
  }
};

startServer();
