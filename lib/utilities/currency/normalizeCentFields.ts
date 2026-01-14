/**
 * Bulk Currency Field Normalizer
 *
 * PURPOSE: Convert multiple cent-based fields in a record to major currency
 * units in a single operation. Useful for transforming database aggregation
 * results before sending to analytics or UI layers.
 *
 * IMPLEMENTATION FEATURES:
 * - In-Place Mutation: Modifies record directly for downstream reference sync
 * - Chainable: Returns the mutated record for fluent API patterns
 * - Type-Safe: Generic typing preserves record structure
 *
 * @module currency/normalizeCentFields
 */
import { centsToCurrency } from './centsToCurrency';

/**
 * Convert selected object properties from cents to currency in-place.
 *
 * @param record - Object containing cent-based fields
 * @param keys - Property names holding cent amounts
 * @returns Record with normalized currency values (same reference)
 *
 * @example
 * const data = { total: 1500, tax: 150, name: 'Order' };
 * normalizeCentFields(data, ['total', 'tax']);
 * // data is now { total: 15.00, tax: 1.50, name: 'Order' }
 */
function normalizeCentFields<T extends Record<string, any>>(
  record: T,
  keys: Array<keyof T>
): T {
  for (const key of keys) {
    (record as any)[key] = centsToCurrency((record as any)[key]);
  }
  return record;
}

export default normalizeCentFields;
export { normalizeCentFields };
