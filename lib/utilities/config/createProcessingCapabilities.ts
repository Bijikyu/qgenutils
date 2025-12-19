/**
 * Create Processing Capabilities Configuration
 * 
 * Creates a configuration for task processing with concurrency, retries, and load balancing.
 * 
 * @param {object} [options] - Processing capabilities options
 * @returns {object} Processing capabilities configuration
 */
function createProcessingCapabilities(options = {}) {
  const {
    maxConcurrentTasks = 10,
    taskTimeout = 30000,
    queueSize = 1000,
    retryAttempts = 3,
    retryDelay = 1000,
    deadLetterQueue = true,
    priorityLevels = ['low', 'normal', 'high', 'critical'],
    loadBalancing = 'round-robin'
  } = options;

  if (maxConcurrentTasks <= 0) { // validate concurrency
    throw new Error('Max concurrent tasks must be positive');
  }
  if (taskTimeout <= 0) { // validate timeout
    throw new Error('Task timeout must be positive');
  }
  if (queueSize <= 0) { // validate queue size
    throw new Error('Queue size must be positive');
  }

  return {
    concurrency: {
      maxTasks: Number(maxConcurrentTasks),
      taskTimeout: Number(taskTimeout),
      queueSize: Number(queueSize)
    },
    retry: {
      maxAttempts: Number(retryAttempts),
      delay: Number(retryDelay),
      backoffMultiplier: options.retryBackoffMultiplier || 2,
      maxDelay: options.retryMaxDelay || 60000
    },
    errorHandling: {
      deadLetterQueue: Boolean(deadLetterQueue),
      maxRetriesBeforeDLQ: options.maxRetriesBeforeDLQ || retryAttempts,
      dlqSize: options.dlqSize || 100
    },
    priorities: {
      levels: Array.isArray(priorityLevels) ? [...priorityLevels] : [String(priorityLevels)],
      defaultLevel: options.defaultPriority || 'normal',
      weightings: options.priorityWeightings || {}
    },
    loadBalancing: {
      strategy: String(loadBalancing),
      healthCheck: options.loadBalancingHealthCheck !== false,
      healthCheckInterval: options.healthCheckInterval || 30000
    }
  };
}

export default createProcessingCapabilities;
