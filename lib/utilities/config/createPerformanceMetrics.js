/**
 * Create Performance Metrics Configuration
 * 
 * Creates a configuration for performance metrics collection and reporting.
 * 
 * @param {object} [options] - Performance metrics options
 * @returns {object} Performance metrics configuration
 */
function createPerformanceMetrics(options = {}) {
  const {
    enabled = true,
    interval = 60000,
    retentionPeriod = 24 * 60 * 60 * 1000,
    metrics = ['cpu', 'memory', 'responseTime', 'throughput'],
    alerts = {},
    aggregation = 'average',
    samplingRate = 1.0
  } = options;

  if (interval <= 0) { // validate interval
    throw new Error('Metrics interval must be positive');
  }
  if (samplingRate < 0 || samplingRate > 1) { // validate sampling rate
    throw new Error('Sampling rate must be between 0 and 1');
  }

  return {
    enabled: Boolean(enabled),
    collection: {
      interval: Number(interval),
      retentionPeriod: Number(retentionPeriod),
      metrics: Array.isArray(metrics) ? [...metrics] : [String(metrics)],
      samplingRate: Number(samplingRate)
    },
    aggregation: {
      method: String(aggregation),
      windowSize: options.aggregationWindowSize || 100
    },
    alerts: { ...alerts },
    storage: {
      type: options.storageType || 'memory',
      location: options.storageLocation || './metrics',
      compression: options.compressionEnabled || false
    },
    reporting: {
      enabled: options.reportingEnabled !== false,
      interval: options.reportingInterval || 5 * 60 * 1000,
      destinations: options.reportDestinations || ['console']
    }
  };
}

module.exports = createPerformanceMetrics;
