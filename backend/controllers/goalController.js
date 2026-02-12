const {
  getGoals,
  createGoal,
  addMoneyToGoal,
  supabase,
  getAuthenticatedClient,
} = require("../services/supabaseService");
const { validationResult } = require("express-validator");

// @desc    Get user goals
// @route   GET /api/goals
// @access  Private
const getUserGoals = async (req, res, next) => {
  try {
    const { status } = req.query; // 'completed', 'active', or undefined for all

    const token = req.headers.authorization?.split(" ")[1];
    let goals = await getGoals(req.userId, token);

    // Filter by status if specified
    if (status === "completed") {
      goals = goals.filter((goal) => goal.is_completed);
    } else if (status === "active") {
      goals = goals.filter((goal) => !goal.is_completed);
    }

    // Sort by completion percentage (highest first for motivation)
    goals.sort((a, b) => {
      const aProgress = a.current_amount / a.target_amount;
      const bProgress = b.current_amount / b.target_amount;
      return bProgress - aProgress;
    });

    res.json({
      success: true,
      data: goals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new goal
// @route   POST /api/goals
// @access  Private
const createNewGoal = async (req, res, next) => {
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

    const {
      title,
      target_amount,
      target_date,
      color = "#3B82F6",
      current_amount = 0,
    } = req.body;

    const goalData = {
      title: title.trim(),
      target_amount: parseFloat(target_amount),
      current_amount: parseFloat(current_amount) || 0,
      target_date,
      color,
    };

    const token = req.headers.authorization?.split(" ")[1];
    const goal = await createGoal(req.userId, goalData, token);

    res.status(201).json({
      success: true,
      data: goal,
      message: "Goal created successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, target_amount, target_date, color } = req.body;

    // Verify goal belongs to user
    const token = req.headers.authorization?.split(" ")[1];
    const authClient = token ? getAuthenticatedClient(token) : supabase;
    const { data: existingGoal, error: fetchError } = await authClient
      .from("goals")
      .select("*")
      .eq("id", id)
      .eq("user_id", req.userId)
      .single();

    if (fetchError || !existingGoal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    const updateData = {
      ...(title && { title: title.trim() }),
      ...(target_amount && { target_amount: parseFloat(target_amount) }),
      ...(target_date && { target_date }),
      ...(color && { color }),
      updated_at: new Date().toISOString(),
    };

    // Check if goal should be marked as completed
    if (
      target_amount &&
      existingGoal.current_amount >= parseFloat(target_amount)
    ) {
      updateData.is_completed = true;
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await authClient
      .from("goals")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", req.userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data,
      message: "Goal updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res, next) => {
  try {
    const { id } = req.params;

    // This will also delete all related goal_transactions due to CASCADE
    const token = req.headers.authorization?.split(" ")[1];
    const authClient = token ? getAuthenticatedClient(token) : supabase;
    const { error } = await authClient
      .from("goals")
      .delete()
      .eq("id", id)
      .eq("user_id", req.userId);

    if (error) throw error;

    res.json({
      success: true,
      message: "Goal deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add money to goal
// @route   POST /api/goals/:id/add-money
// @access  Private
const addMoneyToGoalHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    // Verify goal exists and belongs to user
    const token = req.headers.authorization?.split(" ")[1];
    const authClient = token ? getAuthenticatedClient(token) : supabase;
    const { data: goal, error: goalError } = await authClient
      .from("goals")
      .select("*")
      .eq("id", id)
      .eq("user_id", req.userId)
      .single();

    if (goalError || !goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    if (goal.is_completed) {
      return res.status(400).json({
        success: false,
        message: "Cannot add money to completed goal",
      });
    }

    const goalTransaction = await addMoneyToGoal(
      req.userId,
      id,
      parseFloat(amount),
      description?.trim() || null,
      token,
    );

    // Get updated goal data
    const { data: updatedGoal } = await authClient
      .from("goals")
      .select("*")
      .eq("id", id)
      .single();

    res.status(201).json({
      success: true,
      data: {
        transaction: goalTransaction,
        goal: updatedGoal,
        justCompleted: updatedGoal.is_completed && !goal.is_completed,
      },
      message: updatedGoal.is_completed
        ? "Congratulations! Goal completed!"
        : "Money added to goal successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get goal progress history
// @route   GET /api/goals/:id/history
// @access  Private
const getGoalHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify goal belongs to user
    const token = req.headers.authorization?.split(" ")[1];
    const authClient = token ? getAuthenticatedClient(token) : supabase;
    const { data: goal, error: goalError } = await authClient
      .from("goals")
      .select("id")
      .eq("id", id)
      .eq("user_id", req.userId)
      .single();

    if (goalError || !goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    const { data, error } = await authClient
      .from("goal_transactions")
      .select("*")
      .eq("goal_id", id)
      .eq("user_id", req.userId)
      .order("date", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get goals summary
// @route   GET /api/goals/summary
// @access  Private
const getGoalsSummary = async (req, res, next) => {
  try {
    const goals = await getGoals(req.userId);

    const summary = {
      totalGoals: goals.length,
      completedGoals: goals.filter((g) => g.is_completed).length,
      activeGoals: goals.filter((g) => !g.is_completed).length,
      totalTargetAmount: goals.reduce(
        (sum, g) => sum + parseFloat(g.target_amount),
        0,
      ),
      totalCurrentAmount: goals.reduce(
        (sum, g) => sum + parseFloat(g.current_amount),
        0,
      ),
      totalRemaining: goals
        .filter((g) => !g.is_completed)
        .reduce(
          (sum, g) =>
            sum + (parseFloat(g.target_amount) - parseFloat(g.current_amount)),
          0,
        ),
      averageProgress:
        goals.length > 0
          ? (goals.reduce(
              (sum, g) =>
                sum +
                parseFloat(g.current_amount) / parseFloat(g.target_amount),
              0,
            ) /
              goals.length) *
            100
          : 0,
    };

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserGoals,
  createNewGoal,
  updateGoal,
  deleteGoal,
  addMoneyToGoalHandler,
  getGoalHistory,
  getGoalsSummary,
};
