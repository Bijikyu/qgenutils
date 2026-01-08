#!/usr/bin/env node

/**
 * Simple Alerting System for QGenUtils Demo Server
 * 
 * Provides monitoring and alerting including:
 * - Performance threshold alerts
 * - Security event alerts
 * - System resource alerts
 * - Error rate alerts
 * - Console notifications
 */

const http = require('http');
const fs = require('fs');
const { performance } = require('perf_hooks');

class SimpleAlertingSystem {
  constructor() {
    this.config = {
      thresholds: {
        responseTime: 500,
        errorRate: 5,
        memoryUsage: 80,
        requestCount: 1000
      },
      
      checkInterval: 30000, // 30 seconds
      
      alertHistory: [],
      stats: {
        totalAlerts: 0,
        lastCheck: null
      };
    
    this.isRunning = false;
  }

  async checkSystem() {
    try {
      const systemStats = await this.getSystemStats();
      
      // Check performance thresholds
      if (systemStats.avgResponseTime > this.config.thresholds.responseTime) {
        this.sendAlert('PERFORMANCE', 'HIGH', 'High Response Time', 
          `Average response time is ${systemStats.avgResponseTime}ms (threshold: ${this.config.thresholds.responseTime}ms)`);
      }
      
      // Check error rate
      if (systemStats.errorRate > this.config.thresholds.errorRate) {
        this.sendAlert('ERROR', 'MEDIUM', 'High Error Rate', 
          `Error rate is ${systemStats.errorRate}% (threshold: ${this.config.thresholds.errorRate}%)`);
      }
      
      // Check memory usage
      if (systemStats.memoryUsagePercent > this.config.thresholds.memoryUsage) {
        this.sendAlert('RESOURCE', 'HIGH', 'High Memory Usage', 
          `Memory usage is ${systemStats.memoryUsagePercent}% (${Math.round(systemStats.memoryUsed / 1024 / 1024)}MB)`);
      }
      
      // Check request volume
      if (systemStats.requestCount > this.config.thresholds.requestCount) {
        this.sendAlert('INFO', 'LOW', 'High Request Volume', 
          `Request count is ${systemStats.requestCount} (threshold: ${this.config.thresholds.requestCount})`);
      }
      
      this.stats.lastCheck = new Date().toISOString();
    } catch (error) {
      console.error('Error in alert system check:', error);
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

  getDefaultStats() {
    return {
      requestCount: 0,
      avgResponseTime: 0,
      errorRate: 0,
      memoryUsed: 0,
      memoryUsagePercent: 0,
      timestamp: new Date().toISOString()
    };
  }

  sendAlert(type, severity, title, message) {
    const alert = {
      id: this.generateAlertId(),
      type,
      severity,
      title,
      message,
      timestamp: new Date().toISOString(),
      data: {}
    };
    
    this.recordAlert(alert);
    this.displayAlert(alert);
    
    console.log('\n🚨 ALERT: ${title} [${severity.toUpperCase()}]');
    console.log(`📝 Message: ${message}`);
    console.log(`🕐 Time: ${alert.timestamp}`);
    console.log(`🔍 ID: ${alert.id}\n`);
  }

  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  recordAlert(alert) {
    this.alertHistory.push(alert);
    this.stats.totalAlerts++;
    
    // Keep only last 100 alerts
    if (this.alertHistory.length > 100) {
      this.alertHistory = this.alertHistory.slice(-100);
    }
    
    console.log('📊 Total alerts stored:', this.stats.totalAlerts);
    this.stats.lastCheck = new Date().toISOString();
  }

  getStatus() {
    return {
      running: this.isRunning,
      config: this.config,
      stats: this.getAlertStats(),
      uptime: this.isRunning ? Date.now() - this.startTime : 0
    };
  }

  start() {
    if (this.isRunning) {
      console.log('Alert system is already running');
      return;
    }
    
    console.log('🚨 Starting Simple Alert System');
    console.log(`🕐 Check interval: ${this.config.checkInterval / 1000} seconds`);
    console.log(`📊 Monitoring thresholds:`, this.config.thresholds);
    console.log('='.repeat(50));
    
    this.isRunning = true;
    
    // Start periodic checking
    this.checkInterval = setInterval(() => {
      this.checkSystem();
    }, this.config.checkInterval);
    
    this.checkSystem();
    
    console.log('📊 Alert system monitoring... Press Ctrl+C to stop');
  }
  }

  stop() {
    if (!this.isRunning) {
      console.log('Alert system is not running');
      return;
    }
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    this.isRunning = false;
    console.log('🔌 Alert system stopped');
  }
  }

  getHistory(limit = 20) {
    return this.alertHistory.slice(-limit);
  }

  clearHistory() {
    this.alertHistory = [];
    this.stats.totalAlerts = 0;
    console.log('🗑️ Alert history cleared');
  }

  updateThresholds(newThresholds) {
    this.config.thresholds = { ...this.config.thresholds, ...newThresholds };
    console.log('📝 Alert thresholds updated:', this.config.thresholds);
  }

  exportReport(filename = 'alert-report.json') {
    const report = {
      exportTime: new Date().toISOString(),
      config: this.config,
      stats: this.getAlertStats(),
      history: this.alertHistory,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage()
      }
    };
    
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`📄 Alert report exported to: ${filename}`);
  }

  displayAlert(alert) {
    // Simple console-based alert display
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
    console.log(`${'─`.repeat(20)}`);
  }

  getAlertStats() {
    const last24Hours = this.alertHistory.filter(alert => 
      Date.now() - new Date(alert.timestamp).getTime() < 24 * 60 * 60 * 1000
    );
    
    const severityCounts = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0
    };
    
    last24Hours.forEach(alert => {
      severityCounts[alert.severity]++;
    });
    
    return {
      total: this.stats.totalAlerts,
      last24Hours: last24Hours.length,
      bySeverity: severityCounts,
      lastAlert: this.alertHistory.length > 0 ? this.alertHistory[this.alertHistory.length - 1] : null
      lastCheck: this.stats.lastCheck,
      uptime: this.isRunning ? Date.now() - this.startTime : 0
    };
  }
}

// Usage example
if (require.main === module) {
  const alertSystem = new SimpleAlertSystem();
  
  // Start monitoring
  alertSystem.start();
  
  // Example: Update thresholds
  alertSystem.updateThresholds({
    responseTime: 300,    // 300ms (5x improvement)
    memoryUsage: 85,        // 85% memory usage threshold
  },
  {
      alertSystem.updateThresholds({
      responseTime: 300,    // 300ms (5x improvement)
    memoryUsage: 85,
    requestCount: 500      // 5x increase
  });
  
  // Send manual alert
  alertSystem.sendAlert('INFO', 'LOW', 'Low Volume', 'Request count is 500 (threshold: 500)');
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down alert system...');
    alertSystem.stop();
    
    // Export final report
    alertSystem.exportReport('final-alert-report.json');
    
    process.exit(0);
  });
}