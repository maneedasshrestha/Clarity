const {
  getUserProfile,
  updateUserProfile,
  createUserProfile,
} = require("../services/supabaseService");

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];
    const profile = await getUserProfile(req.userId, token);

    res.json({
      success: true,
      data: {
        user: req.user,
        profile: profile,
      },
    });
  } catch (error) {
    // If profile doesn't exist, create it
    if (error.message.includes("Failed to fetch user profile")) {
      try {
        const newProfile = await createUserProfile(req.userId, {
          name: req.user.user_metadata?.name || req.user.email?.split("@")[0],
          email: req.user.email,
        });

        res.json({
          success: true,
          data: {
            user: req.user,
            profile: newProfile,
          },
        });
      } catch (createError) {
        next(createError);
      }
    } else {
      next(error);
    }
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, avatar_url } = req.body;

    // Basic validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const token = req.headers.authorization?.split(" ")[1];
    const updatedProfile = await updateUserProfile(
      req.userId,
      {
        name: name.trim(),
        ...(email && { email }),
        ...(avatar_url && { avatar_url }),
      },
      token,
    );

    res.json({
      success: true,
      data: updatedProfile,
      message: "Profile updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check authentication status
// @route   GET /api/auth/status
// @access  Private
const checkAuthStatus = async (req, res) => {
  res.json({
    success: true,
    authenticated: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.user_metadata?.name,
    },
  });
};

module.exports = {
  getMe,
  updateProfile,
  checkAuthStatus,
};
