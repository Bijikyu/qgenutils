'use strict';

// Pre-compiled regex patterns for better performance
var PATTERNS = {
  SCRIPT_TAGS: /<script[^>]*>.*?<\/script>/gi,
  HTML_TAGS: /<\/?[^>]*>/g,
  HTML_ENTITIES: /&/g,
  WHITESPACE: /^\s+|\s+$/g,
  MULTIPLE_SPACES: /\s+/g,
  MALICIOUS_PATTERNS: /(?:javascript:|on\w+\s*=|data:)/i
};

// LRU Cache implementation for sanitized strings
function LRUCache(maxSize) {
  maxSize = maxSize || 1000;
  this.maxSize = maxSize;
  this.cache = new Map();
}

LRUCache.prototype.get = function(key) {
  if (this.cache.has(key)) {
    var value = this.cache.get(key);
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }
  return null;
};

LRUCache.prototype.set = function(key, value) {
  if (this.cache.has(key)) {
    this.cache.delete(key);
  } else if (this.cache.size >= this.maxSize) {
    // Remove least recently used (first item)
    var firstKey = this.cache.keys().next().value;
    this.cache.delete(firstKey);
  }
  this.cache.set(key, value);
};

// Shared cache instance (1000 entries ~ 50KB memory)
var cache = new LRUCache(1000);

function isTooLarge(str) {
  // Prevent processing very large strings (>10MB)
  return str && str.length > 10485760;
}

function sanitizeInput(input) {
  // Early exits for edge cases
  if (input === null || input === undefined) {
    return '';
  }

  // Convert to string efficiently
  var str = String(input);

  // Early exit for empty string
  if (str.length === 0) {
    return '';
  }

  // Size limit check
  if (isTooLarge(str)) {
    return '';
  }

  // Check cache first
  var cached = cache.get(str);
  if (cached !== null) {
    return cached;
  }

  // Quick malicious content check
  if (PATTERNS.MALICIOUS_PATTERNS.test(str)) {
    // For malicious content, still sanitize but cache result
    var sanitized = sanitizeMalicious(str);
    cache.set(str, sanitized);
    return sanitized;
  }

  // Normal sanitization path
  var result = str;

  // Remove script tags and their content first (security critical)
  result = result.replace(PATTERNS.SCRIPT_TAGS, '');

  // Remove remaining HTML tags (but preserve content)
  result = result.replace(PATTERNS.HTML_TAGS, '');

  // Trim whitespace efficiently
  result = result.replace(PATTERNS.WHITESPACE, '');

  // Replace HTML entities
  result = result.replace(PATTERNS.HTML_ENTITIES, '&amp;');

  // Normalize multiple spaces to single space
  result = result.replace(PATTERNS.MULTIPLE_SPACES, ' ');

  // Cache result
  cache.set(str, result);

  return result;
}

function sanitizeMalicious(str) {
  var result = str;

  // Remove script tags and their content first
  result = result.replace(/<script[^>]*>.*?<\/script>/gi, '');

  // Aggressive HTML removal (preserve content between normal tags)
  result = result.replace(/<\/?[^>]*>/g, '');

  // Remove event handlers and javascript: URLs
  result = result.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  result = result.replace(/javascript:[^\s]*/gi, '');

  // Remove data: URLs
  result = result.replace(/data:[^\s]*/gi, '');

  // Final cleanup
  result = result.trim();
  result = result.replace(/\s+/g, ' ');
  result = result.replace(/&/g, '&amp;');

  return result;
}

function getCacheStats() {
  return {
    size: cache.cache.size,
    maxSize: cache.maxSize
  };
}

function clearCache() {
  cache.cache.clear();
}

// Export additional utilities for testing and monitoring
sanitizeInput.getCacheStats = getCacheStats;
sanitizeInput.clearCache = clearCache;

module.exports = sanitizeInput;