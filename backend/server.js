const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const config = require("./config/config");

const app = express();

// CORS configuration - handles both development and production
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  process.env.FRONTEND_URL, // Production frontend URL from env
  "https://franchiseehub.netlify.app", // Fallback production URL
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Allow any Netlify subdomain
      if (origin && origin.includes(".netlify.app")) {
        return callback(null, true);
      }

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`⚠️  CORS blocked request from origin: ${origin}`);
        // In production, allow the request anyway but log it
        if (process.env.NODE_ENV === "production") {
          console.log("⚠️  Allowing request in production mode");
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["set-cookie"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// MongoDB connection
mongoose
  .connect(config.mongodb.uri)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
const adminRoutes = require("./routes/admin");
const applicantRoutes = require("./routes/applicant");
const franchiseeRoutes = require("./routes/franchisee");

app.use("/admin", adminRoutes);
app.use("/applicant", applicantRoutes);
app.use("/franchisee", franchiseeRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "FranchiseeHub API is running",
    version: "2.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      status: err.status || 500,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: "Route not found",
      status: 404,
      path: req.originalUrl,
    },
  });
});

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 Allowed origins:`, allowedOrigins);
});

module.exports = app;
