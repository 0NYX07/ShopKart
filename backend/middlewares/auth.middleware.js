const jwt = require('jsonwebtoken');
const Customer = require('../models/customer.model');

const protect = async (req, res, next) => {
  let token;

  // 1. Check cookies first (used by frontend browser requests)
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // 2. Also support standard Bearer token in Authorization header (used by Postman / REST tests)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.customerId || decoded.id || decoded._id;

      req.user = await Customer.findById(userId).select('-password');

      if (!req.user) {
        return res.status(401).json({
          statusCode: 401,
          success: false,
          message: 'Not authorized, user not found',
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        statusCode: 401,
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  } else {
    return res.status(401).json({
      statusCode: 401,
      success: false,
      message: 'Not authorized, no token',
    });
  }
};

module.exports = { protect };
