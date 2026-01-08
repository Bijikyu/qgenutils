/**
 * Simple CommonJS wrapper for demo server
 * Provides basic implementations for demo purposes
 */

const utils = {
  // Validation utilities
  validateEmailFormat: function(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      isValid: emailRegex.test(email),
      email: email
    };
  },

  validatePasswordStrength: function(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    return {
      strength: strength,
      isStrong: strength >= 4,
      password: password
    };
  },

  validateApiKeyFormat: function(apiKey) {
    return {
      isValid: apiKey && apiKey.length >= 16,
      apiKey: apiKey
    };
  },

  validateMonetaryAmount: function(amount) {
    const amountRegex = /^\d+(\.\d{1,2})?$/;
    return {
      isValid: amountRegex.test(amount.toString()),
      amount: amount
    };
  },

  sanitizeInput: function(input) {
    if (typeof input !== 'string') return '';
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  },

  // Security utilities
  maskApiKey: function(apiKey) {
    if (!apiKey || apiKey.length < 8) return apiKey;
    const start = apiKey.substring(0, 4);
    const end = apiKey.substring(apiKey.length - 4);
    const middle = '*'.repeat(apiKey.length - 8);
    return start + middle + end;
  },

  hashPassword: async function(password) {
    const crypto = require('crypto');
    return new Promise((resolve) => {
      crypto.pbkdf2(password, 'salt', 10000, 64, 'sha512', (err, derivedKey) => {
        resolve(derivedKey.toString('hex'));
      });
    });
  },

  verifyPassword: async function(password, hash) {
    const crypto = require('crypto');
    return new Promise((resolve) => {
      crypto.pbkdf2(password, 'salt', 10000, 64, 'sha512', (err, derivedKey) => {
        resolve(derivedKey.toString('hex') === hash);
      });
    });
  },

  generateSecurePassword: function(options = {}) {
    const length = options.length || 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  },

  // Collections utilities
  groupBy: function(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  },

  chunk: function(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  unique: function(array) {
    return [...new Set(array)];
  },

  sortBy: function(array, key) {
    return [...array].sort((a, b) => {
      if (a[key] < b[key]) return -1;
      if (a[key] > b[key]) return 1;
      return 0;
    });
  },

  shuffle: function(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  // DateTime utilities
  addDays: function(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  },

  formatDateTime: function(date, format) {
    return new Date(date).toLocaleString();
  },

  formatDuration: function(start, end) {
    const duration = Math.abs(new Date(end) - new Date(start));
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  },

  // Performance utilities
  memoize: function(fn) {
    const cache = new Map();
    return function(...args) {
      const key = JSON.stringify(args);
      if (cache.has(key)) return cache.get(key);
      const result = fn(...args);
      cache.set(key, result);
      return result;
    };
  },

  throttle: function(fn, delay) {
    let lastCall = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return fn(...args);
      }
    };
  }
};

module.exports = utils;