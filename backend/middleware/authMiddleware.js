const { verifyUser } = require('../services/supabaseService');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Authorization header missing',
        message: 'Please provide a valid authentication token'
      });
    }

    const token = authHeader.split(' ')[1]; 
    
    if (!token) {
      return res.status(401).json({
        error: 'Token missing',
        message: 'Please provide a valid authentication token'
      });
    }

    // Verify the token with Supabase
    const user = await verifyUser(token);
    
    if (!user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid or expired'
      });
    }

    // Attach user to request object
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid or expired token'
    });
  }
};

module.exports = authMiddleware;