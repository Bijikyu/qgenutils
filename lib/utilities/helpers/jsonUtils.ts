/**
 * JSON utilities - consolidated interface for all JSON operations
 * This module provides backward compatibility while using the new modular structure
 */

// Import individual JSON utility modules
import jsonParsing from './jsonParsing.js';
import jsonStringification from './jsonStringification.js';
import jsonManipulation from './jsonManipulation.js';
import jsonSizeUtils from './jsonSizeUtils.js';
import createJsonUtils from './jsonFactory.js';

const { safeJsonParse, parseAndValidateJson, isValidJson } = jsonParsing;
const { safeJsonStringify, safeJsonStringifyWithSize } = jsonStringification;
const { safeDeepClone, safeJsonMerge } = jsonManipulation;
const { getJsonSize, truncateJson, truncateObject } = jsonSizeUtils;

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
