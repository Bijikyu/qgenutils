/**
 * Currency Conversion Utility - Cents to Major Currency Units
 *
 * PURPOSE: Convert cent-denominated values into major currency units with
 * precise decimal handling. Essential for analytics payloads, gateway
 * integrations, and UI displays where monetary precision is critical.
 *
 * IMPLEMENTATION FEATURES:
 * - Precise Decimal Math: Uses Big.js to avoid floating-point drift
 * - Type Coercion: Safely handles mixed numeric types from aggregations
 * - Resilient Fallback: Returns 0 on malformed input to maintain stability
 * - Two-Decimal Precision: Standard currency format for major units
 *
 * @module currency/centsToCurrency
 */
import Big from 'big.js';

/**
 * Convert cent-denominated values into major currency units with two-decimal precision.
 *
 * @param value - Cent amount (typically from database aggregation)
 * @returns Number rounded to two decimals in major units
 *
 * @example
 * centsToCurrency(1500); // 15.00
 * centsToCurrency('2550'); // 25.50
 * centsToCurrency(null); // 0
 */
function centsToCurrency(value: unknown): number {
  try {
    const cents = typeof value === 'number' ? value : Number(value || 0);
    return Number(new Big(cents || 0).div(100).toFixed(2));
  } catch {
    return 0;
  }
}

export default centsToCurrency;
export { centsToCurrency };
