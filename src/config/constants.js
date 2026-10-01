/**
 * Application Constants
 * RecommendX - Distributed Product Recommendation Engine
 */

module.exports = {
  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },

  // Cache Key Prefixes & TTLs (in seconds)
  CACHE: {
    DEFAULT_TTL: parseInt(process.env.REDIS_DEFAULT_TTL_SEC, 10) || 3600,
    SHORT_TTL: 300, // 5 minutes
    LONG_TTL: 86400, // 24 hours
    PREFIX: {
      PRODUCT: 'rx:product:',
      RECOMMENDATION_USER: 'rx:rec:user:',
      RECOMMENDATION_SIMILAR: 'rx:rec:sim:',
      USER_PROFILE: 'rx:user:',
      TRENDING: 'rx:trending:',
      SESSION: 'rx:session:',
    },
  },

  // User Interaction Types
  INTERACTION_TYPES: {
    VIEW: 'view',
    CLICK: 'click',
    ADD_TO_CART: 'add_to_cart',
    PURCHASE: 'purchase',
    RATE: 'rate',
    WISHLIST: 'wishlist',
  },

  // User Roles
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
    SYSTEM: 'system',
  },

  // Recommendation Algorithm Strategies
  ALGORITHMS: {
    COLLABORATIVE_FILTERING: 'collaborative_filtering',
    CONTENT_BASED: 'content_based',
    HYBRID: 'hybrid',
    TRENDING_POPULAR: 'trending_popular',
    MATRIX_FACTORIZATION: 'matrix_factorization',
  },

  // Rate Limiting Defaults
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60 * 1000,
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 500,
  },
};
