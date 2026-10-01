/**
 * Database Auto-Initialization & Schema Migration Utility
 * RecommendX - Distributed Product Recommendation Engine
 */

const fs = require('fs');
const path = require('path');
const { pool, query } = require('../config/database');

/**
 * Checks if key database tables exist in PostgreSQL
 * @returns {Promise<boolean>}
 */
const checkSchemaExists = async () => {
  try {
    const res = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('users', 'products', 'user_behavior', 'recommendations');
    `);
    // Return true if all 4 core tables exist
    return res.rows.length >= 4;
  } catch (error) {
    console.error('Error checking schema existence:', error.message);
    return false;
  }
};

/**
 * Initializes database schema by executing schema.sql on the connected PostgreSQL instance
 * @returns {Promise<boolean>}
 */
const initializeDatabase = async () => {
  try {
    console.log('🔍 [Database Init] Checking schema status in PostgreSQL...');
    const schemaExists = await checkSchemaExists();

    if (schemaExists) {
      console.log('✅ [Database Schema] All core tables (users, products, user_behavior, recommendations) already exist.');
      return true;
    }

    console.log('⚡ [Database Schema] Running database/schema.sql migration...');
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at path: ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await query(schemaSql);

    const verified = await checkSchemaExists();
    if (verified) {
      console.log('🎉 [Database Schema] Successfully applied schema.sql and seeded initial records!');
      return true;
    } else {
      console.warn('⚠️ [Database Schema] Applied schema but some tables could not be verified.');
      return false;
    }
  } catch (error) {
    console.error('❌ [Database Init Error]:', error.message);
    return false;
  }
};

module.exports = {
  checkSchemaExists,
  initializeDatabase,
};
