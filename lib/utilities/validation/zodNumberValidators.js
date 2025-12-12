'use strict';

const { z } = require('zod');

/**
 * Common Zod number validation patterns
 * Provides reusable number validators with descriptive error messages
 * @module zodNumberValidators
 */
const zodNumberValidators = {
  /**
   * Validates positive integer
   * @param {string} fieldName - Name of field for error messages
   * @returns {z.ZodNumber} Zod number schema for positive integers
   */
  positiveInt: (fieldName) => // positive integer validator
    z.number({
      required_error: `${fieldName} is required`
    }).int(`${fieldName} must be an integer`)
      .positive(`${fieldName} must be positive`),

  /**
   * Validates non-negative integer (0 or greater)
   * @param {string} fieldName - Name of field for error messages
   * @returns {z.ZodNumber} Zod number schema for non-negative integers
   */
  nonNegativeInt: (fieldName) => // non-negative integer validator
    z.number({
      required_error: `${fieldName} is required`
    }).int(`${fieldName} must be an integer`)
      .nonnegative(`${fieldName} must be 0 or greater`),

  /**
   * Validates temperature (0-2 range for AI models)
   * @param {string} [fieldName='temperature'] - Name of field for error messages
   * @returns {z.ZodNumber} Zod number schema for temperature
   */
  temperature: (fieldName = 'temperature') => // AI model temperature validator
    z.number({
      required_error: `${fieldName} is required`
    }).min(0, `${fieldName} cannot be negative`)
      .max(2, `${fieldName} must be within safety bounds (0-2)`),

  /**
   * Validates timeout in milliseconds
   * @param {string} [fieldName='timeout'] - Name of field for error messages
   * @returns {z.ZodNumber} Zod number schema for timeout
   */
  timeout: (fieldName = 'timeout') => // timeout in ms validator
    z.number({
      required_error: `${fieldName} is required`
    }).positive(`${fieldName} must be positive`),

  /**
   * Validates number within range
   * @param {string} fieldName - Name of field for error messages
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {z.ZodNumber} Zod number schema with range constraints
   */
  range: (fieldName, min, max) => // number range validator
    z.number({
      required_error: `${fieldName} is required`
    }).min(min, `${fieldName} must be at least ${min}`)
      .max(max, `${fieldName} must be at most ${max}`),

  /**
   * Validates percentage (0-100)
   * @param {string} fieldName - Name of field for error messages
   * @returns {z.ZodNumber} Zod number schema for percentage
   */
  percentage: (fieldName) => // percentage validator (0-100)
    z.number({
      required_error: `${fieldName} is required`
    }).min(0, `${fieldName} must be at least 0`)
      .max(100, `${fieldName} must be at most 100`)
};

module.exports = zodNumberValidators;
