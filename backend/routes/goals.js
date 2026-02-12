const express = require("express");
const { body, query, param } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getUserGoals,
  createNewGoal,
  updateGoal,
  deleteGoal,
  addMoneyToGoalHandler,
  getGoalHistory,
  getGoalsSummary,
} = require("../controllers/goalController");

const router = express.Router();

// All goal routes require authentication
router.use(authMiddleware);

// @route   GET /api/goals
// @desc    Get user goals
// @access  Private
router.get(
  "/",
  [
    query("status")
      .optional()
      .isIn(["completed", "active"])
      .withMessage("Status must be either completed or active"),
  ],
  getUserGoals,
);

// @route   GET /api/goals/summary
// @desc    Get goals summary
// @access  Private
router.get("/summary", getGoalsSummary);

// @route   POST /api/goals
// @desc    Create new goal
// @access  Private
router.post(
  "/",
  [
    body("title")
      .notEmpty()
      .withMessage("Goal title is required")
      .isLength({ min: 1, max: 100 })
      .withMessage("Goal title must be between 1 and 100 characters")
      .trim(),
    body("target_amount")
      .isFloat({ min: 1 })
      .withMessage("Target amount must be at least 1"),
    body("target_date")
      .optional()
      .isISO8601()
      .withMessage("Target date must be a valid date"),
    body("color")
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage("Color must be a valid hex color code"),
    body("current_amount")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Current amount must be non-negative"),
  ],
  createNewGoal,
);

// @route   PUT /api/goals/:id
// @desc    Update goal
// @access  Private
router.put(
  "/:id",
  [
    param("id").isUUID().withMessage("Invalid goal ID"),
    body("title")
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage("Goal title must be between 1 and 100 characters")
      .trim(),
    body("target_amount")
      .optional()
      .isFloat({ min: 1 })
      .withMessage("Target amount must be at least 1"),
    body("target_date")
      .optional()
      .isISO8601()
      .withMessage("Target date must be a valid date"),
    body("color")
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage("Color must be a valid hex color code"),
  ],
  updateGoal,
);

// @route   DELETE /api/goals/:id
// @desc    Delete goal
// @access  Private
router.delete(
  "/:id",
  [param("id").isUUID().withMessage("Invalid goal ID")],
  deleteGoal,
);

// @route   POST /api/goals/:id/add-money
// @desc    Add money to goal
// @access  Private
router.post(
  "/:id/add-money",
  [
    param("id").isUUID().withMessage("Invalid goal ID"),
    body("amount")
      .isFloat({ min: 0.01 })
      .withMessage("Amount must be greater than 0"),
    body("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Description must be less than 500 characters"),
  ],
  addMoneyToGoalHandler,
);

// @route   GET /api/goals/:id/history
// @desc    Get goal progress history
// @access  Private
router.get(
  "/:id/history",
  [param("id").isUUID().withMessage("Invalid goal ID")],
  getGoalHistory,
);

module.exports = router;
