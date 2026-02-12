const express = require("express");
const { body, query, param } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getUserTransactions,
  createNewTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
} = require("../controllers/transactionController");

const router = express.Router();

// All transaction routes require authentication
router.use(authMiddleware);

// @route   GET /api/transactions
// @desc    Get user transactions with filters
// @access  Private
router.get(
  "/",
  [
    query("type")
      .optional()
      .isIn(["income", "expense"])
      .withMessage("Type must be either income or expense"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid date"),
    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid date"),
  ],
  getUserTransactions,
);

// @route   GET /api/transactions/summary
// @desc    Get transaction summary
// @access  Private
router.get("/summary", getTransactionSummary);

// @route   POST /api/transactions
// @desc    Create new transaction
// @access  Private
router.post(
  "/",
  [
    body("amount")
      .isFloat({ min: 0.01 })
      .withMessage("Amount must be a positive number"),
    body("type")
      .isIn(["income", "expense"])
      .withMessage("Type must be either income or expense"),
    body("category_name")
      .notEmpty()
      .withMessage("Category is required")
      .isLength({ max: 50 })
      .withMessage("Category name must be less than 50 characters"),
    body("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Description must be less than 500 characters"),
    body("date")
      .optional()
      .isISO8601()
      .withMessage("Date must be a valid date"),
    body("is_recurring")
      .optional()
      .isBoolean()
      .withMessage("is_recurring must be a boolean"),
    body("recurring_frequency")
      .optional()
      .isIn(["weekly", "monthly", "yearly"])
      .withMessage("Recurring frequency must be weekly, monthly, or yearly"),
    body("recurring_end_date")
      .optional()
      .isISO8601()
      .withMessage("Recurring end date must be a valid date"),
  ],
  createNewTransaction,
);

// @route   PUT /api/transactions/:id
// @desc    Update transaction
// @access  Private
router.put(
  "/:id",
  [
    param("id").isUUID().withMessage("Invalid transaction ID"),
    body("amount")
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage("Amount must be a positive number"),
    body("type")
      .optional()
      .isIn(["income", "expense"])
      .withMessage("Type must be either income or expense"),
    body("category_name")
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage("Category name must be between 1 and 50 characters"),
    body("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Description must be less than 500 characters"),
    body("date")
      .optional()
      .isISO8601()
      .withMessage("Date must be a valid date"),
  ],
  updateTransaction,
);

// @route   DELETE /api/transactions/:id
// @desc    Delete transaction
// @access  Private
router.delete(
  "/:id",
  [param("id").isUUID().withMessage("Invalid transaction ID")],
  deleteTransaction,
);

module.exports = router;
