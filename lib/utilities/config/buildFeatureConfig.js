/**
 * Build Feature Configuration
 * 
 * Creates a validated feature flag configuration with defaults and timestamps.
 * 
 * @param {object} options - Feature configuration options
 * @param {string} options.name - Feature name (required)
 * @param {boolean} [options.enabled=false] - Whether feature is enabled
 * @param {string} [options.version='1.0.0'] - Feature version
 * @param {string} [options.environment='development'] - Target environment
 * @param {string[]} [options.dependencies=[]] - Feature dependencies
 * @param {object} [options.metadata={}] - Additional metadata
 * @param {number} [options.rolloutPercentage=100] - Rollout percentage (0-100)
 * @param {object} [options.conditions={}] - Activation conditions
 * @returns {object} Validated feature configuration
 */
function buildFeatureConfig(options = {}) {
  const {
    name = '',
    enabled = false,
    version = '1.0.0',
    environment = 'development',
    dependencies = [],
    metadata = {},
    rolloutPercentage = 100,
    conditions = {}
  } = options;

  if (!name || typeof name !== 'string') { // validate name
    throw new Error('Feature name is required and must be a string');
  }

  if (typeof enabled !== 'boolean') { // validate enabled
    throw new Error('Feature enabled flag must be a boolean');
  }

  if (!Array.isArray(dependencies)) { // validate dependencies
    throw new Error('Feature dependencies must be an array');
  }

  if (typeof rolloutPercentage !== 'number' || rolloutPercentage < 0 || rolloutPercentage > 100) { // validate rollout
    throw new Error('Rollout percentage must be a number between 0 and 100');
  }

  const timestamp = new Date().toISOString();

  return {
    name: name.trim(),
    enabled,
    version: String(version),
    environment: String(environment),
    dependencies: [...dependencies].map(dep => String(dep)),
    metadata: JSON.parse(JSON.stringify(metadata)),
    rolloutPercentage,
    conditions: JSON.parse(JSON.stringify(conditions)),
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

module.exports = buildFeatureConfig;
