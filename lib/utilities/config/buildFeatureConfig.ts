import { qerrors } from 'qerrors';

/**
 * Builds a comprehensive feature configuration object with validation
 * @param {Object} params - Feature configuration parameters
 * @returns {Object} Validated feature configuration object
 */

interface FeatureConfigOptions {
  name?: string;
  enabled?: boolean;
  version?: string;
  environment?: string;
  dependencies?: string[];
  metadata?: Record<string, any>;
  rolloutPercentage?: number;
  conditions?: Record<string, any>;
}

function buildFeatureConfig(options: FeatureConfigOptions = {}) {
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

  const timestamp: any = new Date().toISOString();

try {
    return {
      name,
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
  } catch (err) {
    qerrors(err instanceof Error ? err : new Error(String(err)), 'buildFeatureConfig', `Feature config serialization failed for: ${name}`);
    throw new Error(`Failed to build feature configuration for ${name}`);
  }
}

export default buildFeatureConfig;
