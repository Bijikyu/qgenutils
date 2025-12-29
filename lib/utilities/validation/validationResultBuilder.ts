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
} = require('./resultCreators.js');

const {
  isSuccess,
  isFailure,
  getFirstError
} = require('./resultAnalyzers.js');

import validationConstants from './validationConstants.js';
import typeValidatorFactory from './typeValidatorFactory.js';
const { ERROR_MESSAGES } = validationConstants;
const { createTypeValidator } = typeValidatorFactory;

// Export all validation utilities for backward compatibility
export default {
  createSuccessResult,
  createErrorResult,
  createMultiErrorResult,
  isSuccess,
  isFailure,
  getFirstError,
  ERROR_MESSAGES,
  createTypeValidator
};