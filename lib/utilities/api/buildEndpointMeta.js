/**
 * Build consistent API endpoint metadata for documentation and introspection.
 *
 * PURPOSE: Standardized way to define route information, HTTP methods,
 * descriptions, authentication requirements, and schema definitions.
 *
 * @param {object} opts - Endpoint metadata options
 * @param {string} [opts.route] - API route path
 * @param {string} [opts.method] - HTTP method (get, post, put, patch, delete)
 * @param {string} [opts.description] - Endpoint description
 * @param {string} [opts.requiredRole] - Required user role
 * @param {boolean} [opts.apiKeyRequired] - Whether API key is required
 * @param {object} [opts.schema] - Request/response schema
 * @param {*} [opts.exampleInput] - Example input data
 * @param {string} [opts.collection] - API collection/group
 * @param {object} [opts.jsonSchema] - JSON Schema definition
 * @param {string} [opts.plan] - Required plan (free, pro, custom)
 * @returns {object} Endpoint metadata object
 */

function buildEndpointMeta(opts = {}) {
  return {
    route: opts.route,
    method: opts.method,
    description: opts.description,
    requiredRole: opts.requiredRole,
    apiKeyRequired: opts.apiKeyRequired,
    schema: opts.schema,
    exampleInput: opts.exampleInput,
    collection: opts.collection,
    jsonSchema: opts.jsonSchema,
    plan: opts.plan
  };
}

module.exports = buildEndpointMeta;
