// Utility functions for common operations

// Format currency in Nepali Rupees
const formatCurrency = (amount, showSymbol = true) => {
  const formatter = new Intl.NumberFormat("en-NP", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedAmount = formatter.format(Math.abs(amount));
  return showSymbol ? `रु ${formattedAmount}` : formattedAmount;
};

// Validate date range
const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid date format");
  }

  if (start > end) {
    throw new Error("Start date must be before end date");
  }

  // Check if date range is not more than 2 years
  const maxDate = new Date(start);
  maxDate.setFullYear(maxDate.getFullYear() + 2);

  if (end > maxDate) {
    throw new Error("Date range cannot exceed 2 years");
  }

  return { start, end };
};

// Generate date range for analytics
const getDateRange = (period) => {
  const today = new Date();
  let startDate, endDate;

  switch (period) {
    case "today":
      startDate = new Date(today);
      endDate = new Date(today);
      break;
    case "yesterday":
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 1);
      endDate = new Date(startDate);
      break;
    case "last7days":
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 6);
      endDate = new Date(today);
      break;
    case "last30days":
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 29);
      endDate = new Date(today);
      break;
    case "thisMonth":
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today);
      break;
    case "lastMonth":
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
    case "thisYear":
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today);
      break;
    case "lastYear":
      startDate = new Date(today.getFullYear() - 1, 0, 1);
      endDate = new Date(today.getFullYear() - 1, 11, 31);
      break;
    default:
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 29);
      endDate = new Date(today);
  }

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
};

// Paginate results
const paginate = (data, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const paginatedData = data.slice(offset, offset + limit);

  return {
    data: paginatedData,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(data.length / limit),
      totalItems: data.length,
      itemsPerPage: parseInt(limit),
      hasNextPage: offset + limit < data.length,
      hasPreviousPage: page > 1,
    },
  };
};

// Sanitize user input
const sanitizeInput = (input, maxLength = 255) => {
  if (typeof input !== "string") return "";

  return input.trim().substring(0, maxLength).replace(/[<>]/g, ""); // Basic XSS prevention
};

// Calculate percentage change
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
};

// Group transactions by time period
const groupTransactionsByPeriod = (transactions, period = "day") => {
  const grouped = {};

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    let key;

    switch (period) {
      case "day":
        key = date.toISOString().split("T")[0];
        break;
      case "week":
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        key = startOfWeek.toISOString().split("T")[0];
        break;
      case "month":
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
      case "year":
        key = date.getFullYear().toString();
        break;
      default:
        key = date.toISOString().split("T")[0];
    }

    if (!grouped[key]) {
      grouped[key] = {
        date: key,
        income: 0,
        expenses: 0,
        transactions: [],
      };
    }

    grouped[key].transactions.push(transaction);
    if (transaction.type === "income") {
      grouped[key].income += Math.abs(transaction.amount);
    } else {
      grouped[key].expenses += Math.abs(transaction.amount);
    }
  });

  return Object.values(grouped).sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );
};

// Generate API response format
const apiResponse = (success, data = null, message = "", errors = null) => {
  const response = {
    success,
    ...(data !== null && { data }),
    ...(message && { message }),
    ...(errors && { errors }),
    timestamp: new Date().toISOString(),
  };

  return response;
};

// Validate UUID
const isValidUUID = (uuid) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Create error with status code
const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.status = statusCode;
  return error;
};

// Generate random color for categories
const generateRandomColor = () => {
  const colors = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

module.exports = {
  formatCurrency,
  validateDateRange,
  getDateRange,
  paginate,
  sanitizeInput,
  calculatePercentageChange,
  groupTransactionsByPeriod,
  apiResponse,
  isValidUUID,
  createError,
  generateRandomColor,
};
