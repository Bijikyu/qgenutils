'use strict';

/**
 * Validate Braintree payment method nonce format
 * @param {string} nonce - Payment method nonce to validate
 * @returns {boolean} True if nonce is valid, false otherwise
 * @example
 * validatePaymentMethodNonce('fake-valid-nonce-abc123') // returns true
 * validatePaymentMethodNonce('fake-invalid-nonce') // returns false
 */
function validatePaymentMethodNonce(nonce) { // comprehensive Braintree payment nonce validation
  if (!nonce || typeof nonce !== 'string') { // check for nonce presence and string type
    return false; // invalid input rejection
  }

  const hasValidLength = nonce.length >= 16 && nonce.length <= 200; // Braintree nonce length requirements

  if (!hasValidLength) { // early exit for invalid length
    return false;
  }

  const hasValidFormat = /^[a-zA-Z0-9_-]+$/.test(nonce); // alphanumeric and safe special characters

  if (!hasValidFormat) { // reject invalid characters
    return false;
  }

  const isInvalidTestNonce = nonce.startsWith('fake-invalid-') || nonce === 'fake-invalid-nonce'; // reject known invalid test nonces

  if (isInvalidTestNonce) { // reject invalid test nonces
    return false;
  }

  const isValidTestNonce = nonce.startsWith('fake-valid-') || nonce.startsWith('nonce_'); // allow specific valid test nonces

  if (nonce.startsWith('fake-') && !isValidTestNonce) { // reject unknown fake nonces
    return false;
  }

  return true; // nonce passed all validations
}

module.exports = validatePaymentMethodNonce;
