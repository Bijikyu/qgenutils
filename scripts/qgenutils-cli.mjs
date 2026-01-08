#!/usr/bin/env node

/**
 * QGenUtils CLI Tool
 * 
 * Command-line interface for common QGenUtils operations
 * 
 * Usage:
 *   npx qgenutils validate-email test@example.com
 *   npx qgenutils hash-password --password mypass --rounds 12
 *   npx qgenutils format-file-size 1048576
 *   npx qgenutils benchmark
 */

import { createRequire } from 'module';
import path from 'path';

// Handle both ESM and CommonJS
const require = createRequire(import.meta.url);

// Import QGenUtils utilities directly (development mode)
const QGenUtils = {
  validateEmail: (email) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
  },
  validateUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  formatFileSize: (bytes) => {
    if (typeof bytes !== 'number' || bytes < 0) {
      return { error: 'Invalid bytes value', formatted: '0 B' };
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
  ensureProtocol: (url, protocol = 'https') => {
    if (typeof url !== 'string') {
      url = String(url || '');
    }
    
    const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url);
    
    if (hasProtocol) {
      return {
        original: url,
        processed: url,
        added: false
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
  maskApiKey: (apiKey) => {
    if (!apiKey || typeof apiKey !== 'string') {
      return { original: apiKey, masked: '****', error: 'Invalid API key' };
    }
    
    if (apiKey.length <= 8) {
      return { original: apiKey, masked: '****' };
    }
    
    const masked = apiKey.substring(0, 4) + '****' + apiKey.substring(apiKey.length - 4);
    return { original: apiKey, masked };
  },
  generateSecurePassword: (options = {}) => {
    const { 
      length = 16, 
      includeSymbols = true,
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true
    } = options;

    let charset = '';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:<>?,./';

    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
  },
  hashPassword: async (password, options = {}) => {
    const bcrypt = require('bcrypt');
    const rounds = options.rounds || 12;
    const salt = options.salt || await bcrypt.genSalt(rounds);
    return await bcrypt.hash(password, salt);
  },
  verifyPassword: async (password, hash) => {
    const bcrypt = require('bcrypt');
    return await bcrypt.compare(password, hash);
  },
  formatDateTime: (date, options = {}) => {
    const targetDate = date instanceof Date ? date : new Date(date);
    
    if (isNaN(targetDate.getTime())) {
      return { error: 'Invalid date', input: date };
    }

    const format = options.format || 'default';
    const formats = {
      default: targetDate.toLocaleDateString() + ' ' + targetDate.toLocaleTimeString(),
      date: targetDate.toLocaleDateString(),
      time: targetDate.toLocaleTimeString(),
      iso: targetDate.toISOString()
    };

    return {
      original: date,
      formatted: formats[format] || formats.default,
      timestamp: targetDate.getTime(),
      formats
    };
  }
};

class QGenUtilsCLI {
  constructor() {
    this.commands = {
      'validate-email': this.validateEmail,
      'validate-url': this.validateUrl,
      'hash-password': this.hashPassword,
      'verify-password': this.verifyPassword,
      'generate-password': this.generatePassword,
      'mask-api-key': this.maskApiKey,
      'format-file-size': this.formatFileSize,
      'format-datetime': this.formatDateTime,
      'ensure-protocol': this.ensureProtocol,
      'benchmark': this.runBenchmark,
      'help': this.showHelp
    };
  }

  async run() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args[0] === 'help') {
      this.showHelp();
      return;
    }

    const [command, ...commandArgs] = args;
    
    if (!this.commands[command]) {
      console.error(`❌ Unknown command: ${command}`);
      console.log('Run "npx qgenutils help" for available commands');
      process.exit(1);
    }

    try {
      await this.commands[command].call(this, commandArgs);
    } catch (error) {
      console.error(`❌ Error in ${command}:`, error.message);
      process.exit(1);
    }
  }

  async validateEmail([email]) {
    if (!email) {
      console.error('❌ Email address is required');
      console.log('Usage: npx qgenutils validate-email <email>');
      process.exit(1);
    }

    const isValid = QGenUtils.validateEmail(email);
    const result = {
      email,
      isValid,
      message: isValid ? '✅ Valid email format' : '❌ Invalid email format'
    };

    console.log(JSON.stringify(result, null, 2));
  }

  async validateUrl([url]) {
    if (!url) {
      console.error('❌ URL is required');
      console.log('Usage: npx qgenutils validate-url <url>');
      process.exit(1);
    }

    const isValid = QGenUtils.validateUrl(url);
    const result = {
      url,
      isValid,
      message: isValid ? '✅ Valid URL format' : '❌ Invalid URL format'
    };

    console.log(JSON.stringify(result, null, 2));
  }

  async hashPassword(args) {
    const parsedArgs = this.parseArgs(args, ['password', 'rounds', 'salt']);
    const { password, rounds = 12, salt } = parsedArgs;

    if (!password) {
      console.error('❌ Password is required');
      console.log('Usage: npx qgenutils hash-password --password <password> [--rounds <number>]');
      process.exit(1);
    }

    console.log('🔒 Hashing password...');
    const startTime = Date.now();
    
    const hashedPassword = await QGenUtils.hashPassword(password, { rounds, salt });
    const duration = Date.now() - startTime;

    const result = {
      password: '***HIDDEN***',
      hashedPassword,
      rounds,
      duration: `${duration}ms`,
      strength: this.getPasswordStrength(password)
    };

    console.log(JSON.stringify(result, null, 2));
  }

  async verifyPassword(args) {
    const parsedArgs = this.parseArgs(args, ['password', 'hash']);
    const { password, hash } = parsedArgs;

    if (!password || !hash) {
      console.error('❌ Password and hash are required');
      console.log('Usage: npx qgenutils verify-password --password <password> --hash <hash>');
      process.exit(1);
    }

    console.log('🔐 Verifying password...');
    const isValid = await QGenUtils.verifyPassword(password, hash);

    const result = {
      isValid,
      message: isValid ? '✅ Password is correct' : '❌ Password is incorrect'
    };

    console.log(JSON.stringify(result, null, 2));
  }

  async generatePassword(args) {
    const parsedArgs = this.parseArgs(args, ['length', 'includeSymbols']);
    const { length = 16, includeSymbols = true } = parsedArgs;

    console.log('🔑 Generating secure password...');
    const password = QGenUtils.generateSecurePassword({ 
      length, 
      includeSymbols,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true
    });

    const result = {
      password,
      length: password.length,
      hasSymbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      strength: this.getPasswordStrength(password)
    };

    console.log(JSON.stringify(result, null, 2));
  }

  async maskApiKey([apiKey]) {
    if (!apiKey) {
      console.error('❌ API key is required');
      console.log('Usage: npx qgenutils mask-api-key <api-key>');
      process.exit(1);
    }

    const masked = QGenUtils.maskApiKey(apiKey);
    console.log(JSON.stringify(masked, null, 2));
  }

  async formatFileSize([size]) {
    if (!size) {
      console.error('❌ File size is required');
      console.log('Usage: npx qgenutils format-file-size <bytes>');
      process.exit(1);
    }

    const bytes = parseInt(size, 10);
    if (isNaN(bytes)) {
      console.error('❌ Invalid file size: must be a number');
      process.exit(1);
    }

    const formatted = QGenUtils.formatFileSize(bytes);
    console.log(JSON.stringify(formatted, null, 2));
  }

  async formatDateTime(args) {
    const parsedArgs = this.parseArgs(args, ['date', 'format']);
    const { date = new Date(), format = 'default' } = parsedArgs;

    let targetDate;
    if (date === 'now') {
      targetDate = new Date();
    } else if (date) {
      targetDate = new Date(date);
      if (isNaN(targetDate.getTime())) {
        console.error('❌ Invalid date format');
        process.exit(1);
      }
    } else {
      targetDate = new Date();
    }

    const formatted = QGenUtils.formatDateTime(targetDate, { format });
    console.log(JSON.stringify(formatted, null, 2));
  }

  async ensureProtocol(args) {
    const parsedArgs = this.parseArgs(args, ['url', 'protocol']);
    const { url, protocol = 'https' } = parsedArgs;

    if (!url) {
      console.error('❌ URL is required');
      console.log('Usage: npx qgenutils ensure-protocol --url <url> [--protocol <protocol>]');
      process.exit(1);
    }

    const result = QGenUtils.ensureProtocol(url, protocol);
    console.log(JSON.stringify(result, null, 2));
  }

  async runBenchmark() {
    console.log('🏃‍♂️ Running QGenUtils performance benchmark...');
    
    const tests = [
      {
        name: 'Email Validation',
        test: () => QGenUtils.validateEmail('test@example.com'),
        iterations: 10000
      },
      {
        name: 'Password Hashing',
        test: async () => await QGenUtils.hashPassword('test'),
        iterations: 100
      },
      {
        name: 'File Size Formatting',
        test: () => QGenUtils.formatFileSize(1048576),
        iterations: 5000
      },
      {
        name: 'URL Protocol',
        test: () => QGenUtils.ensureProtocol('example.com'),
        iterations: 8000
      }
    ];

    const results = [];
    
    for (const test of tests) {
      const startTime = performance.now();
      
      for (let i = 0; i < test.iterations; i++) {
        if (test.constructor.name === 'AsyncFunction') {
          await test.test();
        } else {
          test.test();
        }
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / test.iterations;
      const opsPerSec = 1000 / avgTime;
      
      results.push({
        name: test.name,
        iterations: test.iterations,
        totalTime: Math.round(totalTime * 1000) / 1000,
        avgTime: Math.round(avgTime * 1000000) / 1000000,
        opsPerSec: Math.round(opsPerSec)
      });
    }

    console.log('\n📊 Benchmark Results:');
    console.log('═'.repeat(50));
    
    results.forEach(result => {
      console.log(`\n${result.name}:`);
      console.log(`  📊 Operations/sec: ${result.opsPerSec.toLocaleString()}`);
      console.log(`  ⏱️  Average time: ${result.avgTime}ms`);
      console.log(`  🔄 Total iterations: ${result.iterations.toLocaleString()}`);
      console.log(`  ⏱️  Total time: ${result.totalTime}ms`);
    });

    console.log('\n' + '═'.repeat(50));
  }

  parseArgs(args, expectedFlags) {
    const parsed = {};
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg.startsWith('--')) {
        const flag = arg.substring(2);
        const nextArg = args[i + 1];
        
        if (expectedFlags.includes(flag) && nextArg && !nextArg.startsWith('--')) {
          parsed[flag] = nextArg;
          i++; // Skip next arg as it's a value
        } else {
          parsed[flag] = true;
        }
      } else if (!parsed.value) {
        parsed.value = arg;
      }
    }
    
    return parsed;
  }

  getPasswordStrength(password) {
    let score = 0;
    const feedback = [];

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Use at least 8 characters');
    }

    if (password.length >= 12) {
      score += 1;
    }

    // Character variety checks
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include lowercase letters');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include uppercase letters');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include numbers');
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include special characters');
    }

    let strength;
    if (score >= 5) {
      strength = 'very strong';
    } else if (score >= 4) {
      strength = 'strong';
    } else if (score >= 3) {
      strength = 'moderate';
    } else if (score >= 2) {
      strength = 'weak';
    } else {
      strength = 'very weak';
    }

    return {
      score: Math.min(score, 5),
      strength,
      feedback: feedback.length > 0 ? feedback : ['Password is strong']
    };
  }

  showHelp() {
    console.log(`
🛠️  QGenUtils CLI Tool

Usage: npx qgenutils <command> [options]

Available Commands:

📧 Validation Commands:
  validate-email <email>                 Validate email format
  validate-url <url>                    Validate URL format

🔒 Security Commands:
  hash-password --password <pass>         Hash password with bcrypt
    [--rounds <number>]                Number of hashing rounds (default: 12)
    [--salt <salt>]                     Optional salt
  verify-password --password <pass>         Verify password against hash
    --hash <bcrypt-hash>                  Bcrypt hash to verify against
  generate-password                        Generate secure password
    [--length <number>]                 Password length (default: 16)
    [--include-symbols]                  Include special characters
  mask-api-key <api-key>                Mask API key for logging

📄 Utility Commands:
  format-file-size <bytes>               Format file size to human readable
  format-datetime [--date <date>]          Format date/time
    [--format <format>]                  Format type (default, date, time, iso)
  ensure-protocol --url <url>            Ensure URL has protocol
    [--protocol <protocol>]              Protocol to use (default: https)

🏃‍♂️ Performance Commands:
  benchmark                              Run performance benchmarks

📚 Help Commands:
  help                                   Show this help message

Examples:
  npx qgenutils validate-email user@example.com
  npx qgenutils hash-password --password mypass123 --rounds 10
  npx qgenutils generate-password --length 20 --include-symbols
  npx qgenutils format-file-size 1048576
  npx qgenutils benchmark

All commands output JSON results for easy scripting.
`);
  }
}

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new QGenUtilsCLI();
  cli.run();
}

export default QGenUtilsCLI;