/**
 * Main API Routes Aggregator
 * RecommendX - Distributed Product Recommendation Engine
 */

const express = require('express');
const router = express.Router();
const { pool, testConnection, query } = require('../config/database');
const { redisClient } = require('../config/redis');
const { sendResponse, sendError, asyncHandler } = require('../utils/helpers');
const { HTTP_STATUS } = require('../config/constants');

/**
 * @route   GET /health (or /api/health)
 * @desc    Deep health check endpoint for Neon PostgreSQL & Redis Cloud
 * @access  Public
 */
router.get('/health', async (req, res) => {
  const healthStatus = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    status: 'healthy',
    services: {
      database: 'unknown',
      redis: 'unknown',
    },
  };

  try {
    const dbHealthy = await testConnection(1);
    healthStatus.services.database = dbHealthy ? 'connected (Neon PostgreSQL)' : 'disconnected';
  } catch (err) {
    healthStatus.services.database = 'error';
    healthStatus.status = 'degraded';
  }

  try {
    if (redisClient.isOpen) {
      await redisClient.ping();
      healthStatus.services.redis = 'connected (Redis Cloud)';
    } else {
      healthStatus.services.redis = 'disconnected';
      healthStatus.status = 'degraded';
    }
  } catch (err) {
    healthStatus.services.redis = 'error';
    healthStatus.status = 'degraded';
  }

  const statusCode = healthStatus.status === 'healthy' ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE;
  return sendResponse(res, statusCode, 'Health check complete', healthStatus);
});

/**
 * @route   GET /products (or /api/products)
 * @desc    Quick verification query endpoint for Phase 2 testing
 * @access  Public
 */
router.get(
  '/products',
  asyncHandler(async (req, res) => {
    try {
      const result = await query('SELECT id, name, category, price, tags, image_url FROM products ORDER BY id ASC LIMIT 20;');
      return sendResponse(res, HTTP_STATUS.OK, 'Connected to cloud database', result.rows);
    } catch (error) {
      return sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, `Database query error: ${error.message}`);
    }
  })
);

/**
 * @route   GET /info
 * @desc    API Metadata and engine info
 * @access  Public
 */
router.get('/info', (req, res) => {
  return sendResponse(res, HTTP_STATUS.OK, 'RecommendX Cloud Engine API', {
    name: 'RecommendX Engine',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    cloudServices: {
      database: 'Neon PostgreSQL (Serverless)',
      cache: 'Redis Cloud (In-Memory)',
    },
    tables: ['users', 'products', 'user_behavior', 'recommendations'],
  });
});

module.exports = router;
