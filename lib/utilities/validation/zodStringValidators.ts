'use strict';

import { z } from 'zod';

/**
 * Common Zod string validation patterns
 * Provides reusable string validators with descriptive error messages
 * @module zodStringValidators
 */
const zodStringValidators = {
  /**
   * Validates non-empty string with custom error messages
   * @param {string} fieldName - Name of field for error messages
   * @param {string} [customMessage] - Optional custom error message
   * @returns {z.ZodString} Zod string schema
   */
  nonEmpty: (fieldName, customMessage) => // non-empty string validator
    z.string({
      required_error: customMessage || `${fieldName} is required`
    }).min(1, customMessage || `${fieldName} must not be empty`),

  /**
   * Validates email format with RFC 5322 compliance
   * @param {string} fieldName - Name of email field for error messages
   * @returns {z.ZodString} Zod email schema
   */
  email: (fieldName) => // email format validator
    z.string({
      required_error: `${fieldName} is required`
    }).email(`${fieldName} must be a valid email address`),

  /**
   * Validates API key format for service authentication
   * @param {string} serviceName - Name of the service requiring API key
   * @returns {z.ZodString} Zod string schema for API keys
   */
  apiKey: (serviceName) => // API key validator
    z.string({
      required_error: `${serviceName} API key is required`
    }).min(1, `${serviceName} API key is required`),

  /**
   * Validates URL format with proper protocol checking
   * @param {string} fieldName - Name of URL field for error messages
   * @returns {z.ZodString} Zod URL schema
   */
  url: (fieldName) => // URL format validator
    z.string({
      required_error: `${fieldName} is required`
    }).url(`${fieldName} must be a valid URL`),

  /**
   * Validates string length within bounds
   * @param {string} fieldName - Name of field for error messages
   * @param {number} min - Minimum length
   * @param {number} max - Maximum length
   * @returns {z.ZodString} Zod string schema with length constraints
   */
  length: (fieldName, min, max) => // string length validator
    z.string({
      required_error: `${fieldName} is required`
    }).min(min, `${fieldName} must be at least ${min} characters`)
      .max(max, `${fieldName} must be at most ${max} characters`),

  /**
   * Validates string matches regex pattern
   * @param {string} fieldName - Name of field for error messages
   * @param {RegExp} pattern - Regex pattern to match
   * @param {string} [patternMessage] - Description of expected pattern
   * @returns {z.ZodString} Zod string schema with pattern constraint
   */
  pattern: (fieldName, pattern, patternMessage) => // regex pattern validator
    z.string({
      required_error: `${fieldName} is required`
    }).regex(pattern, patternMessage || `${fieldName} has invalid format`)
};

export default zodStringValidators;
