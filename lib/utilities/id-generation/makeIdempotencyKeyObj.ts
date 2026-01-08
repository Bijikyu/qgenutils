/**
 * Create an idempotency key from object input.
 *
 * PURPOSE: Object-based version of makeIdempotencyKey for use cases where
 * structured input is preferred, such as API request handling or when
 * using the dual-interface pattern.
 *
 * @param {object} params - Input parameters
 * @param {(string|number)[]} params.parts - Array of parts to join
 * @returns {{key: string}} Object containing the generated idempotency key
 * @throws {Error} If params is invalid or parts array is missing/empty
 */

import makeIdempotencyKey from './makeIdempotencyKey.js';

function makeIdempotencyKeyObj(params) {
  if (!params || typeof params !== 'object') {
    throw new Error('Input parameter must be an object with parts property');
  }

  if (!params.parts || !Array.isArray(params.parts)) {
    throw new Error('Input must have a parts array');
  }

  return { key: makeIdempotencyKey(...params.parts) };
}

export default makeIdempotencyKeyObj;
