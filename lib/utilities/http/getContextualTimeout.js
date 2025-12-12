/**
 * Gets contextual timeout based on operation type.
 *
 * PURPOSE: Returns the appropriate timeout in milliseconds for a given
 * operation type. Falls back to default timeout for unknown operation types.
 *
 * @param {string} operation - Type of operation being performed
 * @returns {number} Appropriate timeout in milliseconds
 */
const contextualTimeouts = require('./contextualTimeouts');

function getContextualTimeout(operation) {
  return contextualTimeouts[operation] ?? contextualTimeouts.default;
}

module.exports = getContextualTimeout;
