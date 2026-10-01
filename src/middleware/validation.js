/**
 * Request Validation Middleware using Joi
 * RecommendX - Distributed Product Recommendation Engine
 */

const { HTTP_STATUS } = require('../config/constants');
const { sendError } = require('../utils/helpers');

/**
 * Validate request payload (body, query, or params) against a Joi schema
 * @param {import('joi').ObjectSchema} schema - Joi schema object
 * @param {'body'|'query'|'params'} [source='body'] - Request property to validate
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[source];

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // Return all validation errors, not just the first one
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''),
      }));

      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Validation failed for request data', details);
    }

    // Replace request payload with sanitized & type-cast values
    req[source] = value;
    return next();
  };
};

module.exports = {
  validate,
};
