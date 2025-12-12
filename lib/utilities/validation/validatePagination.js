'use strict';

const validateNumberRange = require('./validateNumberRange'); // reuse range validator

/**
 * Validates pagination parameters
 * @param {Object} params - Pagination parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @returns {{error: string}|null} Validation error or null if valid
 * @example
 * validatePagination({ page: 1, limit: 20 }); // null
 */
function validatePagination(params = {}) { // check pagination params
  const { page = 1, limit = 10 } = params;

  const pageError = validateNumberRange(page, 1, 1000, 'page'); // page 1-1000
  if (pageError) return pageError;

  const limitError = validateNumberRange(limit, 1, 100, 'limit'); // limit 1-100
  if (limitError) return limitError;

  return null; // valid
}

module.exports = validatePagination;
