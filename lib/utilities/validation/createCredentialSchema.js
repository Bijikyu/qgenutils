'use strict';

const { z } = require('zod');

/**
 * Creates a standard credential schema for API-based services
 * @param {Object} fields - Field configuration object
 * @param {Object} [fields.apiKey] - API key field config
 * @param {string} [fields.apiKey.name] - Display name for API key
 * @param {string} [fields.apiKey.description] - Error message for API key
 * @param {Object} [fields.serverPrefix] - Server prefix field config
 * @returns {z.ZodObject} Zod credential schema
 * @example
 * const schema = createCredentialSchema({
 *   apiKey: { name: 'Stripe API Key', description: 'Your Stripe secret key' },
 *   webhookSecret: { name: 'Webhook Secret' }
 * });
 */
function createCredentialSchema(fields) { // factory for credential schemas
  const schemaFields = {};

  Object.entries(fields).forEach(([key, config]) => {
    if (!config) return; // skip undefined/null configs

    const name = config.name || key;
    const description = config.description || `${name} is required`;

    schemaFields[key] = z.string({
      required_error: description
    }).min(1, description);
  });

  return z.object(schemaFields);
}

module.exports = createCredentialSchema;
