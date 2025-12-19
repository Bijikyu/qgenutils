'use strict';

/**
 * Validation result builder utilities - consolidated interface
 * This module provides backward compatibility while using the new modular structure
 */

// Import individual validation modules
const {
  createSuccessResult,
  createErrorResult,
  createMultiErrorResult
} = require('./resultCreators');

const {
  isSuccess,
  isFailure,
  getFirstError
} = require('./resultAnalyzers');

const { ERROR_MESSAGES } = require('./validationConstants');
const { createTypeValidator } = require('./typeValidatorFactory');

// Export all validation utilities for backward compatibility
module.exports = {
  createSuccessResult,
  createErrorResult,
  createMultiErrorResult,
  isSuccess,
  isFailure,
  getFirstError,
  ERROR_MESSAGES,
  createTypeValidator
};