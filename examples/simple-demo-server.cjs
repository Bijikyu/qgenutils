/**
 * Simple Demo Server - Basic HTTP Server for Testing
 * 
 * Purpose: Provides a minimal demo server for testing QGenUtils functionality
 * without complex imports that might cause ESM/CommonJS issues.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple demo utilities
const DemoUtils = {
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      isValid: emailRegex.test(email),
      message: emailRegex.test(email) ? 'Valid email format' : 'Invalid email format'
    };
  },

  validatePassword: (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const strength = Object.values(checks).filter(Boolean).length;
    const score = strength / Object.keys(checks).length;
    
    const suggestions = [];
    if (!checks.length) { suggestions.push("Use at least 8 characters"); }
    if (!checks.uppercase) { suggestions.push("Include uppercase letters"); }
    if (!checks.lowercase) { suggestions.push("Include lowercase letters"); }
    if (!checks.numbers) { suggestions.push("Include numbers"); }
    if (!checks.special) { suggestions.push("Include special characters"); }
    
    return {
      strength,
      score,
      checks,
      suggestions,
      isValid: strength >= 4,
      message: strength >= 4 ? 'Strong password' : 'Weak password'
    };
  },

  maskApiKey: (apiKey) => {
    if (!apiKey || typeof apiKey !== 'string') {
      return { 
        original: apiKey,
        masked: '****',
        error: 'Invalid API key format'
      };
    }
    
    // Common API key patterns
    const patterns = [
      /^sk-[a-zA-Z0-9]{48}/, // Stripe-like
      /^[a-zA-Z0-9]{32}/, // Generic 32-char
      /^[a-zA-Z0-9-]{20}/, // Generic with dashes
    ];
    
    let masked = apiKey;
    for (const pattern of patterns) {
      if (pattern.test(apiKey)) {
        masked = apiKey.substring(0, 8) + '****' + apiKey.substring(apiKey.length - 4);
        break;
      }
    }
    
    // Fallback: show first 2 and last 2
    if (masked === apiKey && apiKey.length > 8) {
      masked = apiKey.substring(0, 2) + '****' + apiKey.substring(apiKey.length - 2);
    }
    
    return { original: apiKey, masked };
  },

  formatDate: (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  },

  groupBy: (array, key) => {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  },

  sanitizeString: (input) => {
    if (typeof input !== 'string') {
      input = String(input || '');
    }
    
    // Remove HTML tags and dangerous content
    const sanitized = input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
    
    return {
      original: input,
      sanitized,
      length: input.length,
      sanitizedLength: sanitized.length,
      changed: input.length !== sanitized.length
    };
  },

  ensureProtocol: (url, protocol = 'https') => {
    if (typeof url !== 'string') {
      url = String(url || '');
    }
    
    const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url);
    
    if (hasProtocol) {
      return {
        original: url,
        processed: url,
        added: false,
        protocol: url.split(':')[0]
      };
    }
    
    const processed = `${protocol}://${url.replace(/^\/+/, '')}`;
    
    return {
      original: url,
      processed,
      added: true,
      protocol
    };
  },

  formatFileSize: (bytes) => {
    if (typeof bytes !== 'number' || bytes < 0) {
      return {
        error: 'Invalid bytes value',
        formatted: '0 B'
      };
    }
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    const formatted = `${size.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
    
    return {
      bytes,
      formatted,
      unit: units[unitIndex],
      size,
      unitIndex
    };
  },

  formatDateTime: (dateString, format = 'default') => {
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return {
          error: 'Invalid date',
          input: dateString
        };
      }
      
      const formats = {
        default: date.toLocaleDateString() + ' ' + date.toLocaleTimeString(),
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString(),
        iso: date.toISOString(),
        relative: getRelativeTime(date)
      };
      
      return {
        original: dateString,
        formatted: formats[format] || formats.default,
        timestamp: date.getTime(),
        formats
      };
    } catch (error) {
      return {
        error: error.message,
        input: dateString
      };
    }
  },

  memoize: (func) => {
    const cache = new Map();
    
    return function(...args) {
      const key = JSON.stringify(args);
      
      if (cache.has(key)) {
        return {
          result: cache.get(key),
          fromCache: true,
          cacheHits: cache.size + 1
        };
      }
      
      const result = func.apply(this, args);
      cache.set(key, result);
      
      return {
        result,
        fromCache: false,
        cacheHits: cache.size
      };
    };
  }
};

function getRelativeTime(date) {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
}

const port = process.env.PORT || 3000;

// Comprehensive logging system
const auditLogger = {
  logFile: process.env.AUDIT_LOG_PATH || './logs/audit.log',
  errorLogPath: process.env.ERROR_LOG_PATH || './logs/error.log',
  
  ensureLogDirectory() {
    const logDir = './logs';
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  },
  
  writeLog(logPath, level, message, meta = {}) {
    this.ensureLogDirectory();
    
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta,
      pid: process.pid,
      hostname: require('os').hostname()
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    
    try {
      fs.appendFileSync(logPath, logLine);
    } catch (error) {
      console.error('Failed to write log:', error.message);
    }
  },
  
  info(message, meta = {}) {
    console.log(`ℹ️  ${message}`, meta);
    this.writeLog(this.logFile, 'INFO', message, meta);
  },
  
  warn(message, meta = {}) {
    console.log(`⚠️  ${message}`, meta);
    this.writeLog(this.logFile, 'WARN', message, meta);
  },
  
  error(message, meta = {}) {
    console.error(`❌ ${message}`, meta);
    this.writeLog(this.errorLogPath, 'ERROR', message, meta);
    this.writeLog(this.logFile, 'ERROR', message, meta);
  },
  
  security(message, meta = {}) {
    console.log(`🚨 SECURITY: ${message}`, meta);
    this.writeLog(this.logFile, 'SECURITY', message, meta);
  },
  
  apiRequest(req, statusCode, responseTime, error = null) {
    const logEntry = {
      method: req.method,
      path: req.url,
      statusCode,
      responseTime,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      timestamp: new Date().toISOString()
    };
    
    if (error) {
      logEntry.error = error.message;
      logEntry.stack = error.stack;
      this.error('API Request Failed', logEntry);
    } else if (statusCode >= 400) {
      this.warn('API Request Error', logEntry);
    } else {
      this.info('API Request', logEntry);
    }
  },
  
  rotateLogs() {
    const maxLogSize = 10 * 1024 * 1024; // 10MB
    const files = [this.logFile, this.errorLogPath];
    
    files.forEach(filePath => {
      try {
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          if (stats.size > maxLogSize) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = filePath.replace('.log', `-${timestamp}.log`);
            fs.renameSync(filePath, backupFile);
          }
        }
      } catch (error) {
        console.error('Log rotation failed:', error.message);
      }
    });
  }
};

// Advanced rate limiting and quota management
const rateLimiter = {
  windows: new Map(), // Time windows for rate limiting
  quotas: new Map(),  // API quotas per client
  globalStats: {
    totalRequests: 0,
    blockedRequests: 0,
    rateLimitedRequests: 0
  },
  
  getClientKey(req) {
    const forwardedFor = req.headers['x-forwarded-for'];
    const realIP = req.headers['x-real-ip'];
    const remoteAddr = req.connection?.remoteAddress;
    
    return forwardedFor?.split(',')[0]?.trim() || realIP || remoteAddr || 'unknown';
  },
  
  // Rate limiting: max requests per time window
  isRateLimited(req, maxRequests = 100, windowMs = 60000) {
    const clientKey = this.getClientKey(req);
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.windows.has(clientKey)) {
      this.windows.set(clientKey, []);
    }
    
    const requests = this.windows.get(clientKey);
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    this.windows.set(clientKey, validRequests);
    
    // Check if rate limit exceeded
    if (validRequests.length >= maxRequests) {
      auditLogger.security('Rate Limit Exceeded', {
        clientKey,
        requestCount: validRequests.length,
        maxRequests,
        windowMs,
        url: req.url,
        userAgent: req.headers['user-agent']
      });
      
      this.globalStats.rateLimitedRequests++;
      return true;
    }
    
    // Add current request
    validRequests.push(now);
    this.globalStats.totalRequests++;
    return false;
  },
  
  // API quota management: daily/monthly limits
  isQuotaExceeded(req, dailyLimit = 1000, monthlyLimit = 10000) {
    const clientKey = this.getClientKey(req);
    const now = new Date();
    const dayKey = `${clientKey}:${now.toISOString().split('T')[0]}`;
    const monthKey = `${clientKey}:${now.toISOString().slice(0, 7)}`;
    
    if (!this.quotas.has(dayKey)) {
      this.quotas.set(dayKey, 0);
    }
    if (!this.quotas.has(monthKey)) {
      this.quotas.set(monthKey, 0);
    }
    
    const dailyCount = this.quotas.get(dayKey);
    const monthlyCount = this.quotas.get(monthKey);
    
    if (dailyCount >= dailyLimit) {
      auditLogger.security('Daily Quota Exceeded', {
        clientKey,
        dailyCount,
        dailyLimit,
        url: req.url
      });
      return { exceeded: true, reason: 'daily', resetTime: new Date(now.setHours(24,0,0,0)).toISOString() };
    }
    
    if (monthlyCount >= monthlyLimit) {
      auditLogger.security('Monthly Quota Exceeded', {
        clientKey,
        monthlyCount,
        monthlyLimit,
        url: req.url
      });
      return { exceeded: true, reason: 'monthly', resetTime: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString() };
    }
    
    // Increment counters
    this.quotas.set(dayKey, dailyCount + 1);
    this.quotas.set(monthKey, monthlyCount + 1);
    
    return { exceeded: false, dailyRemaining: dailyLimit - dailyCount - 1, monthlyRemaining: monthlyLimit - monthlyCount - 1 };
  },
  
  // Advanced rate limiting for different endpoints
  getEndpointLimits(path) {
    const limits = {
      '/api/string/sanitize': { max: 50, window: 60000 },      // Stricter for security
      '/api/security/mask-api-key': { max: 30, window: 60000 }, // Very strict
      '/api/performance/memoize': { max: 20, window: 60000 },  // Resource intensive
      'default': { max: 100, window: 60000 }
    };
    
    for (const [endpoint, limit] of Object.entries(limits)) {
      if (path.startsWith(endpoint)) {
        return limit;
      }
    }
    return limits.default;
  },
  
  // Clean up old data
  cleanup() {
    const now = Date.now();
    const windowStart = now - 60000; // Keep only last minute
    
    // Clean rate limit windows
    for (const [clientKey, requests] of this.windows.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      if (validRequests.length === 0) {
        this.windows.delete(clientKey);
      } else {
        this.windows.set(clientKey, validRequests);
      }
    }
    
    // Clean old quota entries (older than 2 months)
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const twoMonthsKey = twoMonthsAgo.toISOString().slice(0, 7);
    
    for (const [key] of this.quotas.keys()) {
      if (key.includes(':') && key.split(':')[1] < twoMonthsKey) {
        this.quotas.delete(key);
      }
    }
  },
  
  getStats() {
    return {
      ...this.globalStats,
      activeClients: this.windows.size,
      quotaEntries: this.quotas.size,
      rateLimitWindows: this.windows.size
    };
  }
};

// Advanced caching system
const cacheManager = {
  // Memory cache with LRU eviction
  memoryCache: new Map(),
  cacheStats: {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalSets: 0
  },
  maxCacheSize: 1000,
  defaultTTL: 300000, // 5 minutes
  
  generateCacheKey(endpoint, data) {
    const dataHash = require('crypto')
      .createHash('md5')
      .update(JSON.stringify(data))
      .digest('hex');
    return `${endpoint}:${dataHash}`;
  },
  
  set(key, value, ttl = this.defaultTTL) {
    // Implement LRU eviction
    if (this.memoryCache.size >= this.maxCacheSize) {
      const oldestKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(oldestKey);
      this.cacheStats.evictions++;
      auditLogger.debug('Cache eviction', { key: oldestKey, reason: 'LRU' });
    }
    
    const cacheEntry = {
      value,
      createdAt: Date.now(),
      ttl,
      accessCount: 0
    };
    
    this.memoryCache.set(key, cacheEntry);
    this.cacheStats.totalSets++;
  },
  
  get(key) {
    const entry = this.memoryCache.get(key);
    
    if (!entry) {
      this.cacheStats.misses++;
      return null;
    }
    
    // Check TTL
    if (Date.now() - entry.createdAt > entry.ttl) {
      this.memoryCache.delete(key);
      this.cacheStats.misses++;
      return null;
    }
    
    // Update access count for LRU tracking
    entry.accessCount++;
    
    // Move to end (most recently used)
    const value = this.memoryCache.get(key);
    this.memoryCache.delete(key);
    this.memoryCache.set(key, value);
    
    this.cacheStats.hits++;
    return entry.value;
  },
  
  // Different caching strategies per endpoint
  shouldCache(endpoint, data, result) {
    const cacheableEndpoints = [
      '/api/validate/email',
      '/api/security/mask-api-key',
      '/api/file/format-size',
      '/api/url/ensure-protocol'
    ];
    
    if (!cacheableEndpoints.includes(endpoint)) {
      return false;
    }
    
    // Don't cache error responses
    if (result.error) {
      return false;
    }
    
    // Don't cache very large responses
    const responseSize = JSON.stringify(result).length;
    if (responseSize > 1024) { // 1KB
      return false;
    }
    
    return true;
  },
  
  getTTL(endpoint, result) {
    // Different TTL for different endpoints
    const ttlMap = {
      '/api/validate/email': 600000,      // 10 minutes
      '/api/security/mask-api-key': 300000,  // 5 minutes
      '/api/file/format-size': 1800000,     // 30 minutes
      '/api/url/ensure-protocol': 900000     // 15 minutes
    };
    
    return ttlMap[endpoint] || this.defaultTTL;
  },
  
  getStats() {
    const hitRate = this.cacheStats.hits + this.cacheStats.misses > 0 
      ? (this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses)) * 100 
      : 0;
      
    return {
      ...this.cacheStats,
      hitRate: Math.round(hitRate * 100) / 100,
      cacheSize: this.memoryCache.size,
      memoryUsage: this.estimateMemoryUsage()
    };
  },
  
  estimateMemoryUsage() {
    let totalSize = 0;
    
    for (const [key, entry] of this.memoryCache.entries()) {
      totalSize += key.length * 2; // String size estimation
      totalSize += JSON.stringify(entry.value).length * 2;
      totalSize += 64; // Object overhead estimation
    }
    
    return Math.round(totalSize / 1024); // KB
  },
  
  clear() {
    const clearedCount = this.memoryCache.size;
    this.memoryCache.clear();
    auditLogger.info('Cache cleared', { entriesCleared: clearedCount });
  },
  
  cleanup() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.createdAt > entry.ttl) {
        this.memoryCache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      auditLogger.debug('Cache cleanup', { entriesExpired: cleanedCount });
    }
  }
};

// Initialize logging
auditLogger.info('Demo Server Starting', {
  version: '2.0.0',
  nodeVersion: process.version,
  platform: process.platform,
  memory: process.memoryUsage(),
  rateLimiting: 'enabled',
  auditLogging: 'enabled',
  caching: 'enabled',
  cacheSize: cacheManager.maxCacheSize
});

// Performance monitoring
const performanceMonitor = {
  requestCount: 0,
  totalResponseTime: 0,
  errorCount: 0,
  startTime: Date.now(),
  requests: [],
  
  recordRequest(req, startTime, statusCode, error = null) {
    const responseTime = Date.now() - startTime;
    this.requestCount++;
    this.totalResponseTime += responseTime;
    
    if (error || statusCode >= 400) {
      this.errorCount++;
    }
    
    // Keep only last 100 requests for memory efficiency
    this.requests.push({
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.url,
      responseTime,
      statusCode,
      error: error ? error.message : null,
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    
    if (this.requests.length > 100) {
      this.requests = this.requests.slice(-100);
    }
    
    // Enhanced logging with audit trail
    if (responseTime > 500) {
      auditLogger.warn('Slow Request Detected', {
        method: req.method,
        path: req.url,
        responseTime,
        threshold: 500
      });
    }
    
    // Security logging for suspicious patterns
    const suspiciousPatterns = [
      /\.\./,  // Path traversal
      /<script/i,  // XSS attempts
      /union.*select/i,  // SQL injection
      /javascript:/i  // JS protocol
    ];
    
    const isSuspicious = suspiciousPatterns.some(pattern => 
      pattern.test(req.url) || pattern.test(JSON.stringify(req.headers))
    );
    
    if (isSuspicious) {
      const securityEvent = {
        method: req.method,
        path: req.url,
        headers: req.headers,
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        timestamp: new Date().toISOString(),
        severity: 'high'
      };
      
      auditLogger.security('Suspicious Request Detected', securityEvent);
      
      // Broadcast to WebSocket clients
      if (wsMonitor) {
        wsMonitor.broadcastSecurityEvent(securityEvent);
      }
    }
    
    // Log every request for audit trail
    auditLogger.apiRequest(req, statusCode, responseTime, error);
  },
  
  getStats() {
    const avgResponseTime = this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0;
    const uptime = Date.now() - this.startTime;
    const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;
    
    return {
      requestCount: this.requestCount,
      avgResponseTime: Math.round(avgResponseTime * 100) / 100,
      uptime,
      errorRate: Math.round(errorRate * 100) / 100,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      recentRequests: this.requests.slice(-10) // Last 10 requests
    };
  },
  
  reset() {
    this.requestCount = 0;
    this.totalResponseTime = 0;
    this.errorCount = 0;
    this.startTime = Date.now();
    this.requests = [];
  }
};

const server = http.createServer((req, res) => {
  const requestStartTime = Date.now();
  
  // Rate limiting and quota checking
  const endpointLimits = rateLimiter.getEndpointLimits(req.url);
  
  if (rateLimiter.isRateLimited(req, endpointLimits.max, endpointLimits.window)) {
    performanceMonitor.recordRequest(req, requestStartTime, 429);
    sendJson(res, { 
      error: 'Rate limit exceeded',
      message: `Too many requests. Maximum ${endpointLimits.max} requests per ${endpointLimits.window/1000} seconds.`,
      retryAfter: Math.ceil(endpointLimits.window / 1000)
    }, 429);
    return;
  }
  
  const quotaStatus = rateLimiter.isQuotaExceeded(req);
  if (quotaStatus.exceeded) {
    performanceMonitor.recordRequest(req, requestStartTime, 429);
    sendJson(res, { 
      error: 'Quota exceeded',
      message: `API quota exceeded: ${quotaStatus.reason} limit reached.`,
      resetTime: quotaStatus.resetTime
    }, 429);
    return;
  }
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Rate limiting headers
  res.setHeader('X-RateLimit-Limit', endpointLimits.max);
  res.setHeader('X-RateLimit-Window', endpointLimits.window / 1000);
  res.setHeader('X-Quota-Daily-Remaining', quotaStatus.dailyRemaining || 'N/A');
  res.setHeader('X-Quota-Monthly-Remaining', quotaStatus.monthlyRemaining || 'N/A');

  // Add performance headers
  res.setHeader('X-Response-Time', 'pending');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    performanceMonitor.recordRequest(req, requestStartTime, 200);
    return;
  }

  const parsedUrl = require('url').parse(req.url, true);
  const path = parsedUrl.pathname;

  // Add performance endpoint
  if (path === '/api/stats') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const perfStats = performanceMonitor.getStats();
    const rateStats = rateLimiter.getStats();
    const cacheStats = cacheManager.getStats();
    
    const combinedStats = {
      ...perfStats,
      rateLimiting: rateStats,
      caching: cacheStats,
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version
      }
    };
    
    res.end(JSON.stringify(combinedStats, null, 2));
    performanceMonitor.recordRequest(req, requestStartTime, 200);
    return;
  }

  // Cache management endpoint
  if (path === '/api/cache/clear' && req.method === 'POST') {
    cacheManager.clear();
    sendJson(res, { message: 'Cache cleared successfully' });
    performanceMonitor.recordRequest(req, requestStartTime, 200);
    return;
  }

  // API routes
  if (path.startsWith('/api/')) {
    try {
      handleApiRequest(req, res, path, req.method, () => {
        const responseTime = Date.now() - requestStartTime;
        performanceMonitor.recordRequest(req, requestStartTime, res.statusCode);
      });
    } catch (error) {
      performanceMonitor.recordRequest(req, requestStartTime, 500, error);
      sendJson(res, { error: 'Internal server error' }, 500);
    }
    return;
  }

  // Admin dashboard route
  if (path === '/admin') {
    try {
      const adminHtml = fs.readFileSync('./examples/admin-dashboard.html', 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(adminHtml);
      performanceMonitor.recordRequest(req, requestStartTime, 200);
      return;
    } catch (error) {
      performanceMonitor.recordRequest(req, requestStartTime, 500, error);
      sendJson(res, { error: 'Admin dashboard not available' }, 500);
      return;
    }
  }

  // Serve static files
  try {
    serveStaticFile(req, res, path);
    performanceMonitor.recordRequest(req, requestStartTime, res.statusCode);
  } catch (error) {
    performanceMonitor.recordRequest(req, requestStartTime, 500, error);
  }
});

async function handleApiRequest(req, res, path, method, onComplete) {
  const requestStartTime = Date.now();
  
  if (method !== 'POST') {
    sendJson(res, { error: 'Method not allowed' }, 405);
    if (onComplete) onComplete();
    return;
  }

  const body = await parseRequestBody(req);
  const [, , category, action] = path.split('/');
  
  // Check cache first for GET-like operations
  const cacheKey = cacheManager.generateCacheKey(path, body);
  const cachedResult = cacheManager.get(cacheKey);
  
  if (cachedResult) {
    auditLogger.info('Cache hit', { path, cacheKey, responseTime: Date.now() - requestStartTime });
    res.setHeader('X-Cache', 'HIT');
    sendJson(res, cachedResult);
    if (onComplete) onComplete();
    return;
  }
  
  res.setHeader('X-Cache', 'MISS');
  
  setTimeout(async () => {
    try {
      let result;
      
      switch (category) {
        case 'validate':
          result = await handleValidationAsync(action, body);
          break;
        case 'security':
          result = await handleSecurityAsync(action, body);
          break;
        case 'datetime':
          result = await handleDateTimeAsync(action, body);
          break;
        case 'collections':
          result = await handleCollectionsAsync(action, body);
          break;
        case 'string':
          result = await handleStringAsync(action, body);
          break;
        case 'url':
          result = await handleUrlAsync(action, body);
          break;
        case 'file':
          result = await handleFileAsync(action, body);
          break;
        case 'performance':
          result = await handlePerformanceAsync(action, body);
          break;
        default:
          result = { error: 'Unknown endpoint' };
      }
      
      // Cache the result if appropriate
      if (cacheManager.shouldCache(path, body, result)) {
        const ttl = cacheManager.getTTL(path, result);
        cacheManager.set(cacheKey, result, ttl);
        
        auditLogger.debug('Response cached', { 
          path, 
          cacheKey, 
          ttl,
          responseSize: JSON.stringify(result).length 
        });
      }
      
      sendJson(res, result);
      
    } catch (error) {
      auditLogger.error('API Request Error', {
        path,
        error: error.message,
        stack: error.stack
      });
      sendJson(res, { error: 'Request processing failed' }, 500);
    } finally {
      if (onComplete) onComplete();
    }
  }, 10); // Further reduced delay with caching
}

function handleValidation(req, res, action, body) {
  let result;
  switch (action) {
    case 'email':
      result = DemoUtils.validateEmail(body.email);
      break;
    case 'password':
      result = DemoUtils.validatePassword(body.password);
      break;
    default:
      result = { error: 'Unknown validation action' };
  }
  sendJson(res, result);
}

// Async versions for caching
async function handleValidationAsync(action, body) {
  return new Promise((resolve) => {
    let result;
    switch (action) {
      case 'email':
        result = DemoUtils.validateEmail(body.email);
        break;
      case 'password':
        result = DemoUtils.validatePassword(body.password);
        break;
      default:
        result = { error: 'Unknown validation action' };
    }
    resolve(result);
  });
}

function handleDateTime(req, res, action, body) {
  let result;
  switch (action) {
    case 'format':
      result = DemoUtils.formatDate(body.date);
      break;
    default:
      result = { error: 'Unknown datetime action' };
  }
  sendJson(res, result);
}

function handleSecurity(req, res, action, body) {
  let result;
  switch (action) {
    case 'mask-api-key':
      result = DemoUtils.maskApiKey(body.apiKey);
      break;
    default:
      result = { error: 'Unknown security action' };
  }
  sendJson(res, result);
}

async function handleSecurityAsync(action, body) {
  return new Promise((resolve) => {
    let result;
    switch (action) {
      case 'mask-api-key':
        result = DemoUtils.maskApiKey(body.apiKey);
        break;
      default:
        result = { error: 'Unknown security action' };
    }
    resolve(result);
  });
}

function handleCollections(req, res, action, body) {
  let result;
  switch (action) {
    case 'group-by':
      result = DemoUtils.groupBy(body.array, body.key);
      break;
    default:
      result = { error: 'Unknown collections action' };
  }
  sendJson(res, result);
}

function handleString(req, res, action, body) {
  let result;
  switch (action) {
    case 'sanitize':
      result = DemoUtils.sanitizeString(body.input);
      break;
    default:
      result = { error: 'Unknown string action' };
  }
  sendJson(res, result);
}

async function handleStringAsync(action, body) {
  return new Promise((resolve) => {
    let result;
    switch (action) {
      case 'sanitize':
        result = DemoUtils.sanitizeString(body.input);
        break;
      default:
        result = { error: 'Unknown string action' };
    }
    resolve(result);
  });
}

function handleUrl(req, res, action, body) {
  let result;
  switch (action) {
    case 'ensure-protocol':
      result = DemoUtils.ensureProtocol(body.url, body.protocol);
      break;
    default:
      result = { error: 'Unknown URL action' };
  }
  sendJson(res, result);
}

function handleFile(req, res, action, body) {
  let result;
  switch (action) {
    case 'format-size':
      result = DemoUtils.formatFileSize(body.bytes);
      break;
    default:
      result = { error: 'Unknown file action' };
  }
  sendJson(res, result);
}

function handlePerformance(req, res, action, body) {
  let result;
  switch (action) {
    case 'memoize':
      const fn = new Function('return ' + body.function)();
      const memoized = DemoUtils.memoize(fn);
      const results = [];
      
      // Test the memoized function
      for (let i = 0; i < 3; i++) {
        results.push(memoized(...(body.args || [])));
      }
      
      result = {
        demo: results,
        explanation: 'First call computes, subsequent calls return cached result'
      };
      break;
    default:
      result = { error: 'Unknown performance action' };
  }
  sendJson(res, result);
}

function parseRequestBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res, data, statusCode = 200) {
  const jsonData = JSON.stringify(data, null, 2);
  res.writeHead(statusCode, { 
    'Content-Type': 'application/json',
    'X-Content-Length': jsonData.length
  });
  res.end(jsonData);
}

function serveStaticFile(req, res, path) {
    if (path === '/') { path = '/demo.html'; }
  
  const filePath = path.join(__dirname, path);
  const extname = path.extname(filePath);
  
  const contentType = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json'
  }[extname] || 'text/plain';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

server.listen(port, () => {
  console.log(`\n🚀 Enhanced Demo Server listening on http://localhost:${port}\n`);
  console.log('📋 Available API Endpoints:');
  console.log('  📧 Validation:');
  console.log('    POST /api/validate/email - Email validation');
  console.log('    POST /api/validate/password - Password validation');
  console.log('  🔒 Security:');
  console.log('    POST /api/security/mask-api-key - API key masking');
  console.log('  📅 DateTime:');
  console.log('    POST /api/datetime/format - Date formatting');
  console.log('  📁 Collections:');
  console.log('    POST /api/collections/group-by - Array grouping');
  console.log('  📝 String Processing:');
  console.log('    POST /api/string/sanitize - String sanitization');
  console.log('  🌐 URL Processing:');
  console.log('    POST /api/url/ensure-protocol - Protocol normalization');
  console.log('  📄 File Utilities:');
  console.log('    POST /api/file/format-size - File size formatting');
  console.log('  ⚡ Performance:');
  console.log('    POST /api/performance/memoize - Function memoization demo');
  console.log('  📊 Monitoring:');
  console.log('    GET /api/stats - Server performance metrics');
  console.log('  🗄️  Cache Management:');
  console.log('    POST /api/cache/clear - Clear server cache');
  console.log('\n🎯 Open http://localhost:3000 for interactive demo interface');
  console.log('🔧 Admin Dashboard: http://localhost:3000/admin');
  console.log('📊 View performance stats: GET http://localhost:3000/api/stats');
  console.log('📖 Test endpoints with curl or demo interface');
  
  // Log server health and cleanup
  setInterval(() => {
    const perfStats = performanceMonitor.getStats();
    const rateStats = rateLimiter.getStats();
    const cacheStats = cacheManager.getStats();
    const memMB = Math.round(perfStats.memoryUsage.heapUsed / 1024 / 1024);
    const uptimeMin = Math.round(perfStats.uptime / 1000 / 60);
    
    auditLogger.info('Health Check', {
      requests: perfStats.requestCount,
      avgResponseTime: perfStats.avgResponseTime,
      memoryMB: memMB,
      uptimeMinutes: uptimeMin,
      activeClients: rateStats.activeClients,
      blockedRequests: rateStats.blockedRequests,
      rateLimitedRequests: rateStats.rateLimitedRequests,
      cacheHitRate: cacheStats.hitRate,
      cacheSize: cacheStats.cacheSize
    });
    
    console.log(`📈 Health: ${perfStats.requestCount} requests, ${perfStats.avgResponseTime}ms avg, ${memMB}MB RAM, ${uptimeMin}m uptime, ${rateStats.activeClients} clients, ${cacheStats.hitRate}% cache hit`);
    
    // Cleanup old data
    rateLimiter.cleanup();
    cacheManager.cleanup();
    auditLogger.rotateLogs();
  }, 60000); // Log every minute
  console.log('📈 Performance monitoring, rate limiting, and caching enabled\n');
});