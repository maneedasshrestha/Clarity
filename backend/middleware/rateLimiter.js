const rateLimit = require("express-rate-limit");

// General rate limiting
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: true,
      message:
        message || "Too many requests from this IP, please try again later.",
      retryAfter: Math.ceil(windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Store in memory (consider Redis for production)
    store: undefined,
  });
};

// Conservative rate limiting for general API usage
const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  "Too many requests from this IP, please try again after 15 minutes.",
);

// Stricter rate limiting for resource-intensive operations
const strictLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  20, // limit each IP to 20 requests per windowMs
  "Too many intensive requests from this IP, please try again after 15 minutes.",
);

// Rate limiting for authentication endpoints
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  10, // limit each IP to 10 requests per windowMs
  "Too many authentication requests from this IP, please try again after 15 minutes.",
);

// Rate limiting for data creation endpoints
const createLimiter = createRateLimit(
  5 * 60 * 1000, // 5 minutes
  30, // limit each IP to 30 requests per windowMs
  "Too many creation requests from this IP, please try again after 5 minutes.",
);

module.exports = {
  generalLimiter,
  strictLimiter,
  authLimiter,
  createLimiter,
};
