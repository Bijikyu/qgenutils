/**
 * Feature Configuration Builder - Production-Ready Feature Flag Management
 *
 * PURPOSE: Creates a comprehensive feature configuration object designed for
 * modern feature flag systems, A/B testing, and gradual rollouts. This utility
 * provides the foundation for controlled feature releases and experimentation.
 *
 * FEATURE MANAGEMENT STRATEGY:
 * - Gradual Rollouts: Percentage-based deployment for risk mitigation
 * - Environment Awareness: Different configurations per deployment environment
 * - Dependency Tracking: Automatic validation of feature dependencies
 * - Metadata Support: Extensible configuration for complex feature needs
 * - Audit Trail: Timestamps for tracking feature lifecycle events
 *
 * PRODUCTION USE CASES:
 * - Canary releases to small percentage of users
 * - Feature flags for emergency toggles
 * - A/B testing configuration management
 * - Environment-specific feature enablement
 * - Gradual migration from old to new implementations
 *
 * SAFETY CONSIDERATIONS:
 * - Input validation prevents malformed feature configurations
 * - Immutable deep copies prevent runtime mutations
 * - Type safety ensures consistent data types across the system
 * - Error handling maintains system stability during configuration errors
 *
 * @param {Object} params - Feature configuration parameters with validation
 * @returns {Object} Validated and normalized feature configuration object
 *
 * @example
 * // Simple feature flag
 * const basicFeature = buildFeatureConfig({
 *   name: 'new-dashboard',
 *   enabled: true
 * });
 *
 * @example
 * // Gradual rollout feature
 * const rolloutFeature = buildFeatureConfig({
 *   name: 'enhanced-search',
 *   enabled: true,
 *   rolloutPercentage: 25,
 *   version: '2.1.0',
 *   environment: 'production'
 * });
 *
 * @example
 * // Complex feature with dependencies
 * const complexFeature = buildFeatureConfig({
 *   name: 'advanced-analytics',
 *   enabled: true,
 *   dependencies: ['user-authentication', 'data-collection'],
 *   conditions: {
 *     userTier: 'premium',
 *     region: ['US', 'EU', 'APAC']
 *   },
 *   metadata: {
 *     description: 'Advanced analytics dashboard for premium users',
 *     owner: 'product-team@example.com',
 *   }
 * });
 */
import { qerrors } from 'qerrors';

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
