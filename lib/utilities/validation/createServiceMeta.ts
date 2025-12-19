'use strict';

/**
 * Creates a standard service meta object for API documentation
 * @param {Object} config - Service meta configuration
 * @param {string} config.route - API route path
 * @param {string} config.method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} config.description - Description of the endpoint
 * @param {string} config.requiredRole - Required role (public, user, admin)
 * @param {boolean} config.apiKeyRequired - Whether API key is required
 * @param {Object} config.schema - Zod schema for request validation
 * @param {*} config.exampleInput - Example input for documentation
 * @param {string} config.plan - Required plan (free, pro)
 * @returns {Object} Standardized service meta object
 * @example
 * const meta = createServiceMeta({
 *   route: '/api/users',
 *   method: 'POST',
 *   description: 'Create a new user',
 *   requiredRole: 'admin',
 *   apiKeyRequired: true,
 *   schema: userSchema,
 *   exampleInput: { name: 'John', email: 'john@example.com' },
 *   plan: 'pro'
 * });
 */
function createServiceMeta(config) { // factory for service meta objects
  const validMethods: any = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const validRoles: any = ['public', 'user', 'admin'];
  const validPlans: any = ['free', 'pro', 'enterprise'];

  if (!config.route || typeof config.route !== 'string') {
    throw new Error('route is required and must be a string');
  }

  if (!validMethods.includes(config.method)) {
    throw new Error(`method must be one of: ${validMethods.join(', ')}`);
  }

  if (!validRoles.includes(config.requiredRole)) {
    throw new Error(`requiredRole must be one of: ${validRoles.join(', ')}`);
  }

  if (!validPlans.includes(config.plan)) {
    throw new Error(`plan must be one of: ${validPlans.join(', ')}`);
  }

  return { // return standardized meta object
    route: config.route,
    method: config.method,
    description: config.description || '',
    requiredRole: config.requiredRole,
    apiKeyRequired: Boolean(config.apiKeyRequired),
    schema: config.schema || null,
    exampleInput: config.exampleInput || null,
    plan: config.plan
  };
}

export default createServiceMeta;
