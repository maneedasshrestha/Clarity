const { getUserOverview, supabase, getAuthenticatedClient } = require("../services/supabaseService");

const getDashboardOverview = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    const date = new Date();
    const targetMonth = month ? parseInt(month) : date.getMonth() + 1;
    const targetYear = year ? parseInt(year) : date.getFullYear();

    // Create date string directly to avoid timezone issues
    const monthDateString = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
    
    // Calculate previous month for trend comparison
    const previousMonth = targetMonth === 1 ? 12 : targetMonth - 1;
    const previousYear = targetMonth === 1 ? targetYear - 1 : targetYear;
    const previousMonthDateString = `${previousYear}-${String(previousMonth).padStart(2, '0')}-01`;

    const token = req.headers.authorization?.split(" ")[1];
    
    // Fetch current month overview
    const overview = await getUserOverview(req.userId, monthDateString, token);
    
    // Fetch previous month overview for trend comparison
    const previousOverview = await getUserOverview(req.userId, previousMonthDateString, token);

    // Combine the data
    const responseData = {
      ...overview,
      previous_totals: previousOverview.totals || {
        income: 0,
        expenses: 0,
        net_amount: 0
      }
    };

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
};

const getSpendingTrends = async (req, res, next) => {
  try {
    const { period = "month", year, month } = req.query;

    let startDate, endDate, groupByFormat;
    const currentDate = new Date();

    if (period === "month") {
      const targetYear = year ? parseInt(year) : currentDate.getFullYear();
      const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
      
      // Use string format to avoid timezone issues
      startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
      
      // Calculate end date - last day of the month
      const nextMonth = targetMonth === 12 ? 1 : targetMonth + 1;
      const nextYear = targetMonth === 12 ? targetYear + 1 : targetYear;
      const lastDay = new Date(nextYear, nextMonth - 1, 0).getDate();
      endDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      
      groupByFormat = "DD";
    } else if (period === "year") {
      const targetYear = year ? parseInt(year) : currentDate.getFullYear();
      startDate = `${targetYear}-01-01`;
      endDate = `${targetYear}-12-31`;
      groupByFormat = "MM";
    } else {
      // Last 30 days
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      
      startDate = start.toISOString().split("T")[0];
      endDate = end.toISOString().split("T")[0];
      groupByFormat = "DD";
    }

    const token = req.headers.authorization?.split(" ")[1];
    const authClient = token ? getAuthenticatedClient(token) : supabase;
    const { data, error } = await authClient
      .from("transactions")
      .select("amount, date, type")
      .eq("user_id", req.userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date");

    if (error) throw error;

    // Group data by the specified period
    const groupedData = {};
    data.forEach((transaction) => {
      const date = new Date(transaction.date);
      let key;

      if (period === "month") {
        key = date.getDate();
      } else if (period === "year") {
        key = date.getMonth() + 1;
      } else {
        key = date.getDate();
      }

      if (!groupedData[key]) {
        groupedData[key] = { income: 0, expense: 0 };
      }

      if (transaction.type === "income") {
        groupedData[key].income += Math.abs(transaction.amount);
      } else {
        groupedData[key].expense += Math.abs(transaction.amount);
      }
    });

    // Fill in missing periods with zero values (only up to current date for current month)
    const result = [];
    let maxPeriods;
    const today = new Date();
    
    if (period === "year") {
      maxPeriods = 12;
    } else if (period === "month") {
      const targetYear = year ? parseInt(year) : today.getFullYear();
      const targetMonth = month ? parseInt(month) : today.getMonth() + 1;
      const isCurrentMonth = targetYear === today.getFullYear() && targetMonth === (today.getMonth() + 1);
      
      if (isCurrentMonth) {
        // For current month, only show data up to today
        maxPeriods = today.getDate();
      } else {
        // For past/future months, show all days
        maxPeriods = endDate.getDate();
      }
    } else {
      maxPeriods = 30;
    }

    for (let i = 1; i <= maxPeriods; i++) {
      result.push({
        period: i,
        day: i, // Add day property for compatibility
        income: groupedData[i]?.income || 0,
        expense: groupedData[i]?.expense || 0,
        net: (groupedData[i]?.income || 0) - (groupedData[i]?.expense || 0),
        spending: groupedData[i]?.expense || 0, // For compatibility with existing charts
      });
    }

    res.json({
      success: true,
      data: result,
      meta: {
        period,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      },
    });
  } catch (error) {
    next(error);
  }
};


const getCategoryBreakdown = async (req, res, next) => {
  try {
    const { type = "expense", startDate, endDate, limit = 10 } = req.query;

    const start =
      startDate ||
      (() => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1)
          .toISOString()
          .split("T")[0];
      })();

    const end = endDate || new Date().toISOString().split("T")[0];

    const token = req.headers.authorization?.split(" ")[1];
    const authClient = token ? getAuthenticatedClient(token) : supabase;
    const { data, error } = await authClient
      .from("transactions")
      .select(
        `
        amount,
        category_name,
        categories!left (
          icon,
          color
        )
      `,
      )
      .eq("user_id", req.userId)
      .eq("type", type)
      .gte("date", start)
      .lte("date", end);

    if (error) throw error;

    // Group by category and sum amounts
    const categoryData = {};
    data.forEach((transaction) => {
      const category = transaction.category_name;
      if (!categoryData[category]) {
        categoryData[category] = {
          name: category,
          value: 0,
          icon: transaction.categories?.icon || "📊",
          color: transaction.categories?.color || "#6b7280",
        };
      }
      categoryData[category].value += Math.abs(transaction.amount);
    });

    // Convert to array and sort by amount
    const result = Object.values(categoryData)
      .sort((a, b) => b.value - a.value)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: result,
      meta: {
        type,
        period: { startDate: start, endDate: end },
        totalCategories: Object.keys(categoryData).length,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMonthlySummary = async (req, res, next) => {
  try {
    const { months = 6 } = req.query;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const token = req.headers.authorization?.split(" ")[1];
    const authClient = token ? getAuthenticatedClient(token) : supabase;
    const { data, error } = await authClient
      .from("transactions")
      .select("amount, type, date")
      .eq("user_id", req.userId)
      .gte("date", startDate.toISOString().split("T")[0])
      .lte("date", endDate.toISOString().split("T")[0])
      .order("date");

    if (error) throw error;

    // Group by month
    const monthlyData = {};
    data.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          income: 0,
          expenses: 0,
          transactions: 0,
        };
      }

      monthlyData[monthKey].transactions += 1;
      if (transaction.type === "income") {
        monthlyData[monthKey].income += Math.abs(transaction.amount);
      } else {
        monthlyData[monthKey].expenses += Math.abs(transaction.amount);
      }
    });

    // Convert to array and add calculated fields
    const result = Object.values(monthlyData).map((month) => ({
      ...month,
      net: month.income - month.expenses,
      savingsRate:
        month.income > 0
          ? ((month.income - month.expenses) / month.income) * 100
          : 0,
    }));

    res.json({
      success: true,
      data: result,
      meta: {
        monthsRequested: parseInt(months),
        monthsReturned: result.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getFinancialInsights = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const currentMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const lastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    );
    const lastMonthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0,
    );

    // Get current month data
    const token = req.headers.authorization?.split(" ")[1];
    const authClient = token ? getAuthenticatedClient(token) : supabase;
    const { data: currentMonthData, error: currentError } = await authClient
      .from("transactions")
      .select("amount, type, category_name")
      .eq("user_id", req.userId)
      .gte("date", currentMonth.toISOString().split("T")[0])
      .lte("date", currentDate.toISOString().split("T")[0]);

    if (currentError) throw currentError;

    // Get last month data
    const { data: lastMonthData, error: lastError } = await authClient
      .from("transactions")
      .select("amount, type, category_name")
      .eq("user_id", req.userId)
      .gte("date", lastMonth.toISOString().split("T")[0])
      .lte("date", lastMonthEnd.toISOString().split("T")[0]);

    if (lastError) throw lastError;

    // Calculate insights
    const currentIncome = currentMonthData
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const currentExpenses = currentMonthData
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const lastIncome = lastMonthData
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const lastExpenses = lastMonthData
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const insights = {
      spending: {
        currentMonth: currentExpenses,
        lastMonth: lastExpenses,
        change:
          lastExpenses > 0
            ? ((currentExpenses - lastExpenses) / lastExpenses) * 100
            : 0,
        trend:
          currentExpenses > lastExpenses
            ? "up"
            : currentExpenses < lastExpenses
              ? "down"
              : "same",
      },
      income: {
        currentMonth: currentIncome,
        lastMonth: lastIncome,
        change:
          lastIncome > 0
            ? ((currentIncome - lastIncome) / lastIncome) * 100
            : 0,
        trend:
          currentIncome > lastIncome
            ? "up"
            : currentIncome < lastIncome
              ? "down"
              : "same",
      },
      topSpendingCategory: (() => {
        const categorySpending = {};
        currentMonthData
          .filter((t) => t.type === "expense")
          .forEach((t) => {
            categorySpending[t.category_name] =
              (categorySpending[t.category_name] || 0) + Math.abs(t.amount);
          });
        const top = Object.entries(categorySpending).sort(
          (a, b) => b[1] - a[1],
        )[0];
        return top ? { category: top[0], amount: top[1] } : null;
      })(),
      savingsRate:
        currentIncome > 0
          ? ((currentIncome - currentExpenses) / currentIncome) * 100
          : 0,
    };

    res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardOverview,
  getSpendingTrends,
  getCategoryBreakdown,
  getMonthlySummary,
  getFinancialInsights,
};
