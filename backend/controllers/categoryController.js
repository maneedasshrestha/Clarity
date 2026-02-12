const { getCategories, supabase, getAuthenticatedClient } = require("../services/supabaseService");
const { validationResult } = require("express-validator");

// @desc    Get user categories
// @route   GET /api/categories
// @access  Private
const getUserCategories = async (req, res, next) => {
  try {
    const { type } = req.query; // 'income' or 'expense'

    const token = req.headers.authorization?.split(" ")[1];
    const categories = await getCategories(req.userId, type, token);

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new custom category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }

    const { name, type, icon = "📊", color = "#3B82F6" } = req.body;

    // Check if category already exists for this user
    const token = req.headers.authorization?.split(" ")[1];
    const authClient = token ? getAuthenticatedClient(token) : supabase;
    const { data: existingCategories } = await authClient
      .from("categories")
      .select("*")
      .eq("user_id", req.userId)
      .eq("name", name.trim())
      .eq("type", type);

    if (existingCategories && existingCategories.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    const { data, error } = await authClient
      .from("categories")
      .insert({
        user_id: req.userId,
        name: name.trim(),
        type,
        icon,
        color,
        is_default: false,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
      message: "Category created successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, icon, color } = req.body;

    // Verify category belongs to user and is not default
    const token = req.headers.authorization?.split(" ")[1];
    const authClient = token ? getAuthenticatedClient(token) : supabase;
    const { data: existingCategory, error: fetchError } = await authClient
      .from("categories")
      .select("*")
      .eq("id", id)
      .eq("user_id", req.userId)
      .eq("is_default", false)
      .single();

    if (fetchError || !existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found or cannot be modified",
      });
    }

    const { data, error } = await authClient
      .from("categories")
      .update({
        ...(name && { name: name.trim() }),
        ...(icon && { icon }),
        ...(color && { color }),
      })
      .eq("id", id)
      .eq("user_id", req.userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data,
      message: "Category updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if category is being used in transactions
    const token = req.headers.authorization?.split(" ")[1];
    const authClient = token ? getAuthenticatedClient(token) : supabase;
    const { data: transactions } = await authClient
      .from("transactions")
      .select("id")
      .eq("category_id", id)
      .eq("user_id", req.userId)
      .limit(1);

    if (transactions && transactions.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category that is being used in transactions",
      });
    }

    const { error } = await authClient
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("user_id", req.userId)
      .eq("is_default", false);

    if (error) throw error;

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category usage statistics
// @route   GET /api/categories/:id/stats
// @access  Private
const getCategoryStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const start = startDate || "2020-01-01";
    const end = endDate || new Date().toISOString().split("T")[0];

    const token = req.headers.authorization?.split(" ")[1];
    const authClient = token ? getAuthenticatedClient(token) : supabase;
    const { data, error } = await authClient
      .from("transactions")
      .select("amount, date")
      .eq("category_id", id)
      .eq("user_id", req.userId)
      .gte("date", start)
      .lte("date", end);

    if (error) throw error;

    const stats = {
      totalAmount: data.reduce((sum, t) => sum + Math.abs(t.amount), 0),
      transactionCount: data.length,
      averageAmount:
        data.length > 0
          ? data.reduce((sum, t) => sum + Math.abs(t.amount), 0) / data.length
          : 0,
      period: { startDate: start, endDate: end },
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
};
