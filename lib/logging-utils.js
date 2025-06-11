/*
 * Logging Utilities Module
 * 
 * This module provides centralized logging patterns used across all QGenUtils modules
 * to eliminate code duplication while maintaining consistent logging behavior.
 * 
 * DESIGN PHILOSOPHY:
 * - Centralize repetitive logging patterns
 * - Maintain consistent log format across all modules
 * - Provide both input and output logging functions
 * - Support contextual information for debugging
 * 
 * USAGE PATTERNS:
 * - logFunctionStart() for function entry logging
 * - logFunctionResult() for function exit logging
 * - logFunctionError() for error condition logging
 */

const { qerrors } = require('qerrors'); // internal error logger

/**
 * Log function entry with input parameters
 * 
 * RATIONALE: Every utility function logs its entry with input parameters
 * for debugging and traceability. This centralizes the logging pattern
 * to ensure consistency and reduce code duplication.
 * 
 * @param {string} functionName - Name of the function being entered
 * @param {*} input - Input parameter(s) being processed
 */
function logFunctionStart(functionName, input) {
  const inputDisplay = input === null ? 'null' : 
                      input === undefined ? 'undefined' :
                      typeof input === 'object' ? JSON.stringify(input) :
                      String(input);
  console.log(`${functionName} is running with ${inputDisplay}`);
}

/**
 * Log function exit with return value
 * 
 * RATIONALE: Every utility function logs its exit with return value
 * for debugging and result verification. This centralizes the pattern
 * while handling different return value types appropriately.
 * 
 * @param {string} functionName - Name of the function being exited
 * @param {*} result - Return value being logged
 */
function logFunctionResult(functionName, result) {
  const resultDisplay = result === null ? 'null' : 
                       result === undefined ? 'undefined' :
                       typeof result === 'object' ? JSON.stringify(result) :
                       String(result);
  console.log(`${functionName} is returning ${resultDisplay}`);
}

/**
 * Log function error with context and handle error consistently
 * 
 * RATIONALE: All utility functions follow the same error handling pattern:
 * log via qerrors, log to console, and return appropriate default value.
 * This centralizes the pattern while allowing customization of return values.
 * 
 * @param {Error} error - Error object to log
 * @param {string} functionName - Name of function where error occurred
 * @param {*} context - Additional context for debugging
 * @param {*} defaultReturn - Default value to return on error
 * @returns {*} The defaultReturn value
 */
function logFunctionError(error, functionName, context, defaultReturn = false) {
  qerrors(error, functionName, context);
  console.log(`${functionName} has run resulting in a final value of failure`);
  return defaultReturn;
}

/*
 * Module Export Strategy:
 * 
 * Export all logging functions for use across QGenUtils modules.
 * These functions eliminate repetitive logging code while maintaining
 * the exact same logging behavior that exists throughout the library.
 */
module.exports = {
  logFunctionStart, // export function entry logger
  logFunctionResult, // export function exit logger
  logFunctionError // export standardized error logger
};