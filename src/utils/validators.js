/**
 * Validation Schemas with Joi
 * RecommendX - Distributed Product Recommendation Engine
 */

const Joi = require('joi');

const schemas = {
  // Authentication Schemas
  registerUser: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).max(128).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required',
    }),
    name: Joi.string().trim().min(2).max(100).required().messages({
      'string.min': 'Name must be at least 2 characters',
      'any.required': 'Name is required',
    }),
    preferences: Joi.array().items(Joi.string()).default([]),
  }),

  loginUser: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  }),

  // Product Schemas
  createProduct: Joi.object({
    title: Joi.string().trim().min(2).max(255).required(),
    description: Joi.string().trim().allow('', null).default(''),
    category: Joi.string().trim().required(),
    subCategory: Joi.string().trim().allow('', null).default(''),
    price: Joi.number().positive().precision(2).required(),
    tags: Joi.array().items(Joi.string().trim()).default([]),
    attributes: Joi.object().default({}),
    inStock: Joi.boolean().default(true),
    rating: Joi.number().min(0).max(5).default(0),
    imageUrl: Joi.string().uri().allow('', null).default(''),
  }),

  updateProduct: Joi.object({
    title: Joi.string().trim().min(2).max(255),
    description: Joi.string().trim().allow('', null),
    category: Joi.string().trim(),
    subCategory: Joi.string().trim().allow('', null),
    price: Joi.number().positive().precision(2),
    tags: Joi.array().items(Joi.string().trim()),
    attributes: Joi.object(),
    inStock: Joi.boolean(),
    rating: Joi.number().min(0).max(5),
    imageUrl: Joi.string().uri().allow('', null),
  }).min(1),

  // Interaction Tracking Schema
  trackInteraction: Joi.object({
    userId: Joi.string().uuid().required(),
    productId: Joi.string().uuid().required(),
    interactionType: Joi.string().valid('view', 'click', 'add_to_cart', 'purchase', 'rate', 'wishlist').required(),
    rating: Joi.number().min(1).max(5).optional(),
    metadata: Joi.object().default({}),
  }),

  // Recommendation Request Schema
  getRecommendations: Joi.object({
    userId: Joi.string().uuid().optional(),
    productId: Joi.string().uuid().optional(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    strategy: Joi.string().valid(
      'collaborative_filtering',
      'content_based',
      'hybrid',
      'trending_popular',
      'matrix_factorization'
    ).default('hybrid'),
  }),

  // Standard Pagination Schema
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().valid('created_at', 'price', 'rating', 'popularity').default('created_at'),
    order: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').default('DESC'),
  }),
};

module.exports = schemas;
