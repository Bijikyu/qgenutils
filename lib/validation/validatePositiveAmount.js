/**
 * Validates and normalizes payment amounts with Express integration.
 *
 * PURPOSE: Provides robust validation for payment amounts, ensuring they
 * are positive numbers and properly formatted as integers (cents) suitable
 * for payment processing (e.g., Stripe). Sends 400 response directly on failure.
 *
 * REQUIREMENT: The truncated integer value must be >= 1. Sub-cent amounts
 * like 0.5 are rejected because they would normalize to 0.
 *
 * @param {object} input - Validation input
 * @param {unknown} input.amount - The amount to validate
 * @param {object} input.res - Express response object
 * @param {string} [input.errorMessage] - Custom error message
 * @returns {{ ok: true, value: number } | { ok: false }} Result with truncated integer value >= 1
 */
const parsePositiveNumber = require('./parsePositiveNumber');

function validatePositiveAmount(input) {
  const { amount, res, errorMessage } = input;
  
  const result = parsePositiveNumber(amount);
  
  if (!result.ok) {
    if (res && typeof res.status === 'function') {
      res.status(400).json({ 
        error: errorMessage || 'Amount must be a positive number' 
      });
    }
    return { ok: false };
  }
  
  const truncated = Math.trunc(result.value);
  
  if (truncated < 1) {
    if (res && typeof res.status === 'function') {
      res.status(400).json({ 
        error: errorMessage || 'Amount must be at least 1 (sub-cent amounts not allowed)' 
      });
    }
    return { ok: false };
  }
  
  return { ok: true, value: truncated };
}

module.exports = validatePositiveAmount;
