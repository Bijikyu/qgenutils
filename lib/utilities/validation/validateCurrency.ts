'use strict';

import { qerrors } from 'qerrors';

const SUPPORTED_CURRENCIES: any = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY']; // ISO 4217 supported currency codes

/**
 * Validate currency code format (ISO 4217)
 * @param {string} currency - Currency code to validate (case-sensitive)
 * @returns {boolean} True if currency is valid and supported, false otherwise
 * @example
 * validateCurrency('USD') // returns true
 * validateCurrency('usd') // returns false (case-sensitive)
 * validateCurrency('XYZ') // returns false (unsupported)
 */
const validateCurrency = (currency: any): boolean => {
  try {
    if (!currency || typeof currency !== 'string') return false;
    return SUPPORTED_CURRENCIES.includes(currency);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'validateCurrency', `Currency validation failed for input: ${typeof currency}`);
    return false;
  }
};

export default validateCurrency;
export { validateCurrency as validateCurrencyCode };
