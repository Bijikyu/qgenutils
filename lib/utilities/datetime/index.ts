/**
 * Date and Time Utilities Module - Comprehensive DateTime Processing
 *
 * PURPOSE: This module provides a comprehensive suite of date and time manipulation
 * utilities designed for production applications. These utilities handle common
 * DateTime operations with proper timezone awareness, formatting, and validation.
 *
 * ARCHITECTURE: The module is organized into several categories:
 * - Basic operations (addDays, formatDate)
 * - Advanced formatting (formatDateTime, formatDuration)
 * - Provider pattern for testability (createTimeProvider)
 * - Relative time formatting (formatRelativeTime)
 *
 * TIMEZONE CONSIDERATIONS: All utilities are designed to work consistently
 * across different timezone configurations. The provider pattern enables
 * deterministic time handling for testing and timezone-sensitive operations.
 *
 * INTERNATIONALIZATION: Supports multiple date formats and can be extended
 * for locale-specific requirements. The formatting utilities follow common
 * international standards while maintaining flexibility for custom formats.
 *
 * TESTING SUPPORT: The provider pattern enables dependency injection of
 * time sources, making DateTime operations deterministic and testable.
 * This is essential for unit testing and CI/CD pipeline reliability.
 *
 * PERFORMANCE CONSIDERATIONS: Utilities are optimized for common use cases
 * while maintaining readability and correctness. They avoid unnecessary
 * object creation and use efficient date manipulation algorithms.
 */

// Import individual DateTime utilities for modular composition and re-export
import addDays from './addDays.js';
import formatDate from './formatDate.js';
import formatDateTime from './formatDateTime.js';
import formatDateWithPrefix from './formatDateWithPrefix.js';
import formatDuration from './formatDuration.js';
import createTimeProvider from './createTimeProvider.js';
import formatDateTimeWithProvider from './formatDateTimeWithProvider.js';
import formatDurationWithProvider from './formatDurationWithProvider.js';
import formatRelativeTime from './formatRelativeTime.js';

/**
 * Named exports for ES6 import syntax
 * Enables selective importing of specific DateTime utilities for optimal
 * bundle size management and tree-shaking in client-side applications.
 */
export {
  addDays,
  formatDate,
  formatDateTime,
  formatDateWithPrefix,
  formatDuration,
  createTimeProvider,
  formatDateTimeWithProvider,
  formatDurationWithProvider,
  formatRelativeTime
};

/**
 * Default export for CommonJS compatibility and convenience imports
 * Provides all DateTime utilities as properties of a single object for
 * legacy import patterns and comprehensive access to all functionality.
 */
export default {
  addDays,
  formatDate,
  formatDateTime,
  formatDateWithPrefix,
  formatDuration,
  createTimeProvider,
  formatDateTimeWithProvider,
  formatDurationWithProvider,
  formatRelativeTime
};
