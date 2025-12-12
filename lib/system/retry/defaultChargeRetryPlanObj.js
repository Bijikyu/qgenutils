/**
 * Generate a default retry plan for charge operations (object-based).
 *
 * PURPOSE: Object-based version of defaultChargeRetryPlan for structured
 * input/output scenarios such as API handlers or configuration systems.
 *
 * @param {object} [params={}] - Input parameters
 * @param {number} [params.maxAttempts] - Maximum number of retry attempts (default: 3)
 * @returns {{plan: Array<{attempt: number, delayMs: number}>}} Object containing retry plan
 * @throws {Error} If params is not an object
 */

const defaultChargeRetryPlan = require('./defaultChargeRetryPlan');

function defaultChargeRetryPlanObj(params = {}) {
  if (!params || typeof params !== 'object') {
    throw new Error('Parameter must be an object with optional maxAttempts property');
  }

  const maxAttempts = params.maxAttempts ?? 3;

  return { plan: defaultChargeRetryPlan(maxAttempts) };
}

module.exports = defaultChargeRetryPlanObj;
