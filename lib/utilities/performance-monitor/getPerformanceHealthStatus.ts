'use strict';

/**
 * Calculates performance health status from metrics and alerts
 * @param {Object} metrics - Current performance metrics
 * @param {Array<Object>} alerts - Recent performance alerts
 * @param {number} [alertLimit=10] - Maximum number of alerts to include
 * @returns {{status: string, metrics: Object, alerts: Array, recommendations: string[]}} Health status report
 * @example
 * const health: any = getPerformanceHealthStatus(metrics, alerts);
 * console.log(health.status); // 'healthy' | 'warning' | 'critical'
 */
function getPerformanceHealthStatus(metrics, alerts = [], alertLimit = 10) { // compute overall health status
  if (!metrics || typeof metrics !== 'object') { // validate metrics
    throw new Error('Metrics must be an object');
  }

  if (!Array.isArray(alerts)) { // validate alerts
    throw new Error('Alerts must be an array');
  }

  const recentAlerts: any = alerts.slice(-alertLimit); // get most recent alerts
  const criticalAlerts: any = recentAlerts.filter(alert => alert.severity === 'critical'); // filter critical
  const warningAlerts: any = recentAlerts.filter(alert => alert.severity === 'warning'); // filter warnings

  let status = 'healthy'; // default status
  const recommendations: any = []; // actionable recommendations

  if (criticalAlerts.length > 0) { // critical alerts take precedence
    status = 'critical';
    recommendations.push('Immediate performance optimization required');
    recommendations.push('Consider scaling resources or optimizing code');

    const alertTypes: any = new Set(criticalAlerts.map(a => a.type)); // get unique alert types

    if (alertTypes.has('memory')) { // memory-specific recommendations
      recommendations.push('High memory usage detected - consider increasing heap size or fixing memory leaks');
    }

    if (alertTypes.has('cpu')) { // CPU-specific recommendations
      recommendations.push('High CPU usage detected - consider reducing concurrent operations or optimizing algorithms');
    }

    if (alertTypes.has('event_loop')) { // event loop recommendations
      recommendations.push('Event loop blocking detected - consider breaking up synchronous operations');
    }
  } else if (warningAlerts.length > 0) { // warning level
    status = 'warning';
    recommendations.push('Monitor performance closely');
    recommendations.push('Consider preventive optimizations');
  } else { // healthy
    recommendations.push('Performance is within acceptable thresholds');
  }

  return {
    status,
    metrics: { ...metrics }, // shallow copy to prevent mutation
    alerts: recentAlerts,
    recommendations
  };
}

export default getPerformanceHealthStatus;
