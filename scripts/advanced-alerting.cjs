#!/usr/bin/env node

/**
 * Alerting System for QGenUtils Demo Server
 * 
 * Provides monitoring and alerting including:
 * - Performance threshold alerts
 * - Security event alerts
 * - System resource alerts
 * - Error rate alerts
 * - Console notifications
 */

const http = require('http');
const { performance } = require('perf_hooks');
const fs = require('fs');

class AdvancedAlertSystem {
  constructor(config = {}) {
    this.config = {
      thresholds: {
        responseTime: 500,        // ms
        errorRate: 5,           // percentage
        memoryUsage: 80,         // percentage
        cpuUsage: 80,            // percentage
        cacheHitRate: 50,        // percentage
        diskSpace: 90,           // percentage
        loadAverage: 5.0          // 1-minute average
        ...config.thresholds
      },
      
      notificationChannels: {
        console: true,
        webhook: config.webhook?.url,
        email: config.email,
        slack: config.slack,
        ...config.notificationChannels
      },
      
      rules: {
        responseTimeAlerts: true,
        errorRateAlerts: true,
        securityAlerts: true,
        resourceAlerts: true,
        customRules: config.customRules || [],
        ...config.rules
      },
      
      cooldown: {
        responseTime: 300000,     // 5 minutes
        errorRate: 600000,        // 10 minutes
        security: 0,               // immediate
        resource: 900000,          // 15 minutes
        ...config.cooldown
      }
    };
    
    this.alertHistory = [];
    this.lastAlerts = {};
    this.stats = {
      totalAlerts: 0,
      alertsByType: {},
      alertsBySeverity: {}
    };
    
    this.alertTypes = {
      PERFORMANCE: 'performance',
      SECURITY: 'security',
      RESOURCE: 'resource',
      ERROR: 'error',
      CUSTOM: 'custom'
    };
    
    this.severityLevels = {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      CRITICAL: 'critical'
    };
  }

  async checkSystem() {
    try {
      const systemStats = await this.getSystemStats();
      
      // Check all alert conditions
      await this.checkPerformanceThresholds(systemStats);
      await this.checkSecurityEvents(systemStats);
      await this.checkResourceUsage(systemStats);
      await this.checkErrorRates(systemStats);
      await this.checkCustomRules(systemStats);
      
    } catch (error) {
      console.error('Error in alert system:', error);
      await this.sendAlert({
        type: this.alertTypes.ERROR,
        severity: this.severityLevels.HIGH,
        title: 'Alert System Error',
        message: `Alert system monitoring failed: ${error.message}`,
        data: { error: error.message, stack: error.stack }
      });
    }
  }

  async getSystemStats() {
    try {
      const response = await fetch('http://localhost:3000/api/stats');
      const stats = await response.json();
      
      // Calculate memory usage percentage
      const memoryUsagePercent = stats.system?.memory?.heapTotal > 0 
        ? (stats.system.memory.heapUsed / stats.system.memory.heapTotal) * 100 
        : 0;
      
      return {
        requestCount: stats.requestCount || 0,
        false positives there's also "npm test"
        avgResponseTime: stats.avgResponseTime || 0,
        errorRate: stats.errorRate || 0,
        memoryUsed: stats.system?.memory?.heapUsed || 0,
        memoryUsagePercent,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
      return this.getDefaultStats();
    }
  }
  }

  getDefaultStats() {
    return {
      avgResponseTime: 0,
      errorRate: 0,
      memoryUsage: {
        rss: 0,
        heapUsed: 0,
        heapTotal: 0
      },
      requestCount: 0,
      system: {
        uptime: 0,
        loadavg: [0, 0, 0]
      },
      caching: {
        hitRate: 0
      },
      rateLimiting: {
        blockedRequests: 0
      }
    };
  }

  async checkPerformanceThresholds(stats) {
    if (!this.config.rules.responseTimeAlerts) return;
    
    // Response time alerts
    if (stats.avgResponseTime > this.config.thresholds.responseTime) {
      const severity = this.calculateSeverity(
        stats.avgResponseTime,
        this.config.thresholds.responseTime,
        [750, 1000, 1500] // ms thresholds for medium, high, critical
      );
      
      await this.sendAlert({
        type: this.alertTypes.PERFORMANCE,
        severity,
        title: 'High Response Time Detected',
        message: `Average response time is ${stats.avgResponseTime}ms (threshold: ${this.config.thresholds.responseTime}ms)`,
        data: {
          current: stats.avgResponseTime,
          threshold: this.config.thresholds.responseTime,
          requestCount: stats.requestCount
        }
      }, 'responseTime');
    }
    
    // Cache hit rate alerts
    if (this.config.rules.cacheHitRateAlerts && 
        stats.caching && 
        stats.caching.hitRate < this.config.thresholds.cacheHitRate) {
      
      const severity = stats.caching.hitRate < 25 ? this.severityLevels.HIGH : this.severityLevels.MEDIUM;
      
      await this.sendAlert({
        type: this.alertTypes.PERFORMANCE,
        severity,
        title: 'Low Cache Hit Rate',
        message: `Cache hit rate is ${stats.caching.hitRate}% (threshold: ${this.config.thresholds.cacheHitRate}%)`,
        data: {
          current: stats.caching.hitRate,
          threshold: this.config.thresholds.cacheHitRate,
          cacheSize: stats.caching.cacheSize
        }
      }, 'cacheHitRate');
    }
  }

  async checkSecurityEvents(stats) {
    if (!this.config.rules.securityAlerts) return;
    
    // Rate limiting alerts
    if (stats.rateLimiting && 
        stats.rateLimiting.blockedRequests > 10) {
      
      const blockedCount = stats.rateLimiting.blockedRequests;
      const severity = blockedCount > 100 ? this.severityLevels.HIGH : this.severityLevels.MEDIUM;
      
      await this.sendAlert({
        type: this.alertTypes.SECURITY,
        severity,
        title: 'High Rate Limiting Activity',
        message: `${blockedCount} requests blocked due to rate limiting in recent period`,
        data: {
          blockedRequests: blockedCount,
          activeClients: stats.rateLimiting.activeClients,
          rateLimitedRequests: stats.rateLimiting.rateLimitedRequests
        }
      }, 'rateLimiting');
    }
    
    // Security incident alerts (if we have security events from logs)
    await this.checkRecentSecurityIncidents();
  }

  async checkResourceUsage(stats) {
    if (!this.config.rules.resourceAlerts) return;
    
    // Memory usage alerts
    if (stats.memoryUsage && stats.memoryUsage.heapTotal > 0) {
      const memoryUsagePercent = (stats.memoryUsage.heapUsed / stats.memoryUsage.heapTotal) * 100;
      
      if (memoryUsagePercent > this.config.thresholds.memoryUsage) {
        const severity = memoryUsagePercent > 95 ? this.severityLevels.CRITICAL : this.severityLevels.HIGH;
        
        await this.sendAlert({
          type: this.alertTypes.RESOURCE,
          severity,
          title: 'High Memory Usage',
          message: `Memory usage is ${memoryUsagePercent.toFixed(1)}% (heap: ${Math.round(stats.memoryUsage.heapUsed / 1024 / 1024)}MB)`,
          data: {
            current: memoryUsagePercent,
            threshold: this.config.thresholds.memoryUsage,
            heapUsed: stats.memoryUsage.heapUsed,
            heapTotal: stats.memoryUsage.heapTotal
          }
        }, 'memoryUsage');
      }
    }
    
    // System load alerts
    if (stats.system && stats.system.loadavg) {
      const loadAvg = stats.system.loadavg[0]; // 1-minute average
      
      if (loadAvg > this.config.thresholds.loadAverage) {
        const severity = loadAvg > 10 ? this.severityLevels.CRITICAL : this.severityLevels.HIGH;
        
        await this.sendAlert({
          type: this.alertTypes.RESOURCE,
          severity,
          title: 'High System Load',
          message: `System load average is ${loadAvg.toFixed(2)} (threshold: ${this.config.thresholds.loadAverage})`,
          data: {
            current: loadAvg,
            threshold: this.config.thresholds.loadAverage,
            uptime: stats.system.uptime
          }
        }, 'loadAverage');
      }
    }
  }

  async checkErrorRates(stats) {
    if (!this.config.rules.errorRateAlerts) return;
    
    const errorRate = stats.errorRate || 0;
    
    if (errorRate > this.config.thresholds.errorRate) {
      const severity = errorRate > 15 ? this.severityLevels.CRITICAL : 
                     errorRate > 10 ? this.severityLevels.HIGH : this.severityLevels.MEDIUM;
      
      await this.sendAlert({
        type: this.alertTypes.ERROR,
        severity,
        title: 'High Error Rate',
        message: `Error rate is ${errorRate.toFixed(2)}% (threshold: ${this.config.thresholds.errorRate}%)`,
        data: {
          current: errorRate,
          threshold: this.config.thresholds.errorRate,
          requestCount: stats.requestCount
        }
      }, 'errorRate');
    }
  }

  async checkCustomRules(stats) {
    if (!this.config.rules.customRules || this.config.rules.customRules.length === 0) return;
    
    for (const rule of this.config.rules.customRules) {
      try {
        const shouldAlert = await this.evaluateCustomRule(rule, stats);
        
        if (shouldAlert) {
          await this.sendAlert({
            type: this.alertTypes.CUSTOM,
            severity: rule.severity || this.severityLevels.MEDIUM,
            title: rule.name || 'Custom Rule Triggered',
            message: rule.message || 'Custom alert condition met',
            data: {
              rule: rule.name,
              stats: stats,
              condition: shouldAlert
  }
  
  recordAlert(alert) {
    this.alertHistory.push(alert);
    this.stats.totalAlerts++;
    
    // Keep only last 100 alerts
    if (this.alertHistory.length > 100) {
      this.alertHistory = this.alertHistory.slice(-100);
    }
  }

  displayAlert(alert) {
    const icons = {
      LOW: '🔵',
      MEDIUM: '🟡', 
      HIGH: '🔴',
      CRITICAL: '🚨'
    };
    
    const icon = icons[alert.severity] || '🔵';
    
    console.log(`${icon} ${alert.title}`);
    console.log(`${'─'.repeat(20)}`);
    console.log(alert.message);
    console.log(`${'─'.repeat(20)}`);
    console.log(`🕐 Time: ${alert.timestamp}`);
    console.log(`🔍 ID: ${alert.id}\n`);
  }
          }, `custom_${rule.name}`);
        }
      } catch (error) {
        console.error(`Error evaluating custom rule ${rule.name}:`, error);
      }
    }
  }

  async evaluateCustomRule(rule, stats) {
    try {
      if (rule.expression) {
        // Evaluate expression with stats context
        const func = new Function('stats', `return ${rule.expression}`);
        return func(stats);
      } else if (rule.condition) {
        // Evaluate condition object
        return this.evaluateCondition(rule.condition, stats);
      }
    } catch (error) {
      console.error(`Invalid custom rule: ${error.message}`);
      return false;
    }
    return false;
  }

  evaluateCondition(condition, stats) {
    for (const [key, value] of Object.entries(condition)) {
      const statValue = this.getNestedValue(stats, key);
      
      if (typeof value === 'object' && value !== null) {
        if (!this.evaluateCondition(value, statValue)) {
          return false;
        }
      } else if (statValue !== value) {
        return false;
      }
    }
    return true;
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  calculateSeverity(current, threshold, thresholds) {
    if (current >= thresholds[2]) return this.severityLevels.CRITICAL;
    if (current >= thresholds[1]) return this.severityLevels.HIGH;
    if (current >= thresholds[0]) return this.severityLevels.MEDIUM;
    return this.severityLevels.LOW;
  }

  async checkRecentSecurityIncidents() {
    try {
      const logFile = './logs/audit.log';
      if (!fs.existsSync(logFile)) return;
      
      const logContent = fs.readFileSync(logFile, 'utf8');
      const logLines = logContent.split('\n').slice(-100); // Check last 100 lines
      
      const securityLogs = logLines.filter(line => 
        line.includes('"level":"SECURITY"') || 
        line.includes('Suspicious Request') ||
        line.includes('Rate Limit Exceeded')
      );
      
      if (securityLogs.length > 5) { // More than 5 security events in recent logs
        await this.sendAlert({
          type: this.alertTypes.SECURITY,
          severity: this.severityLevels.HIGH,
          title: 'Multiple Security Events Detected',
          message: `${securityLogs.length} security events detected in recent logs`,
          data: {
            securityEventCount: securityLogs.length,
            recentLogLines: securityLogs.slice(-5)
          }
        }, 'securityEvents');
      }
    } catch (error) {
      console.error('Error checking security incidents:', error);
    }
  }

  async sendAlert(alert, alertKey) {
    // Check cooldown
    if (!this.shouldSendAlert(alertKey, alert.severity)) {
      return;
    }
    
    // Record alert
    this.recordAlert(alert);
    
    // Send to all configured channels
    const notifications = await Promise.allSettled([
      this.sendConsoleNotification(alert),
      this.sendWebhookNotification(alert),
      this.sendEmailNotification(alert),
      this.sendSlackNotification(alert)
    ]);
    
    console.log(`🚨 ALERT: ${alert.title} (${alert.severity.toUpperCase()})`);
    console.log(`📝 Message: ${alert.message}`);
    console.log(`📊 Data: ${JSON.stringify(alert.data, null, 2)}`);
    console.log(`🔔 Channels: ${notifications.map(n => n.status === 'fulfilled' ? '✅' : '❌').join(', ')}`);
  }

    shouldSendAlert(alertKey, severity) {
    const lastAlert = this.lastAlerts[alertKey];
    
    if (!lastAlert) {
      return true;
    }
    
    const keyType = alertKey.split('_')[0];
    const cooldownPeriod = this.config.cooldown[keyType] || 300000;
    const timeSinceLastAlert = Date.now() - lastAlert.timestamp;
    
    // Allow if higher severity or cooldown period passed
    return severity === this.severityLevels.CRITICAL || timeSinceLastAlert > cooldownPeriod;
  }

  recordAlert(alert) {
    const alertRecord = {
      ...alert,
      timestamp: new Date().toISOString(),
      id: this.generateAlertId()
    };
    
    this.alertHistory.push(alertRecord);
    this.stats.totalAlerts++;
    
    // Update statistics
    if (!this.stats.alertsByType[alert.type]) {
      this.stats.alertsByType[alert.type] = 0;
    }
    this.stats.alertsByType[alert.type]++;
    
    if (!this.stats.alertsBySeverity[alert.severity]) {
      this.stats.alertsBySeverity[alert.severity] = 0;
    }
    this.stats.alertsBySeverity[alert.severity]++;
    
    this.lastAlerts[alert.id.split(':')[0]] = alertRecord;
    
    // Keep only last 1000 alerts
    if (this.alertHistory.length > 1000) {
      this.alertHistory = this.alertHistory.slice(-1000);
    }
  }

  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async sendConsoleNotification(alert) {
    if (!this.config.notificationChannels.console) return;
    
    return {
      status: 'fulfilled',
      channel: 'console'
    };
  }

  async sendWebhookNotification(alert) {
    if (!this.config.notificationChannels.webhook) return;
    
    try {
      const response = await fetch(this.config.notificationChannels.webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          alert,
          source: 'qgenutils-alert-system',
          timestamp: new Date().toISOString()
        })
      });
      
      return {
        status: response.ok ? 'fulfilled' : 'rejected',
        channel: 'webhook',
        statusCode: response.status
      };
    } catch (error) {
      return {
        status: 'rejected',
        channel: 'webhook',
        error: error.message
      };
    }
  }

  async sendEmailNotification(alert) {
    if (!this.config.notificationChannels.email) return;
    
    // Simple email notification (would require email library)
    console.log(`📧 EMAIL ALERT: ${alert.title}`);
    console.log(`To: ${this.config.notificationChannels.email.to}`);
    console.log(`Subject: ${alert.title}`);
    console.log(`Body: ${alert.message}`);
    
    return {
      status: 'fulfilled',
      channel: 'email'
    };
  }

  async sendSlackNotification(alert) {
    if (!this.config.notificationChannels.slack) return;
    
    const slackPayload = {
      text: `🚨 *${alert.title}*`,
      attachments: [{
        color: this.getSlackColor(alert.severity),
        fields: [
          {
            title: 'Severity',
            value: alert.severity.toUpperCase(),
            short: true
          },
          {
            title: 'Message',
            value: alert.message,
            short: false
          },
          {
            title: 'Time',
            value: new Date().toLocaleString(),
            short: true
          }
        ]
      }]
    };
    
    try {
      const response = await fetch(this.config.notificationChannels.slack.webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(slackPayload)
      });
      
      return {
        status: response.ok ? 'fulfilled' : 'rejected',
        channel: 'slack',
        statusCode: response.status
      };
    } catch (error) {
      return {
        status: 'rejected',
        channel: 'slack',
        error: error.message
      };
    }
  }

  getSlackColor(severity) {
    const colors = {
      low: 'good',
      medium: 'warning',
      high: 'danger',
      critical: '#ff0000'
    };
    return colors[severity] || 'warning';
  }

  getAlertStats() {
    return {
      summary: this.stats,
      recentAlerts: this.alertHistory.slice(-10),
      alertHistory: this.alertHistory,
      config: this.config
    };
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('📝 Alert configuration updated');
  }

  addCustomRule(rule) {
    this.config.rules.customRules.push(rule);
    console.log(`📝 Custom rule added: ${rule.name}`);
  }

  removeCustomRule(ruleName) {
    this.config.rules.customRules = this.config.rules.customRules.filter(rule => rule.name !== ruleName);
    console.log(`🗑️ Custom rule removed: ${ruleName}`);
  }

  startMonitoring(interval = 30000) { // Check every 30 seconds
    console.log('🚨 Starting Advanced Alert System');
    console.log(`🔔 Monitoring interval: ${interval / 1000}s`);
    console.log(`📊 Configured channels: ${Object.keys(this.config.notificationChannels).filter(key => this.config.notificationChannels[key]).join(', ')}`);
    
    this.monitoringInterval = setInterval(() => {
      this.checkSystem();
    }, interval);
    
    // Initial check
    this.checkSystem();
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    console.log('🛑 Alert monitoring stopped');
  }
}

// Example usage and initialization
if (require.main === module) {
  const alertConfig = {
    thresholds: {
      responseTime: 500,
      errorRate: 5,
      memoryUsage: 80,
      cacheHitRate: 50
    },
    
    notificationChannels: {
      console: true,
      webhook: process.env.ALERT_WEBHOOK_URL,
      slack: {
        webhook: process.env.SLACK_WEBHOOK_URL
      }
    },
    
    rules: {
      responseTimeAlerts: true,
      errorRateAlerts: true,
      securityAlerts: true,
      resourceAlerts: true,
      customRules: [
        {
          name: 'High Request Volume',
          condition: {
            'requestCount': { '$gt': 1000 }
          },
          message: 'Request volume exceeded 1000 in monitoring period',
          severity: 'medium'
        }
      ]
    },
    
    cooldown: {
      responseTime: 300000,
      errorRate: 600000,
      security: 0,
      resource: 900000
    }
  };
  
  const alertSystem = new AdvancedAlertSystem(alertConfig);
  
  alertSystem.startMonitoring(30000); // Check every 30 seconds
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down alert system...');
    alertSystem.stopMonitoring();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down alert system...');
    alertSystem.stopMonitoring();
    process.exit(0);
  });
}

module.exports = AdvancedAlertSystem;