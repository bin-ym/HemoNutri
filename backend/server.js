// backend/server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const chalk = require("chalk");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/database");

// Route imports
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const providerRoutes = require("./routes/providerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const contactRoutes = require("./routes/contactRoutes");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Validate required env variables
const requiredEnvVars = ["MONGO_URI", "PORT", "JWT_SECRET", "EMAIL_USER", "EMAIL_PASS"];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(chalk.red(`❌ Missing env variable: ${key}`));
    process.exit(1);
  }
});

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.options("*", cors());

app.use(helmet());
app.use(express.json({ limit: "10mb" }));

// Request logger
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Debug middleware
app.use((req, res, next) => {
  console.log(
    chalk.cyan(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.headers.origin || "N/A"}`)
  );
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/provider", providerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", contactRoutes);

// 404 handler
app.use((req, res) => {
  console.warn(chalk.yellow(`[404] ${req.method} ${req.url}`));
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(chalk.red(`[Error] ${err.stack}`));
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

// Start server
const startServer = async () => {
  const PORT = process.env.PORT || 5000;

  try {
    await connectDB();
    const server = app.listen(PORT, "0.0.0.0", () =>
      console.log(chalk.greenBright(`🚀 Server running on http://localhost:${PORT}`))
    );

    const shutdown = async () => {
      console.log(chalk.blue("\n🛑 Gracefully shutting down..."));
      server.close(async () => {
        await mongoose.disconnect();
        console.log(chalk.green("✅ MongoDB disconnected"));
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (err) {
    console.error(chalk.red("❌ Server startup error:"), err.message);
    process.exit(1);
  }
};

startServer();