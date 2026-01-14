/**
 * URL Utilities Module - Comprehensive URL Processing and Validation
 *
 * PURPOSE: This module provides a collection of URL manipulation and validation
 * utilities designed to handle common URL processing tasks safely and efficiently.
 * These utilities are essential for web applications, API integrations, and
 * data processing pipelines that work with URLs.
 *
 * SECURITY CONSIDERATIONS: All utilities include input validation and
 * sanitization to prevent URL injection attacks and malformed URL handling.
 * They follow defense-in-depth principles with comprehensive error handling.
 *
 * COMPATIBILITY: These utilities maintain backward compatibility with existing
 * code while providing enhanced security and functionality. They handle edge
 * cases and malformed input gracefully without throwing exceptions.
 *
 * USE CASES:
 * - API endpoint normalization and validation
 * - Redirect URL processing and security checks
 * - Web scraping and link extraction
 * - Configuration file URL validation
 * - User input sanitization for URL fields
 */

// Import individual URL utilities for modular composition and re-export
import ensureProtocol from './ensureProtocol.js';
import ensureProtocolUrl from './ensureProtocolUrl.js';
import getDomain from './getDomain.js';
import normalizeUrlOrigin from './normalizeUrlOrigin.js';
import parseUrlParts from './parseUrlParts.js';
import stripProtocol from './stripProtocol.js';
import {
  removeTrackingParams,
  extractUrlsFromContent,
  isSecureUrl,
  isValidUrl,
  getUrlMetadata,
  joinUrlPaths,
  TRACKING_PARAMS
} from './urlHelpers.js';

/**
 * Named exports for ES6 import syntax
 * Allows selective importing of specific utilities for better tree-shaking
 * and reduced bundle sizes in client-side applications.
 */
export {
  ensureProtocol,
  ensureProtocolUrl,
  getDomain,
  normalizeUrlOrigin,
  parseUrlParts,
  stripProtocol,
  removeTrackingParams,
  extractUrlsFromContent,
  isSecureUrl,
  isValidUrl,
  getUrlMetadata,
  joinUrlPaths,
  TRACKING_PARAMS
};

export type { GetDomainData, GetDomainResult, GetDomainDependencies } from './getDomain.js';
export type { EnsureProtocolData } from './ensureProtocolUrl.js';

/**
 * Default export for CommonJS compatibility and convenience imports
 * Provides all utilities as properties of a single object for legacy
 * import patterns and quick access to all URL utilities.
 */
export default {
  ensureProtocol,
  ensureProtocolUrl,
  getDomain,
  normalizeUrlOrigin,
  parseUrlParts,
  stripProtocol,
  removeTrackingParams,
  extractUrlsFromContent,
  isSecureUrl,
  isValidUrl,
  getUrlMetadata,
  joinUrlPaths,
  TRACKING_PARAMS
};
