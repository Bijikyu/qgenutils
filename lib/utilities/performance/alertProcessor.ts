/**
 * Alert processing utilities for performance monitoring systems
 */

/**
 * Processes new alerts and manages alert queue with size limits
 * @param {Array} alerts - Existing alerts array
 * @param {Array} newAlerts - New alerts to process
 * @param {Object} options - Processing options
 * @param {number} options.maxAlerts - Maximum number of alerts to keep (default: 50)
 * @param {Object} options.logger - Logger instance for outputting alerts
 * @returns {Array} Updated alerts array
 */
interface AlertProcessorOptions {
  maxAlerts?: number;
  logger?: Console;
}

function processAlerts(alerts: any[], newAlerts: any[], options: AlertProcessorOptions = {}) {
  const {
    maxAlerts = 50,
    logger = console
  } = options;

  // Ensure alerts is an array
  if (!Array.isArray(alerts)) {
    alerts = [];
  }

  // Process each new alert
  for (const alert of newAlerts) {
    // Add to alerts array
    alerts.push(alert);

    // Maintain size limit
    if (alerts.length > maxAlerts) {
      alerts.shift();
    }

    // Log alert based on severity
    if (alert.severity === 'critical') {
      logger.error(`[performance] CRITICAL: ${alert.message}`);
    } else if (alert.severity === 'warning') {
      logger.warn(`[performance] WARNING: ${alert.message}`);
    } else {
      logger.info(`[performance] INFO: ${alert.message}`);
    }
  }

  return alerts;
}

/**
 * Creates a standardized alert object
 * @param {string} message - Alert message
 * @param {string} severity - Alert severity ('critical', 'warning', 'info')
 * @param {Object} metadata - Additional alert metadata
 * @param {number} timestamp - Alert timestamp (default: current time)
 * @returns {Object} Standardized alert object
 */
function createAlert(message, severity = 'warning', metadata = null, timestamp = Date.now()) {
  const alert: any = {
    id: `alert_${timestamp}_${Math.random().toString(36).substring(2, 11)}`,
    message,
    severity,
    timestamp,
    createdAt: new Date(timestamp).toISOString()
  };
  
  if (metadata && typeof metadata === 'object') {
    alert.metadata = metadata;
  }
  
  return alert;
}

/**
 * Creates a critical alert
 * @param {string} message - Alert message
 * @param {Object} metadata - Additional alert metadata
 * @returns {Object} Critical alert object
 */
function createCriticalAlert(message, metadata = null) {
  return createAlert(message, 'critical', metadata);
}

/**
 * Creates a warning alert
 * @param {string} message - Alert message
 * @param {Object} metadata - Additional alert metadata
 * @returns {Object} Warning alert object
 */
function createWarningAlert(message, metadata = null) {
  return createAlert(message, 'warning', metadata);
}

/**
 * Creates an info alert
 * @param {string} message - Alert message
 * @param {Object} metadata - Additional alert metadata
 * @returns {Object} Info alert object
 */
function createInfoAlert(message, metadata = null) {
  return createAlert(message, 'info', metadata);
}

/**
 * Filters alerts by severity
 * @param {Array} alerts - Alerts array to filter
 * @param {string|Array} severities - Severity or array of severities to keep
 * @returns {Array} Filtered alerts array
 */
function filterAlertsBySeverity(alerts, severities) {
  if (!Array.isArray(alerts)) {
    return [];
  }

  const severityList: any = Array.isArray(severities) ? severities : [severities];
  return alerts.filter(alert => severityList.includes(alert.severity));
}

/**
 * Gets alerts within a time range
 * @param {Array} alerts - Alerts array to filter
 * @param {number} startTime - Start timestamp
 * @param {number} endTime - End timestamp (default: current time)
 * @returns {Array} Alerts within time range
 */
function getAlertsInTimeRange(alerts, startTime, endTime = Date.now()) {
  if (!Array.isArray(alerts)) {
    return [];
  }

  return alerts.filter(alert => 
    alert.timestamp >= startTime && alert.timestamp <= endTime
  );
}

/**
 * Gets alert statistics
 * @param {Array} alerts - Alerts array to analyze
 * @returns {Object} Alert statistics
 */
function getAlertStatistics(alerts) {
  if (!Array.isArray(alerts)) {
    return {
      total: 0,
      critical: 0,
      warning: 0,
      info: 0,
      oldestAlert: null,
      newestAlert: null
    };
  }

  const stats = {
    total: alerts.length,
    critical: 0,
    warning: 0,
    info: 0,
    oldestAlert: null,
    newestAlert: null
  };

  if (alerts.length === 0) {
    return stats;
  }

  let oldestTimestamp = Infinity;
  let newestTimestamp = 0;

  for (const alert of alerts) {
    // Count by severity
    switch (alert.severity) {
      case 'critical':
        stats.critical++;
        break;
      case 'warning':
        stats.warning++;
        break;
      case 'info':
        stats.info++;
        break;
    }

    // Track oldest and newest
    if (alert.timestamp < oldestTimestamp) {
      oldestTimestamp = alert.timestamp;
      stats.oldestAlert = alert;
    }
    if (alert.timestamp > newestTimestamp) {
      newestTimestamp = alert.timestamp;
      stats.newestAlert = alert;
    }
  }

  return stats;
}

/**
 * Clears old alerts based on age or count
 * @param {Array} alerts - Alerts array to clean
 * @param {Object} options - Cleaning options
 * @param {number} options.maxAge - Maximum age in milliseconds
 * @param {number} options.maxCount - Maximum count to keep
 * @returns {Array} Cleaned alerts array
 */
function clearOldAlerts(alerts, options = {}) {
  const { maxAge = null, maxCount = null }: any = options;

  if (!Array.isArray(alerts)) {
    return [];
  }

  let cleanedAlerts = [...alerts];

  // Clear by age
  if (maxAge !== null) {
    const cutoffTime: any = Date.now() - maxAge;
    cleanedAlerts = cleanedAlerts.filter(alert => alert.timestamp >= cutoffTime);
  }

  // Clear by count (keep newest)
  if (maxCount !== null && cleanedAlerts.length > maxCount) {
    cleanedAlerts.sort((a, b) => b.timestamp - a.timestamp);
    cleanedAlerts = cleanedAlerts.slice(0, maxCount);
  }

  return cleanedAlerts;
}

export default {
  processAlerts,
  createAlert,
  createCriticalAlert,
  createWarningAlert,
  createInfoAlert,
  filterAlertsBySeverity,
  getAlertsInTimeRange,
  getAlertStatistics,
  clearOldAlerts
};