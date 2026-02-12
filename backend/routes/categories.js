const express = require("express");
const { body, query, param } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getUserCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
} = require("../controllers/categoryController");

const router = express.Router();

// All category routes require authentication
router.use(authMiddleware);

// @route   GET /api/categories
// @desc    Get user categories
// @access  Private
router.get(
  "/",
  [
    query("type")
      .optional()
      .isIn(["income", "expense"])
      .withMessage("Type must be either income or expense"),
  ],
  getUserCategories,
);

// @route   POST /api/categories
// @desc    Create new custom category
// @access  Private
router.post(
  "/",
  [
    body("name")
      .notEmpty()
      .withMessage("Category name is required")
      .isLength({ min: 1, max: 50 })
      .withMessage("Category name must be between 1 and 50 characters")
      .trim(),
    body("type")
      .isIn(["income", "expense"])
      .withMessage("Type must be either income or expense"),
    body("icon")
      .optional()
      .isLength({ min: 1, max: 10 })
      .withMessage("Icon must be between 1 and 10 characters"),
    body("color")
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage("Color must be a valid hex color code"),
  ],
  createCategory,
);

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private
router.put(
  "/:id",
  [
    param("id").isUUID().withMessage("Invalid category ID"),
    body("name")
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage("Category name must be between 1 and 50 characters")
      .trim(),
    body("icon")
      .optional()
      .isLength({ min: 1, max: 10 })
      .withMessage("Icon must be between 1 and 10 characters"),
    body("color")
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage("Color must be a valid hex color code"),
  ],
  updateCategory,
);

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private
router.delete(
  "/:id",
  [param("id").isUUID().withMessage("Invalid category ID")],
  deleteCategory,
);

// @route   GET /api/categories/:id/stats
// @desc    Get category usage statistics
// @access  Private
router.get(
  "/:id/stats",
  [
    param("id").isUUID().withMessage("Invalid category ID"),
    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid date"),
    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid date"),
  ],
  getCategoryStats,
);

module.exports = router;
