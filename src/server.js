/**
 * Main Application Server
 * RecommendX - Distributed Product Recommendation Engine
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { testConnection, closePool } = require('./config/database');
const { connectRedis, closeRedis } = require('./config/redis');
const { initializeDatabase } = require('./utils/database');
const { RATE_LIMIT } = require('./config/constants');
const { httpLogger } = require('./middleware/logger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const apiRoutes = require('./routes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Trust reverse proxy (e.g. Nginx, Cloudflare, AWS ALB)
app.set('trust proxy', 1);

// 1. Security Headers Middleware
app.use(helmet());

// 2. CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['*'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// 3. Rate Limiter Middleware (500 requests per minute by default)
const limiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP, please try again after 1 minute.',
  },
});
app.use(limiter);

// 4. Request Logging Middleware
app.use(httpLogger);

// 5. Body Parsers with payload limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 6. Root & Health Check Shortcuts
app.get('/', (req, res) => {
  res.json({
    name: 'RecommendX API',
    status: 'online',
    documentation: `${API_PREFIX}/info`,
    health: `${API_PREFIX}/health`,
  });
});

// Convenient alias for `/api/health` and `/api/products` preview
app.use('/api', apiRoutes);
app.use(API_PREFIX, apiRoutes);

// 7. 404 Handler for undefined routes
app.use(notFoundHandler);

// 8. Centralized Error Handling Middleware
app.use(errorHandler);

// Server startup & Lifecycle management
let server;

const startServer = async () => {
  try {
    console.log('====================================================');
    console.log('🚀 Initializing RecommendX Distributed Engine (Cloud Mode)');
    console.log('====================================================');

    // Test PostgreSQL Connection
    const dbOk = await testConnection();
    if (dbOk) {
      // Auto-initialize schema if missing
      await initializeDatabase();
    } else {
      console.warn('⚠️  PostgreSQL connection warning. Ensure your cloud credentials in .env are valid.');
    }

    // Connect Redis Cache
    const redisOk = await connectRedis();
    if (!redisOk) {
      console.warn('⚠️  Redis connection warning. Ensure your Redis Cloud credentials in .env are valid.');
    }

    // Start HTTP listener
    server = app.listen(PORT, () => {
      console.log(`✅ Server running in [${process.env.NODE_ENV || 'development'}] mode on port ${PORT}`);
      console.log(`🌐 Base API URL: http://localhost:${PORT}${API_PREFIX}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log('====================================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful Shutdown Handler
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received [${signal}]. Starting graceful shutdown...`);

  if (server) {
    server.close(() => {
      console.log('🔌 HTTP server closed.');
    });
  }

  // Close database and cache connections
  await closePool();
  await closeRedis();

  console.log('👋 RecommendX process exited cleanly.');
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Promise Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception thrown:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Start the server
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, startServer };
