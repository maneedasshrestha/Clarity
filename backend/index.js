require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Import middleware
const { errorHandler, notFound } = require("./middleware/errorHandler");
const { generalLimiter } = require("./middleware/rateLimiter");

// Import routes
const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");
const categoryRoutes = require("./routes/categories");
const goalRoutes = require("./routes/goals");
const analyticsRoutes = require("./routes/analytics");

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Rate limiting
app.use("/api", generalLimiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Clarity API is running",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: "1.0.0",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/analytics", analyticsRoutes);

// Welcome endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Clarity Expense Tracker API",
    version: "1.0.0",
    documentation: "/api/docs",
    endpoints: {
      auth: "/api/auth",
      transactions: "/api/transactions",
      categories: "/api/categories",
      goals: "/api/goals",
      analytics: "/api/analytics",
    },
  });
});

// API documentation endpoint
app.get("/api/docs", (req, res) => {
  res.json({
    success: true,
    message: "API Documentation",
    baseUrl: `${req.protocol}://${req.get("host")}/api`,
    endpoints: {
      authentication: {
        "GET /auth/me": "Get current user profile",
        "PUT /auth/profile": "Update user profile",
        "GET /auth/status": "Check authentication status",
      },
      transactions: {
        "GET /transactions": "Get user transactions with filters",
        "POST /transactions": "Create new transaction",
        "PUT /transactions/:id": "Update transaction",
        "DELETE /transactions/:id": "Delete transaction",
        "GET /transactions/summary": "Get transaction summary",
      },
      categories: {
        "GET /categories": "Get user categories",
        "POST /categories": "Create custom category",
        "PUT /categories/:id": "Update category",
        "DELETE /categories/:id": "Delete category",
        "GET /categories/:id/stats": "Get category statistics",
      },
      goals: {
        "GET /goals": "Get user goals",
        "POST /goals": "Create new goal",
        "PUT /goals/:id": "Update goal",
        "DELETE /goals/:id": "Delete goal",
        "POST /goals/:id/add-money": "Add money to goal",
        "GET /goals/:id/history": "Get goal progress history",
        "GET /goals/summary": "Get goals summary",
      },
      analytics: {
        "GET /analytics/overview": "Get dashboard overview data",
        "GET /analytics/spending-trends": "Get spending trends",
        "GET /analytics/category-breakdown": "Get category breakdown",
        "GET /analytics/monthly-summary": "Get monthly summary",
        "GET /analytics/insights": "Get financial insights",
      },
    },
  });
});

// Handle undefined routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated");
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated");
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`
  Clarity API Server is running!

  Environment: ${NODE_ENV}
  Port: ${PORT}
  URL: http://localhost:${PORT}
  Documentation: http://localhost:${PORT}/api/docs
  Health Check: http://localhost:${PORT}/health
`);

  if (NODE_ENV === "development") {
    console.log(`
  Available Endpoints:
   • GET  /api/auth/me
   • GET  /api/transactions  
   • POST /api/transactions
   • GET  /api/categories
   • POST /api/categories
   • GET  /api/goals
   • POST /api/goals  
   • GET  /api/analytics/overview
   • GET  /api/analytics/spending-trends
   • GET  /api/analytics/category-breakdown
    `);
  }
});

module.exports = app;
