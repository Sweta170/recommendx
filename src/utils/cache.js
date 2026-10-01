/**
 * Redis Caching Utilities
 * RecommendX - Distributed Product Recommendation Engine
 */

const { redisClient } = require('../config/redis');
const { CACHE } = require('../config/constants');

/**
 * Retrieve an item from the cache
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Deserialized data or null
 */
const get = async (key) => {
  try {
    if (!redisClient.isOpen) return null;
    const data = await redisClient.get(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error(`[Cache GET Error] Key: ${key}`, error.message);
    return null;
  }
};

/**
 * Store an item in the cache with TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to store (will be JSON-stringified)
 * @param {number} [ttlSeconds=CACHE.DEFAULT_TTL] - Time to live in seconds
 * @returns {Promise<boolean>}
 */
const set = async (key, value, ttlSeconds = CACHE.DEFAULT_TTL) => {
  try {
    if (!redisClient.isOpen) return false;
    const serialized = JSON.stringify(value);
    await redisClient.set(key, serialized, { EX: ttlSeconds });
    return true;
  } catch (error) {
    console.error(`[Cache SET Error] Key: ${key}`, error.message);
    return false;
  }
};

/**
 * Delete one or more keys from cache
 * @param {string|string[]} keys - Cache key(s)
 * @returns {Promise<number>} Number of keys deleted
 */
const del = async (keys) => {
  try {
    if (!redisClient.isOpen) return 0;
    return await redisClient.del(keys);
  } catch (error) {
    console.error(`[Cache DEL Error] Keys: ${keys}`, error.message);
    return 0;
  }
};

/**
 * Invalidate all keys matching a glob-style pattern
 * @param {string} pattern - Pattern e.g. 'rx:rec:user:*'
 * @returns {Promise<number>} Total deleted keys
 */
const deleteByPattern = async (pattern) => {
  try {
    if (!redisClient.isOpen) return 0;
    const keys = await redisClient.keys(pattern);
    if (keys && keys.length > 0) {
      return await redisClient.del(keys);
    }
    return 0;
  } catch (error) {
    console.error(`[Cache Invalidation Error] Pattern: ${pattern}`, error.message);
    return 0;
  }
};

/**
 * Cache-aside wrapper: gets from cache, or runs fetcher callback and caches the result
 * @param {string} key - Cache key
 * @param {Function} fetcherFn - Async function to retrieve data if cache misses
 * @param {number} [ttlSeconds=CACHE.DEFAULT_TTL] - Time to live in seconds
 * @returns {Promise<any>}
 */
const getOrSet = async (key, fetcherFn, ttlSeconds = CACHE.DEFAULT_TTL) => {
  const cachedData = await get(key);
  if (cachedData !== null) {
    return { data: cachedData, source: 'cache' };
  }

  const freshData = await fetcherFn();
  if (freshData !== undefined && freshData !== null) {
    await set(key, freshData, ttlSeconds);
  }

  return { data: freshData, source: 'database' };
};

/**
 * Increment a numeric value stored at key (useful for view/click counters)
 * @param {string} key
 * @param {number} [by=1]
 * @returns {Promise<number>}
 */
const increment = async (key, by = 1) => {
  try {
    if (!redisClient.isOpen) return 0;
    return await redisClient.incrBy(key, by);
  } catch (error) {
    console.error(`[Cache INCR Error] Key: ${key}`, error.message);
    return 0;
  }
};

module.exports = {
  get,
  set,
  del,
  deleteByPattern,
  getOrSet,
  increment,
};
