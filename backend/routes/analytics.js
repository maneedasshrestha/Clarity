const express = require("express");
const { query } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getDashboardOverview,
  getSpendingTrends,
  getCategoryBreakdown,
  getMonthlySummary,
  getFinancialInsights,
} = require("../controllers/analyticsController");

const router = express.Router();

// All analytics routes require authentication
router.use(authMiddleware);

// @route   GET /api/analytics/overview
// @desc    Get dashboard overview data
// @access  Private
router.get(
  "/overview",
  [
    query("month")
      .optional()
      .isInt({ min: 1, max: 12 })
      .withMessage("Month must be between 1 and 12"),
    query("year")
      .optional()
      .isInt({ min: 2020, max: 2100 })
      .withMessage("Year must be between 2020 and 2100"),
  ],
  getDashboardOverview,
);

// @route   GET /api/analytics/spending-trends
// @desc    Get spending trends
// @access  Private
router.get(
  "/spending-trends",
  [
    query("period")
      .optional()
      .isIn(["month", "year", "last30days"])
      .withMessage("Period must be month, year, or last30days"),
    query("year")
      .optional()
      .isInt({ min: 2020, max: 2100 })
      .withMessage("Year must be between 2020 and 2100"),
    query("month")
      .optional()
      .isInt({ min: 1, max: 12 })
      .withMessage("Month must be between 1 and 12"),
  ],
  getSpendingTrends,
);

// @route   GET /api/analytics/category-breakdown
// @desc    Get category breakdown
// @access  Private
router.get(
  "/category-breakdown",
  [
    query("type")
      .optional()
      .isIn(["income", "expense"])
      .withMessage("Type must be either income or expense"),
    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid date"),
    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid date"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
  ],
  getCategoryBreakdown,
);

// @route   GET /api/analytics/monthly-summary
// @desc    Get monthly summary
// @access  Private
router.get(
  "/monthly-summary",
  [
    query("months")
      .optional()
      .isInt({ min: 1, max: 24 })
      .withMessage("Months must be between 1 and 24"),
  ],
  getMonthlySummary,
);

// @route   GET /api/analytics/insights
// @desc    Get financial insights
// @access  Private
router.get("/insights", getFinancialInsights);

module.exports = router;
