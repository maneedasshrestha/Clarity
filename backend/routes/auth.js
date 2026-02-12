const express = require("express");
const { body } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getMe,
  updateProfile,
  checkAuthStatus,
} = require("../controllers/authController");

const router = express.Router();

// All auth routes require authentication
router.use(authMiddleware);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", getMe);

// @route   GET /api/auth/status
// @desc    Check authentication status
// @access  Private
router.get("/status", checkAuthStatus);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  [
    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ max: 100 })
      .withMessage("Name must be less than 100 characters"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Please provide a valid email"),
    body("avatar_url")
      .optional()
      .isURL()
      .withMessage("Please provide a valid avatar URL"),
  ],
  updateProfile,
);

module.exports = router;
