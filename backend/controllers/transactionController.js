const {
  getTransactions,
  createTransaction,
  supabase,
} = require("../services/supabaseService");
const { validationResult } = require("express-validator");

// @desc    Get user transactions with filters
// @route   GET /api/transactions
// @access  Private
const getUserTransactions = async (req, res, next) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20,
      sortBy = "date",
      sortOrder = "desc",
    } = req.query;

    const offset = (page - 1) * limit;

    const filters = {
      ...(type && { type }),
      ...(category && { category }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(search && { search }),
      limit: parseInt(limit),
      offset: parseInt(offset),
    };

    const token = req.headers.authorization?.split(" ")[1];
    const transactions = await getTransactions(req.userId, filters, token);

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", req.userId);

    if (countError) throw countError;

    res.json({
      success: true,
      data: transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
const createNewTransaction = async (req, res, next) => {
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
      amount,
      type,
      category_name,
      description,
      date,
      is_recurring,
      recurring_frequency,
      recurring_end_date,
    } = req.body;

    // Ensure amount is negative for expenses
    const transactionAmount =
      type === "expense" ? -Math.abs(amount) : Math.abs(amount);

    const transactionData = {
      amount: transactionAmount,
      type,
      category_name,
      description: description?.trim() || null,
      date: date || new Date().toISOString().split("T")[0],
      is_recurring: is_recurring || false,
      ...(is_recurring && recurring_frequency && { recurring_frequency }),
      ...(is_recurring && recurring_end_date && { recurring_end_date }),
    };

    const token = req.headers.authorization?.split(" ")[1];
    const transaction = await createTransaction(
      req.userId,
      transactionData,
      token,
    );

    res.status(201).json({
      success: true,
      data: transaction,
      message: "Transaction created successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, type, category_name, description, date } = req.body;

    // Verify transaction belongs to user
    const { data: existingTransaction, error: fetchError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .eq("user_id", req.userId)
      .single();

    if (fetchError || !existingTransaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    const transactionAmount =
      type === "expense" ? -Math.abs(amount) : Math.abs(amount);

    const { data, error } = await supabase
      .from("transactions")
      .update({
        amount: transactionAmount,
        type,
        category_name,
        description: description?.trim() || null,
        date,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", req.userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data,
      message: "Transaction updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", req.userId);

    if (error) throw error;

    res.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction summary
// @route   GET /api/transactions/summary
// @access  Private
const getTransactionSummary = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = "month" } = req.query;

    const start = startDate || "2020-01-01";
    const end = endDate || new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("transactions")
      .select("amount, type, date, category_name")
      .eq("user_id", req.userId)
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: false });

    if (error) throw error;

    // Calculate summary
    const summary = data.reduce(
      (acc, transaction) => {
        if (transaction.type === "income") {
          acc.totalIncome += Math.abs(transaction.amount);
        } else {
          acc.totalExpenses += Math.abs(transaction.amount);
        }
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0 },
    );

    summary.netAmount = summary.totalIncome - summary.totalExpenses;

    res.json({
      success: true,
      data: {
        summary,
        period: { startDate: start, endDate: end },
        transactionCount: data.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserTransactions,
  createNewTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
};
