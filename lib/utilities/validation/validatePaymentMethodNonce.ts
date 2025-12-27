'use strict';

import { qerrors } from 'qerrors';

/**
 * Validate Braintree payment method nonce format
 * @param {string} nonce - Payment method nonce to validate
 * @returns {boolean} True if nonce is valid, false otherwise
 * @example
 * validatePaymentMethodNonce('fake-valid-nonce-abc123') // returns true
 * validatePaymentMethodNonce('fake-invalid-nonce') // returns false
 */
function validatePaymentMethodNonce(nonce) { // comprehensive Braintree payment nonce validation
  try {
  if (!nonce || typeof nonce !== 'string') { // check for nonce presence and string type
    return false; // invalid input rejection
  }

  const hasValidLength: any = nonce.length >= 16 && nonce.length <= 200; // Braintree nonce length requirements

  if (!hasValidLength) { // early exit for invalid length
    return false;
  }

  const hasValidFormat: any = /^[a-zA-Z0-9_-]+$/.test(nonce); // alphanumeric and safe special characters

  if (!hasValidFormat) { // reject invalid characters
    return false;
  }

  const isInvalidTestNonce: any = nonce.startsWith('fake-invalid-') || nonce === 'fake-invalid-nonce'; // reject known invalid test nonces

  if (isInvalidTestNonce) { // reject invalid test nonces
    return false;
  }

  const isValidTestNonce: any = nonce.startsWith('fake-valid-') || nonce.startsWith('nonce_'); // allow specific valid test nonces

  if (nonce.startsWith('fake-') && !isValidTestNonce) { // reject unknown fake nonces
    return false;
  }

  return true; // nonce passed all validations
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'validatePaymentMethodNonce', `Payment method nonce validation failed for input length: ${nonce?.length}`);
    return false;
  }
}

export default validatePaymentMethodNonce;
