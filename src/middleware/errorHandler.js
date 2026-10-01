/**
 * Global Error Handling Middleware
 * RecommendX - Distributed Product Recommendation Engine
 */

const { HTTP_STATUS } = require('../config/constants');
const { sendError } = require('../utils/helpers');

/**
 * 404 Not Found Middleware for unmatched routes
 */
const notFoundHandler = (req, res, next) => {
  return sendError(
    res,
    HTTP_STATUS.NOT_FOUND,
    `Cannot ${req.method} ${req.originalUrl} - Route not found on RecommendX API`
  );
};

/**
 * Central Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle PostgreSQL specific errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        statusCode = HTTP_STATUS.CONFLICT;
        message = 'A duplicate record already exists with the provided unique field.';
        errors = err.detail || null;
        break;
      case '23503': // Foreign key violation
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = 'Foreign key violation. Referenced entity does not exist.';
        break;
      case '22P02': // Invalid text representation (e.g. invalid UUID)
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = 'Invalid data format or ID format provided.';
        break;
      case 'ECONNREFUSED':
      case '57P01':
        statusCode = HTTP_STATUS.SERVICE_UNAVAILABLE;
        message = 'Database service is currently unreachable.';
        break;
      default:
        break;
    }
  }

  // Handle JSON Syntax Error in request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Malformed JSON syntax in request body.';
  }

  // Handle JWT errors if thrown directly
  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Invalid authentication token.';
  }

  // Log error stack in non-production
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Global Error Handler] [${req.method} ${req.url}]:`, err);
  } else {
    console.error(`[Global Error Handler] [${req.method} ${req.url}]: ${message}`);
  }

  return sendError(res, statusCode, message, errors);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
