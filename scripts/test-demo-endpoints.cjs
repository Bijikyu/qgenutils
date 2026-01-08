#!/usr/bin/env node

/**
 * Integration Tests for QGenUtils Demo Server
 * 
 * Tests all API endpoints with various input scenarios including:
 * - Valid requests
 * - Invalid requests  
 * - Edge cases
 * - Security testing
 * - Performance validation
 */

const http = require('http');
const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:3000';
const TEST_TIMEOUT = 5000;

class IntegrationTestSuite {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      errors: [],
      performance: {}
    };
  }

  async makeRequest(endpoint, data, expectedStatus = 200) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      
      const postData = JSON.stringify(data);
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: endpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          const endTime = performance.now();
          const responseTime = endTime - startTime;
          
          try {
            const parsedBody = JSON.parse(body);
            resolve({
              statusCode: res.statusCode,
              data: parsedBody,
              responseTime,
              headers: res.headers
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              data: body,
              responseTime,
              headers: res.headers
            });
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.setTimeout(TEST_TIMEOUT, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.write(postData);
      req.end();
    });
  }

  async test(description, endpoint, data, validator, expectedStatus = 200) {
    this.results.total++;
    console.log(`🧪 Testing: ${description}`);
    
    try {
      const response = await this.makeRequest(endpoint, data, expectedStatus);
      
      if (response.statusCode !== expectedStatus) {
        throw new Error(`Expected status ${expectedStatus}, got ${response.statusCode}`);
      }
      
      if (validator && !validator(response.data)) {
        throw new Error('Validator failed');
      }
      
      this.results.passed++;
      console.log(`✅ ${description} (${response.responseTime.toFixed(2)}ms)`);
      
      return response;
    } catch (error) {
      this.results.failed++;
      this.results.errors.push({
        description,
        error: error.message,
        endpoint,
        data
      });
      console.log(`❌ ${description} - ${error.message}`);
      throw error;
    }
  }

  async runValidationTests() {
    console.log('\n📧 Running Validation Tests...\n');

    // Email validation tests
    await this.test(
      'Valid email validation',
      '/api/validate/email',
      { email: 'user@example.com' },
      (data) => data.isValid === true && data.message.includes('Valid')
    );

    await this.test(
      'Invalid email validation',
      '/api/validate/email',
      { email: 'invalid-email' },
      (data) => data.isValid === false && data.message.includes('Invalid')
    );

    // Password validation tests
    await this.test(
      'Strong password validation',
      '/api/validate/password',
      { password: 'MySecureP@ss123!' },
      (data) => data.isValid === true && data.strength >= 4
    );

    await this.test(
      'Weak password validation',
      '/api/validate/password',
      { password: 'weak' },
      (data) => data.isValid === false && data.suggestions.length > 0
    );
  }

  async runSecurityTests() {
    console.log('\n🔒 Running Security Tests...\n');

    await this.test(
      'API key masking',
      '/api/security/mask-api-key',
      { apiKey: 'sk-test1234567890abcdefghijklmnopqrstuvwxyz' },
      (data) => data.masked.includes('****') && data.masked !== data.original
    );

    await this.test(
      'Short API key masking',
      '/api/security/mask-api-key',
      { apiKey: 'short' },
      (data) => data.masked && data.masked.length >= 4
    );
  }

  async runStringTests() {
    console.log('\n📝 Running String Processing Tests...\n');

    await this.test(
      'HTML tag removal',
      '/api/string/sanitize',
      { input: '<script>alert("xss")</script>Hello World' },
      (data) => data.sanitized === 'Hello World' && data.changed === true
    );

    await this.test(
      'JavaScript protocol removal',
      '/api/string/sanitize',
      { input: 'javascript:alert("xss")Hello' },
      (data) => !data.sanitized.includes('javascript:') && data.changed === true
    );

    await this.test(
      'Clean string unchanged',
      '/api/string/sanitize',
      { input: 'Hello World' },
      (data) => data.sanitized === data.original && data.changed === false
    );
  }

  async runUrlTests() {
    console.log('\n🌐 Running URL Processing Tests...\n');

    await this.test(
      'Add HTTPS protocol',
      '/api/url/ensure-protocol',
      { url: 'example.com', protocol: 'https' },
      (data) => data.processed === 'https://example.com' && data.added === true
    );

    await this.test(
      'Preserve existing protocol',
      '/api/url/ensure-protocol',
      { url: 'http://example.com', protocol: 'https' },
      (data) => data.processed === 'http://example.com' && data.added === false
    );

    await this.test(
      'Handle leading slashes',
      '/api/url/ensure-protocol',
      { url: '//example.com', protocol: 'https' },
      (data) => data.processed === 'https://example.com' && data.added === true
    );
  }

  async runFileTests() {
    console.log('\n📄 Running File Utilities Tests...\n');

    await this.test(
      'Format bytes to MB',
      '/api/file/format-size',
      { bytes: 1048576 },
      (data) => data.formatted === '1.00 MB' && data.unit === 'MB'
    );

    await this.test(
      'Format bytes to GB',
      '/api/file/format-size',
      { bytes: 1073741824 },
      (data) => data.formatted === '1.00 GB' && data.unit === 'GB'
    );

    await this.test(
      'Handle zero bytes',
      '/api/file/format-size',
      { bytes: 0 },
      (data) => data.formatted === '0 B' && data.unit === 'B'
    );
  }

  async runPerformanceTests() {
    console.log('\n⚡ Running Performance Tests...\n');

    await this.test(
      'Function memoization',
      '/api/performance/memoize',
      { 
        function: '(a, b) => a + b',
        args: [5, 3]
      },
      (data) => {
        return data.demo && 
               data.demo.length === 3 &&
               data.demo[0].fromCache === false &&
               data.demo[1].fromCache === true &&
               data.demo[2].fromCache === true;
      }
    );
  }

  async runCollectionTests() {
    console.log('\n📁 Running Collections Tests...\n');

    await this.test(
      'Array group by',
      '/api/collections/group-by',
      {
        array: [
          { name: 'John', dept: 'IT' },
          { name: 'Jane', dept: 'HR' },
          { name: 'Bob', dept: 'IT' }
        ],
        key: 'dept'
      },
      (data) => data.IT && data.IT.length === 2 && data.HR && data.HR.length === 1
    );
  }

  async runDateTimeTests() {
    console.log('\n📅 Running DateTime Tests...\n');

    await this.test(
      'Date formatting',
      '/api/datetime/format',
      { date: '2024-01-15T10:30:00Z' },
      (data) => data.formatted && data.timestamp > 0
    );

    await this.test(
      'Invalid date handling',
      '/api/datetime/format',
      { date: 'invalid-date' },
      (data) => data.error && data.input === 'invalid-date'
    );
  }

  async runErrorTests() {
    console.log('\n🚨 Running Error Handling Tests...\n');

    await this.test(
      'Unknown endpoint returns 404',
      '/api/unknown/endpoint',
      { test: 'data' },
      (data) => data.error && data.error.includes('Unknown endpoint'),
      404
    );

    await this.test(
      'Invalid JSON handling',
      '/api/validate/email',
      null,
      (data) => true, // Should return some response
    );

    await this.test(
      'Empty input handling',
      '/api/string/sanitize',
      { input: null },
      (data) => data.sanitized !== undefined
    );
  }

  async runAllTests() {
    console.log('🚀 Starting QGenUtils Demo Server Integration Tests\n');
    console.log(`🌐 Base URL: ${BASE_URL}`);
    console.log(`⏱️  Test Timeout: ${TEST_TIMEOUT}ms\n`);

    try {
      // Run all test suites
      await this.runValidationTests();
      await this.runSecurityTests();
      await this.runStringTests();
      await this.runUrlTests();
      await this.runFileTests();
      await this.runPerformanceTests();
      await this.runCollectionTests();
      await this.runDateTimeTests();
      await this.runErrorTests();

    } catch (error) {
      console.log(`\n💥 Test suite crashed: ${error.message}`);
    }

    this.printResults();
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 INTEGRATION TEST RESULTS');
    console.log('='.repeat(60));
    
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Total:  ${this.results.total}`);
    
    const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    console.log(`🎯 Success Rate: ${successRate}%`);

    if (this.results.errors.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.description}`);
        console.log(`   ${error.error}`);
        console.log(`   Endpoint: ${error.endpoint}`);
        console.log(`   Data: ${JSON.stringify(error.data)}\n`);
      });
    }

    console.log('\n' + '='.repeat(60));
    
    if (this.results.failed === 0) {
      console.log('🎉 ALL TESTS PASSED! Demo server is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please check the errors above.');
    }
    
    console.log('='.repeat(60));
  }
}

// Check if server is running before starting tests
async function checkServer() {
  return new Promise((resolve, reject) => {
    // Wait a bit more for server to fully start
    setTimeout(async () => {
      const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/',
        method: 'GET',
        timeout: 5000
      }, (res) => {
        resolve(true);
      });

      req.on('error', () => {
        reject(new Error('Demo server is not running. Please start it with: node examples/simple-demo-server.cjs'));
      });

      req.on('timeout', () => {
        reject(new Error('Demo server is not responding. Please start it with: node examples/simple-demo-server.cjs'));
      });

      req.end();
    }, 2000);
  });
}

// Main execution
async function main() {
  try {
    await checkServer();
    
    const testSuite = new IntegrationTestSuite();
    await testSuite.runAllTests();
    
    process.exit(testSuite.results.failed === 0 ? 0 : 1);
    
  } catch (error) {
    console.error(`❌ Setup error: ${error.message}`);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

if (require.main === module) {
  main();
}

module.exports = IntegrationTestSuite;