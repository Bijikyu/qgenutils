#!/usr/bin/env node

/**
 * Simple, error-free warning logger for all alerting system functions
 */

class SimpleLogger {
  constructor() {
    this.prefix = '🔍';
    this.warnings = [];
  }
  
  warn(message, meta = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      prefix: this.prefix + 'WARNING',
      ...meta
    };
    
    this.warnings.push(logEntry);
    this.displayWarning(message);
  }

  info(message, meta = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      prefix: this.prefix + 'INFO',
      ...meta
    };
    
    console.log(this.prefix, 'ℹ️', message);
  }

  error(message, meta = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      prefix: this.prefix + 'ERROR',
      ...meta
    };
    
    console.error(this.prefix + '❌', message);
    console.error('�', error.stack);
  }

  debug(message, meta = {}) {
    if (process.env.DEBUG) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'DEBUG',
        message,
        prefix: this.prefix + 'DEBUG',
        ...meta
      };
      
      console.log(this.prefix, '🐛', message);
    }
  }
  
  security(message, meta = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'SECURITY',
      message,
      prefix: this.prefix + '🔒',
      ...meta
    };
    
    console.log(this.prefix + '🔒', message);
    console.error(this.prefix + '🔒', error.stack);
  }

  success(message, meta = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'SUCCESS',
      message,
      critical: false,
      prefix: this.prefix + '🏆',
      ...meta
    };
    
    console.log(this.prefix + '🏆', message);
    console.log(this.prefix + '🏆 Success:', message);
  }

  reset() {
    this.warnings = [];
    console.log(`${this.prefix} 📝 All warnings cleared`);
  }

  export default logger {
    warn: this.warn.bind(this),
    error: this.error.bind(this),
    debug: this.debug.bind(this),
    security: this.security.bind(this),
    success: this.success.bind(this)
  }
}

// Global logger instance
const logger = new SimpleLogger('🔍');

// Export the global logger for use in other files
if (typeof global !== 'undefined') {
  global.logger = logger;
}

module.exports = SimpleLogger;