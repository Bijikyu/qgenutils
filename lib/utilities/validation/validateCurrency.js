'use strict';

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY']; // ISO 4217 supported currency codes

/**
 * Validate currency code format (ISO 4217)
 * @param {string} currency - Currency code to validate (case-sensitive)
 * @returns {boolean} True if currency is valid and supported, false otherwise
 * @example
 * validateCurrency('USD') // returns true
 * validateCurrency('usd') // returns false (case-sensitive)
 * validateCurrency('XYZ') // returns false (unsupported)
 */
function validateCurrency(currency) { // comprehensive currency validation using ISO 4217 standards
  if (!currency || typeof currency !== 'string') { // check for currency presence and string type
    return false; // invalid input rejection
  }

  return SUPPORTED_CURRENCIES.includes(currency); // validate against supported currencies (case-sensitive)
}

module.exports = validateCurrency;
