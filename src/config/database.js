/**
 * PostgreSQL Database Connection & Pool Configuration (Optimized for Neon Cloud & Local)
 * RecommendX - Distributed Product Recommendation Engine
 */

const { Pool } = require('pg');
require('dotenv').config();

// Determine if SSL is required (Neon Cloud requires SSL with rejectUnauthorized: false)
const useSSL = process.env.DB_SSL === 'true' || 
  (process.env.DB_HOST && !['localhost', '127.0.0.1'].includes(process.env.DB_HOST));

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: useSSL ? { rejectUnauthorized: false } : false,
      max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
      min: parseInt(process.env.DB_POOL_MIN, 10) || 5,
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS, 10) || 30000,
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS, 10) || 5000,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      database: process.env.DB_NAME || 'recommendx',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: useSSL ? { rejectUnauthorized: false } : false,
      max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
      min: parseInt(process.env.DB_POOL_MIN, 10) || 5,
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS, 10) || 30000,
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS, 10) || 5000,
    };

// Create the connection pool
const pool = new Pool(poolConfig);

// Pool lifecycle event listeners
pool.on('connect', () => {
  // Client checked out
});

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]:', err.message);
});

/**
 * Execute parameterized query with timing & error tracing
 * @param {string} text - SQL Query text
 * @param {Array} [params] - Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG_SQL === 'true') {
      console.log(`[DB Query] ${text.slice(0, 80)}... (${duration}ms | rows: ${res.rowCount})`);
    }
    return res;
  } catch (error) {
    console.error('[Database Query Error]:', { query: text, message: error.message });
    throw error;
  }
};

/**
 * Acquire client for transactional queries
 * @returns {Promise<import('pg').PoolClient>}
 */
const getClient = async () => {
  const client = await pool.connect();
  return client;
};

/**
 * Test and verify connection to Neon / PostgreSQL
 * @param {number} retries - Number of retry attempts on initial connect
 * @returns {Promise<boolean>}
 */
const testConnection = async (retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await pool.query('SELECT NOW() as current_time, current_database() as database, version() as version;');
      const { database, current_time } = res.rows[0];
      const host = poolConfig.host || 'Cloud Instance';
      console.log(`✅ [Database Connected] Host: ${host} | DB: ${database} | Time: ${current_time}`);
      return true;
    } catch (error) {
      console.warn(`⚠️ [Database Connection Attempt ${attempt}/${retries} Failed]:`, error.message);
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
      }
    }
  }
  console.error('❌ [Database Connection Failed] Please check your DB credentials and network access.');
  return false;
};

/**
 * Gracefully close PostgreSQL connection pool
 */
const closePool = async () => {
  try {
    await pool.end();
    console.log('🔌 [Database Pool Closed]');
  } catch (error) {
    console.error('Error closing database pool:', error.message);
  }
};

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
  closePool,
};
