/**
 * JWT Authentication & Authorization Middleware
 * RecommendX - Distributed Product Recommendation Engine
 */

const jwt = require('jsonwebtoken');
const { HTTP_STATUS } = require('../config/constants');
const { sendError } = require('../utils/helpers');

/**
 * Verify JWT Token from Authorization header
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Access denied. No authentication token provided.');
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'recommendx_default_secret_key';

    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication token has expired. Please log in again.');
    }
    return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Invalid authentication token.');
  }
};

/**
 * Optional authentication: extracts user if token provided, but doesn't block unauthenticated guests
 */
const optionalToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'recommendx_default_secret_key';
    try {
      req.user = jwt.verify(token, jwtSecret);
    } catch {
      // Ignored for guest access
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};

/**
 * Role-Based Access Control (RBAC) middleware generator
 * @param  {...string} allowedRoles
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, HTTP_STATUS.FORBIDDEN, `Forbidden. Requires one of roles: [${allowedRoles.join(', ')}]`);
    }

    next();
  };
};

module.exports = {
  verifyToken,
  optionalToken,
  requireRole,
};
