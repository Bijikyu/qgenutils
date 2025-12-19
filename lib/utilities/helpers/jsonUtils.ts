/**
 * JSON utilities - consolidated interface for all JSON operations
 * This module provides backward compatibility while using the new modular structure
 */

// Import individual JSON utility modules
const {
  safeJsonParse,
  parseAndValidateJson,
  isValidJson
} = require('./jsonParsing');

const {
  safeJsonStringify,
  safeJsonStringifyWithSize
} = require('./jsonStringification');

const {
  safeDeepClone,
  safeJsonMerge
} = require('./jsonManipulation');

const {
  getJsonSize,
  truncateJson,
  truncateObject
} = require('./jsonSizeUtils');

import { createJsonUtils } from './jsonFactory';

// Export all utilities for backward compatibility
export default {
  safeJsonParse,
  safeJsonStringify,
  safeDeepClone,
  parseAndValidateJson,
  safeJsonStringifyWithSize,
  safeJsonMerge,
  isValidJson,
  getJsonSize,
  truncateJson,
  truncateObject,
  createJsonUtils
};