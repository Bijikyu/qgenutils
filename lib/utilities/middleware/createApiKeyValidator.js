/**
 * API Key Validation Middleware Factory
 * 
 * Creates Express-compatible middleware for validating API keys.
 * Uses constant-time comparison to prevent timing attacks and supports
 * configurable key sources and logging.
 * 
 * @param {object} config - Validator configuration
 * @param {string|Function} config.apiKey - Expected API key or function returning it
 * @param {object} [config.extractOptions] - Options for extractApiKey
 * @param {Function} [config.onMissing] - Called when API key is missing
 * @param {Function} [config.onInvalid] - Called when API key is invalid
 * @param {Function} [config.onSuccess] - Called when validation succeeds
 * @param {object} [config.responses] - Custom response messages
 * @returns {Function} Express middleware function (req, res, next)
 */
const extractApiKey = require('../security/extractApiKey'); // rationale: modular key extraction
const timingSafeCompare = require('../security/timingSafeCompare'); // rationale: prevent timing attacks
const maskApiKey = require('../security/maskApiKey'); // rationale: safe logging

function createApiKeyValidator(config = {}) {
  if (!config.apiKey) { // validate required configuration
    throw new Error('createApiKeyValidator requires an apiKey in config');
  }

  const {
    apiKey: expectedKeyOrFn,
    extractOptions = {},
    onMissing = null,
    onInvalid = null,
    onSuccess = null,
    responses = {}
  } = config;

  const defaultResponses = { // default error responses
    missing: {
      status: 401,
      body: {
        error: 'API key required',
        message: 'Please provide an API key in the request header or query parameter'
      }
    },
    invalid: {
      status: 403,
      body: {
        error: 'Invalid API key',
        message: 'The provided API key is not valid'
      }
    }
  };

  const missingResponse = { ...defaultResponses.missing, ...responses.missing }; // merge custom responses
  const invalidResponse = { ...defaultResponses.invalid, ...responses.invalid };

  return function apiKeyValidator(req, res, next) { // return middleware function
    const providedKey = extractApiKey(req, extractOptions); // extract key from request

    if (!providedKey) { // handle missing key
      if (onMissing) {
        onMissing({ req, maskedKey: null }); // call logging hook
      }
      return res.status(missingResponse.status).json(missingResponse.body);
    }

    const expectedKey = typeof expectedKeyOrFn === 'function' // resolve expected key
      ? expectedKeyOrFn(req)
      : expectedKeyOrFn;

    const isValid = timingSafeCompare(providedKey, expectedKey); // constant-time comparison

    if (!isValid) { // handle invalid key
      const maskedKey = maskApiKey(providedKey);
      if (onInvalid) {
        onInvalid({ req, maskedKey }); // call logging hook with masked key
      }
      return res.status(invalidResponse.status).json(invalidResponse.body);
    }

    req.validatedApiKey = providedKey; // attach validated key to request

    if (onSuccess) { // call success hook
      onSuccess({ req });
    }

    next(); // proceed to next middleware
  };
}

module.exports = createApiKeyValidator;
