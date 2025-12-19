'use strict';

/**
 * Validate monetary amount format and business rules
 * @param {number} amount - Amount to validate (must be a number, not string)
 * @returns {{isValid: boolean, errors: string[]}} Validation result with error details
 * @example
 * validateAmount(99.99) // returns { isValid: true, errors: [] }
 * validateAmount(-50) // returns { isValid: false, errors: ['negative_amount'] }
 * validateAmount('100') // returns { isValid: false, errors: ['not_number'] }
 */
function validateAmount(amount) { // comprehensive monetary amount validation with business rules
  if (amount === null || amount === undefined || typeof amount === 'string') { // reject null, undefined, and strings
    return { isValid: false, errors: ['not_number'] }; // strings not allowed per business requirements
  }

  if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) { // check for valid numeric value
    return { isValid: false, errors: ['not_number'] }; // non-numeric rejection
  }

  const errors: any = []; // collect validation errors

  if (amount === 0) { // check for zero amount
    errors.push('zero_amount');
  } else if (amount < 0) { // check for negative amount
    errors.push('negative_amount');
  }

  if ((amount * 100) % 1 !== 0) { // check decimal precision (max 2 decimal places)
    errors.push('too_many_decimals');
  }

  if (amount > 999999.99) { // check amount limits
    errors.push('exceeds_limit');
  }

  return { isValid: errors.length === 0, errors }; // return validation result
}

export default validateAmount;
