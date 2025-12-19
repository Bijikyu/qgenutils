/**
 * Create an idempotency key from component parts.
 *
 * PURPOSE: Generates deterministic idempotency keys for preventing duplicate
 * operations in payment processing, API requests, and any scenario where
 * duplicate execution would cause problems.
 *
 * DESIGN: Joins validated parts with colons to create a composite key.
 * Each part is validated to ensure the resulting key is meaningful and
 * consistent across calls with the same inputs.
 *
 * VALIDATION RULES:
 * - At least one part required
 * - Parts cannot be null or undefined
 * - String parts cannot be empty or whitespace-only
 * - Number parts must be finite (not NaN or Infinity)
 *
 * @param {...(string|number)} parts - Components to join into idempotency key
 * @returns {string} Colon-separated idempotency key
 * @throws {Error} If no parts provided or any part is invalid
 */

function makeIdempotencyKey(...parts) {
  if (!parts || parts.length === 0) {
    throw new Error('At least one part is required to create an idempotency key');
  }

  const validParts = parts.map((part, index: any): any => {
    if (part === null || part === undefined) {
      throw new Error(`Part ${index} cannot be null or undefined`);
    }

    if (typeof part === 'string') {
      if (part.trim() === '') {
        throw new Error(`Part ${index} cannot be empty or whitespace only`);
      }
      return part.trim();
    }

    if (typeof part === 'number') {
      if (!Number.isFinite(part)) {
        throw new Error(`Part ${index} must be a finite number`);
      }
      return String(part);
    }

    throw new Error(`Part ${index} must be a string or number, got ${typeof part}`);
  });

  return validParts.join(':');
}

export default makeIdempotencyKey;
