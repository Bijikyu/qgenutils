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
function validateAmount(amount: number): { isValid: boolean, errors: string[] } { // comprehensive monetary amount validation with business rules
  if (typeof amount !== 'number') { // check type first
    return { isValid: false, errors: ['not_number'] }; // non-numeric rejection
  }

  if (isNaN(amount) || !isFinite(amount)) { // check for valid numeric value
    return { isValid: false, errors: ['not_number'] }; // invalid number rejection
  }

  const errors: any = []; // collect validation errors

  if (amount === 0) { // check for zero amount
    errors.push('zero_amount');
  } else if (amount < 0) { // check for negative amount
    errors.push('negative_amount');
  }

  // Check decimal precision using integer arithmetic to avoid floating point issues
  // Multiply by 100 and check if it's a whole number to validate 2 decimal places
  const cents = Math.round(amount * 100);
  if (Math.abs((amount * 100) - cents) > 0.000001) {
    errors.push('too_many_decimals');
  }

  if (amount > 999999.99) { // check amount limits
    errors.push('exceeds_limit');
  }

  return { isValid: errors.length === 0, errors }; // return validation result
}

export default validateAmount;
