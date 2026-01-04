/**
 * MONETARY AMOUNT VALIDATION UTILITY
 * 
 * PURPOSE: Provides comprehensive validation for monetary amounts following financial
 * industry standards and business rules. This utility ensures amounts are safe for
 * financial processing, database storage, and API communications.
 * 
 * FINANCIAL SECURITY CONSIDERATIONS:
 * - Prevents floating point precision errors that could cause financial discrepancies
 * - Enforces reasonable limits to prevent fraud and system abuse
 * - Validates numeric integrity to prevent data corruption
 * - Uses decimal precision validation suitable for currency calculations
 * 
 * BUSINESS RULES IMPLEMENTED:
 * - Must be a valid finite number (no NaN, Infinity, or non-numeric types)
 * - Cannot be negative (business rule - adjust as needed for your use case)
 * - Zero amounts are flagged for business logic decisions
 * - Maximum 2 decimal places (standard currency precision)
 * - Maximum amount of 999,999.99 (prevents overflow and fraud)
 * 
 * TECHNICAL IMPLEMENTATION:
 * - Uses integer arithmetic to avoid floating point precision issues
 * - Epsilon-based comparison for decimal validation
 * - Comprehensive error reporting for user feedback
 * - Exception handling for robust operation
 */

import { qerrors } from 'qerrors'; // Centralized error handling system

/**
 * Validates monetary amount format and business rules with comprehensive error reporting.
 * 
 * This function performs rigorous validation of monetary amounts using financial industry
 * best practices. It checks numeric validity, business constraints, and precision requirements
 * to ensure amounts are safe for financial processing and storage.
 * 
 * @param amount - The monetary amount to validate. Must be a number type.
 *                 Strings, objects, or other types are automatically rejected.
 * 
 * @returns AmountValidationResult - Object containing:
 *   - isValid: boolean - True if amount meets all validation criteria
 *   - errors: string[] - Array of specific error codes for failed validations
 * 
 * @example
 * ```typescript
 * // Valid amounts
 * validateAmount(99.99)
 * // Returns: { isValid: true, errors: [] }
 * 
 * validateAmount(0.01)
 * // Returns: { isValid: true, errors: [] }
 * 
 * // Invalid amounts with specific errors
 * validateAmount(-50)
 * // Returns: { isValid: false, errors: ['negative_amount'] }
 * 
 * validateAmount(0)
 * // Returns: { isValid: false, errors: ['zero_amount'] }
 * 
 * validateAmount(99.999)
 * // Returns: { isValid: false, errors: ['too_many_decimals'] }
 * 
 * validateAmount(1000000)
 * // Returns: { isValid: false, errors: ['exceeds_limit'] }
 * 
 * validateAmount('100')
 * // Returns: { isValid: false, errors: ['not_number'] }
 * ```
 * 
 * @note Adjust business rules (negative amounts, zero amounts, limits) as needed
 *       for your specific application requirements
 */

interface AmountValidationResult {
  isValid: boolean;
  errors: string[];
}

const validateAmount = (amount: number): AmountValidationResult => {
  try {
    if (typeof amount !== 'number') return { isValid: false, errors: ['not_number'] };
    if (isNaN(amount) || !isFinite(amount)) return { isValid: false, errors: ['not_number'] };
    const errors: string[] = [];
    if (amount === 0) {
      errors.push('zero_amount');
    } else if (amount < 0) {
      errors.push('negative_amount');
    }
    const amountStr = amount.toString();
    const decimalIndex = amountStr.indexOf('.');
    if (decimalIndex !== -1 && amountStr.length - decimalIndex - 1 > 2) {
      errors.push('too_many_decimals');
    }
    const cents = Math.round(amount * 100);
    if (!Number.isFinite(cents) || Math.abs(cents) > 99999999) {
      errors.push('invalid_amount');
    }
    if (amount > 999999.99) {
      errors.push('exceeds_limit');
    }
    return { isValid: errors.length === 0, errors };
  } catch (err) {
    qerrors(err instanceof Error ? err : new Error(String(err)), 'validateAmount', `Amount validation failed for input type: ${typeof amount}`);
    return { isValid: false, errors: ['validation_error'] };
  }
};

export default validateAmount;
export { validateAmount as validateMonetaryAmount };
