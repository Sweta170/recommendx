/**
 * Helper Utilities
 * RecommendX - Distributed Product Recommendation Engine
 */

const { HTTP_STATUS } = require('../config/constants');

/**
 * Standard API Success Response Formatter
 * @param {import('express').Response} res - Express Response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Human-readable success message
 * @param {any} data - Payload data
 * @param {object} meta - Optional pagination or metadata
 */
const sendResponse = (res, statusCode = HTTP_STATUS.OK, message = 'Success', data = null, meta = null) => {
  const payload = {
    success: true,
    statusCode,
    message,
    data,
  };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

/**
 * Standard API Error Response Formatter
 * @param {import('express').Response} res - Express Response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error description
 * @param {any} errors - Validation errors or details
 */
const sendError = (res, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, message = 'An error occurred', errors = null) => {
  const payload = {
    success: false,
    statusCode,
    message,
  };

  if (errors) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
};

/**
 * Higher-order async handler to catch errors in Express route handlers and pass to next()
 * @param {Function} fn - Async controller function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Calculate cosine similarity between two numeric vectors
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number}
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
};

module.exports = {
  sendResponse,
  sendError,
  asyncHandler,
  cosineSimilarity,
};
