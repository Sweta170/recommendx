/**
 * Logging Middleware Configuration
 * RecommendX - Distributed Product Recommendation Engine
 */

const morgan = require('morgan');

// Custom token for request response time with colors/status
morgan.token('colored-status', (req, res) => {
  const status = res.statusCode;
  return status;
});

// Custom token for client IP
morgan.token('client-ip', (req) => {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress || '-';
});

// Custom JSON stream for production logs
const format = process.env.NODE_ENV === 'production'
  ? '[:date[iso]] :client-ip :method :url :status :res[content-length] - :response-time ms'
  : ':method :url :status :response-time ms - :res[content-length]';

const httpLogger = morgan(format, {
  skip: (req, res) => {
    // Skip logging health checks in production to keep logs clean
    return process.env.NODE_ENV === 'production' && req.url === '/api/v1/health';
  },
});

module.exports = {
  httpLogger,
};
