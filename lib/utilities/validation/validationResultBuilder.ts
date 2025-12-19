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

import { ERROR_MESSAGES } from './validationConstants';
import { createTypeValidator } from './typeValidatorFactory';

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