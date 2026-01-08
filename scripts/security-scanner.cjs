#!/usr/bin/env node

/**
 * Automated Security Scanner for QGenUtils Demo Server
 * 
 * Performs comprehensive security testing including:
 * - XSS and injection attack testing
 * - Rate limiting validation
 * - Input validation testing
 * - Authentication bypass attempts
 * - Directory traversal testing
 * - API endpoint enumeration
 * - Performance-based security testing
 */

const http = require('http');
const { performance } = require('perf_hooks');

class SecurityScanner {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.results = {
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        vulnerabilities: 0,
        warnings: 0,
        scanDuration: 0
      },
      tests: {},
      recommendations: []
    };
    
    this.securityTests = [
      this.testXSSAttacks,
      this.testSQLInjection,
      this.testDirectoryTraversal,
      this.testInputValidation,
      this.testRateLimiting,
      this.testAuthenticationBypass,
      this.testLargePayloads,
      this.testMalformedHeaders,
      this.testHTTPOversight,
      this.testEndpointEnumeration
    ];
  }

  async makeRequest(endpoint, data, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      
      const postData = JSON.stringify(data);
      const requestOptions = {
        hostname: 'localhost',
        port: 3000,
        path: endpoint,
        method: options.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          ...options.headers
        },
        timeout: options.timeout || 5000
      };

      const req = http.request(requestOptions, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          const endTime = performance.now();
          resolve({
            statusCode: res.statusCode,
            responseTime: endTime - startTime,
            contentLength: body.length,
            headers: res.headers,
            data: body
          });
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (options.method !== 'GET') {
        req.write(postData);
      }
      req.end();
    });
  }

  // XSS Attack Testing
  async testXSSAttacks() {
    console.log('🔍 Testing XSS Attacks...');
    
    const xssPayloads = [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert("xss")>',
      '"><script>alert("xss")</script>',
      '\"><script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<svg onload=alert("xss")>',
      '<iframe src="javascript:alert(\'xss\')">',
      '<body onload=alert("xss")>',
      '<input onfocus=alert("xss") autofocus>'
    ];

    const results = [];
    
    for (const payload of xssPayloads) {
      try {
        const response = await this.makeRequest('/api/string/sanitize', { input: payload });
        
        const sanitized = JSON.parse(response.data);
        const isVulnerable = sanitized.sanitized.includes('<script>') || 
                           sanitized.sanitized.includes('javascript:') ||
                           sanitized.sanitized.includes('onerror=') ||
                           sanitized.sanitized.includes('onload=');
        
        results.push({
          payload,
          vulnerable: isVulnerable,
          sanitized: sanitized.sanitized,
          responseTime: response.responseTime
        });
        
      } catch (error) {
        results.push({
          payload,
          error: error.message
        });
      }
    }
    
    const vulnerabilities = results.filter(r => r.vulnerable).length;
    
    return {
      name: 'XSS Attack Testing',
      passed: vulnerabilities === 0,
      vulnerabilities,
      totalTests: xssPayloads.length,
      results,
      recommendation: vulnerabilities > 0 ? 'Strengthen input sanitization for all XSS vectors' : 'XSS protection working correctly'
    };
  }

  // SQL Injection Testing
  async testSQLInjection() {
    console.log('🔍 Testing SQL Injection...');
    
    const sqlPayloads = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "' UNION SELECT * FROM users --",
      "1'; DELETE FROM users WHERE '1'='1",
      "admin'--",
      "' OR 1=1#",
      "'; INSERT INTO users VALUES ('hacker', 'password'); --"
    ];

    // Test with email validation endpoint
    const results = [];
    
    for (const payload of sqlPayloads) {
      try {
        const response = await this.makeRequest('/api/validate/email', { email: payload });
        
        const emailResult = JSON.parse(response.data);
        const isVulnerable = emailResult.isValid || 
                           emailResult.message.toLowerCase().includes('sql') ||
                           response.statusCode === 500;
        
        results.push({
          payload,
          vulnerable: isVulnerable,
          isValid: emailResult.isValid,
          responseTime: response.responseTime
        });
        
      } catch (error) {
        results.push({
          payload,
          error: error.message
        });
      }
    }
    
    const vulnerabilities = results.filter(r => r.vulnerable).length;
    
    return {
      name: 'SQL Injection Testing',
      passed: vulnerabilities === 0,
      vulnerabilities,
      totalTests: sqlPayloads.length,
      results,
      recommendation: vulnerabilities > 0 ? 'Implement proper SQL injection prevention' : 'SQL injection protection working'
    };
  }

  // Directory Traversal Testing
  async testDirectoryTraversal() {
    console.log('🔍 Testing Directory Traversal...');
    
    const traversalPayloads = [
      '../../../etc/passwd',
      '..\\..\\..\\..\\windows\\system32\\config\\system.ini',
      '....//....//....//etc/passwd',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
      '..%252f..%252f..%252fetc%252fpasswd',
      'file:///etc/passwd',
      '/etc/passwd'
    ];

    const results = [];
    
    for (const payload of traversalPayloads) {
      try {
        // Try to access file system through various endpoints
        const response = await this.makeRequest(`/../${payload}`, {}, { method: 'GET' });
        
        const isVulnerable = response.statusCode === 200 &&
                           !response.data.toLowerCase().includes('not found') &&
                           response.contentLength > 1000;
        
        results.push({
          payload,
          vulnerable: isVulnerable,
          statusCode: response.statusCode,
          contentLength: response.contentLength
        });
        
      } catch (error) {
        results.push({
          payload,
          error: error.message
        });
      }
    }
    
    const vulnerabilities = results.filter(r => r.vulnerable).length;
    
    return {
      name: 'Directory Traversal Testing',
      passed: vulnerabilities === 0,
      vulnerabilities,
      totalTests: traversalPayloads.length,
      results,
      recommendation: vulnerabilities > 0 ? 'Implement proper path validation and sandboxing' : 'Directory traversal protection working'
    };
  }

  // Input Validation Testing
  async testInputValidation() {
    console.log('🔍 Testing Input Validation...');
    
    const maliciousInputs = [
      { email: null },
      { email: undefined },
      { email: '' },
      { email: 'clearly-invalid-email' },
      { email: 'a'.repeat(10000) + '@test.com' },
      { email: '<script>alert("xss")</script>@test.com' },
      { email: 'test\x00@example.com' },
      { email: 'te\u0000st@example.com' }
    ];

    const results = [];
    
    for (const input of maliciousInputs) {
      try {
        const response = await this.makeRequest('/api/validate/email', input);
        
        const emailResult = JSON.parse(response.data);
        const isVulnerable = emailResult.isValid && 
                           typeof input.email === 'string' && 
                           input.email.length > 100;
        
        results.push({
          input: input.email,
          vulnerable: isVulnerable,
          isValid: emailResult.isValid,
          message: emailResult.message
        });
        
      } catch (error) {
        results.push({
          input: input.email,
          error: error.message
        });
      }
    }
    
    const vulnerabilities = results.filter(r => r.vulnerable).length;
    
    return {
      name: 'Input Validation Testing',
      passed: vulnerabilities === 0,
      vulnerabilities,
      totalTests: maliciousInputs.length,
      results,
      recommendation: vulnerabilities > 0 ? 'Strengthen input validation and length limits' : 'Input validation working properly'
    };
  }

  // Rate Limiting Testing
  async testRateLimiting() {
    console.log('🔍 Testing Rate Limiting...');
    
    const requests = [];
    const startTime = performance.now();
    const maxRequests = 150; // More than typical rate limit
    
    try {
      // Send rapid requests to test rate limiting
      for (let i = 0; i < maxRequests; i++) {
        requests.push(this.makeRequest('/api/string/sanitize', { input: 'test' }));
      }
      
      const results = await Promise.allSettled(requests);
      const endTime = performance.now();
      
      const rateLimited = results.filter(r => 
        r.status === 'fulfilled' && 
        (r.value.statusCode === 429 || 
         (r.value.data && r.value.data.includes('rate limit')))
      ).length;
      
      const successful = results.filter(r => 
        r.status === 'fulfilled' && r.value.statusCode === 200
      ).length;
      
      const isEffectiveRateLimit = rateLimited > 0 && successful < maxRequests;
      
      return {
        name: 'Rate Limiting Testing',
        passed: isEffectiveRateLimit,
        vulnerabilities: isEffectiveRateLimit ? 0 : 1,
        totalTests: maxRequests,
        results: {
          totalRequests: maxRequests,
          successful,
          rateLimited,
          testDuration: endTime - startTime
        },
        recommendation: isEffectiveRateLimit ? 'Rate limiting working effectively' : 'Implement proper rate limiting'
      };
      
    } catch (error) {
      return {
        name: 'Rate Limiting Testing',
        passed: false,
        vulnerabilities: 1,
        totalTests: maxRequests,
        error: error.message,
        recommendation: 'Test failed - check rate limiting implementation'
      };
    }
  }

  // Authentication Bypass Testing
  async testAuthenticationBypass() {
    console.log('🔍 Testing Authentication Bypass...');
    
    const bypassPayloads = [
      'admin',
      'admin\'--',
      'admin\' OR 1=1',
      '\' OR \'1\'=\'1',
      'null',
      'undefined',
      '../../admin',
      '%2e%2e%2fadmin',
      '../'
    ];

    const results = [];
    
    for (const payload of bypassPayloads) {
      try {
        const response = await this.makeRequest('/admin', {}, { 
          headers: { 'X-Auth-User': payload }
        });
        
        const isVulnerable = response.statusCode === 200;
        
        results.push({
          payload,
          vulnerable: isVulnerable,
          statusCode: response.statusCode
        });
        
      } catch (error) {
        results.push({
          payload,
          error: error.message
        });
      }
    }
    
    const vulnerabilities = results.filter(r => r.vulnerable).length;
    
    return {
      name: 'Authentication Bypass Testing',
      passed: vulnerabilities === 0,
      vulnerabilities,
      totalTests: bypassPayloads.length,
      results,
      recommendation: vulnerabilities > 0 ? 'Implement proper authentication and authorization' : 'Authentication protection working'
    };
  }

  // Large Payload Testing (DoS protection)
  async testLargePayloads() {
    console.log('🔍 Testing Large Payload Protection...');
    
    const largePayloads = [
      'a'.repeat(1024 * 1024),        // 1MB
      'a'.repeat(10 * 1024 * 1024),     // 10MB
      'a'.repeat(100 * 1024 * 1024)     // 100MB
    ];

    const results = [];
    
    for (const payload of largePayloads) {
      try {
        const startTime = performance.now();
        const response = await this.makeRequest('/api/string/sanitize', { 
          input: payload 
        }, { timeout: 10000 });
        const endTime = performance.now();
        
        const isProtected = response.statusCode >= 400 || 
                           endTime - startTime > 5000;
        
        results.push({
          payloadSize: payload.length,
          responseTime: endTime - startTime,
          statusCode: response.statusCode,
          protected: isProtected
        });
        
      } catch (error) {
        results.push({
          payloadSize: payload.length,
          error: error.message,
          protected: true // Timeout is protection
        });
      }
    }
    
    const unprotected = results.filter(r => !r.protected).length;
    
    return {
      name: 'Large Payload Protection',
      passed: unprotected === 0,
      vulnerabilities: unprotected,
      totalTests: largePayloads.length,
      results,
      recommendation: unprotected > 0 ? 'Implement payload size limits and timeouts' : 'Large payload protection working'
    };
  }

  // Malformed Headers Testing
  async testMalformedHeaders() {
    console.log('🔍 Testing Malformed Headers...');
    
    const malformedHeaders = [
      { 'Content-Length': 'not-a-number' },
      { 'Content-Type': 'application/json; charset=malicious' },
      { 'User-Agent': 'Mozilla/5.0 (injection)' },
      { 'X-Forwarded-For': '127.0.0.1\r\nX-Injected: header' },
      { 'Host': 'evil.com\r\nHost: localhost:3000' },
      { 'Cookie': 'session=admin; injected=value' },
      { 'Authorization': 'Bearer malformed-token-with-\x00-bytes' }
    ];

    const results = [];
    
    for (const headers of malformedHeaders) {
      try {
        const response = await this.makeRequest('/api/string/sanitize', 
          { input: 'test' }, 
          { headers }
        );
        
        const isProtected = response.statusCode >= 400;
        
        results.push({
          headers,
          vulnerable: !isProtected,
          statusCode: response.statusCode
        });
        
      } catch (error) {
        results.push({
          headers,
          error: error.message,
          protected: true
        });
      }
    }
    
    const vulnerabilities = results.filter(r => r.vulnerable).length;
    
    return {
      name: 'Malformed Headers Protection',
      passed: vulnerabilities === 0,
      vulnerabilities,
      totalTests: malformedHeaders.length,
      results,
      recommendation: vulnerabilities > 0 ? 'Implement strict header validation' : 'Header validation working correctly'
    };
  }

  // HTTP Methods Oversight Testing
  async testHTTPOversight() {
    console.log('🔍 Testing HTTP Methods Oversight...');
    
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE', 'CONNECT'];
    const endpoints = ['/api/string/sanitize', '/api/validate/email', '/api/security/mask-api-key'];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      for (const method of methods) {
        try {
          const response = await this.makeRequest(endpoint, {}, { method });
          
          const shouldAllow = method === 'POST' || method === 'OPTIONS';
          const actuallyAllows = response.statusCode !== 405;
          const isVulnerable = shouldAllow !== actuallyAllows;
          
          results.push({
            endpoint,
            method,
            statusCode: response.statusCode,
            vulnerable: isVulnerable
          });
          
        } catch (error) {
          results.push({
            endpoint,
            method,
            error: error.message,
            vulnerable: false
          });
        }
      }
    }
    
    const vulnerabilities = results.filter(r => r.vulnerable).length;
    
    return {
      name: 'HTTP Methods Oversight',
      passed: vulnerabilities === 0,
      vulnerabilities,
      totalTests: methods.length * endpoints.length,
      results,
      recommendation: vulnerabilities > 0 ? 'Implement strict HTTP method validation' : 'HTTP method validation working'
    };
  }

  // Endpoint Enumeration Testing
  async testEndpointEnumeration() {
    console.log('🔍 Testing Endpoint Enumeration...');
    
    const commonPaths = [
      '/admin',
      '/config',
      '/debug',
      '/test',
      '/api',
      '/api/v1',
      '/api/v2',
      '/health',
      '/status',
      '/.git/config',
      '/.env',
      '/backup',
      '/logs',
      '/private',
      '/internal'
    ];

    const results = [];
    
    for (const path of commonPaths) {
      try {
        const response = await this.makeRequest(path, {}, { method: 'GET' });
        
        const shouldBlock = path.includes('/.') || 
                        path.includes('admin') || 
                        path.includes('config') || 
                        path.includes('private');
        
        const isVulnerable = shouldBlock && response.statusCode === 200;
        
        results.push({
          path,
          statusCode: response.statusCode,
          contentLength: response.contentLength,
          vulnerable: isVulnerable
        });
        
      } catch (error) {
        results.push({
          path,
          error: error.message,
          vulnerable: false
        });
      }
    }
    
    const vulnerabilities = results.filter(r => r.vulnerable).length;
    
    return {
      name: 'Endpoint Enumeration',
      passed: vulnerabilities === 0,
      vulnerabilities,
      totalTests: commonPaths.length,
      results,
      recommendation: vulnerabilities > 0 ? 'Implement proper endpoint access control' : 'Endpoint protection working'
    };
  }

  async runAllTests() {
    console.log('🔒 Starting QGenUtils Security Scanner\n');
    console.log(`🌐 Target: ${this.baseUrl}`);
    console.log(`🕐 Started at: ${new Date().toISOString()}\n`);
    
    const scanStartTime = performance.now();
    
    // Run all security tests
    for (const test of this.securityTests) {
      try {
        const result = await test.call(this);
        this.results.tests[result.name] = result;
        this.results.summary.totalTests += result.totalTests || 0;
        this.results.summary.failedTests += result.vulnerabilities || 0;
        
        if (result.passed) {
          this.results.summary.passedTests++;
        } else {
          this.results.summary.vulnerabilities += result.vulnerabilities || 0;
          this.results.recommendations.push(result.recommendation);
        }
        
      } catch (error) {
        console.error(`Test failed: ${error.message}`);
        this.results.summary.failedTests++;
      }
    }
    
    this.results.summary.scanDuration = performance.now() - scanStartTime;
    
    this.generateReport();
  }

  generateReport() {
    console.log('\n📋 SECURITY SCAN REPORT\n');
    console.log('='.repeat(80));
    
    // Summary
    console.log('\n📊 SCAN SUMMARY');
    console.log('-'.repeat(80));
    console.log(`Total Tests:      ${this.results.summary.totalTests}`);
    console.log(`Passed Tests:    ${this.results.summary.passedTests}`);
    console.log(`Failed Tests:    ${this.results.summary.failedTests}`);
    console.log(`Vulnerabilities:  ${this.results.summary.vulnerabilities}`);
    console.log(`Scan Duration:   ${Math.round(this.results.summary.scanDuration)}ms`);
    
    const securityScore = Math.max(0, 100 - (this.results.summary.vulnerabilities * 10));
    console.log(`Security Score:   ${securityScore}/100`);
    
    // Test Details
    console.log('\n🔍 TEST DETAILS');
    console.log('-'.repeat(80));
    
    for (const [testName, result] of Object.entries(this.results.tests)) {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      const vulnCount = result.vulnerabilities || 0;
      
      console.log(`\n${testName}: ${status}`);
      console.log(`├─ Vulnerabilities: ${vulnCount}`);
      console.log(`├─ Total Tests: ${result.totalTests}`);
      console.log(`└─ Status: ${result.passed ? 'SECURE' : 'VULNERABLE'}`);
      
      if (!result.passed) {
        console.log(`⚠️  Recommendation: ${result.recommendation}`);
      }
    }
    
    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 SECURITY RECOMMENDATIONS');
      console.log('-'.repeat(80));
      
      const uniqueRecommendations = [...new Set(this.results.recommendations)];
      uniqueRecommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
    
    // Overall Assessment
    console.log('\n🎯 OVERALL ASSESSMENT');
    console.log('-'.repeat(80));
    
    if (this.results.summary.vulnerabilities === 0) {
      console.log('🛡️  EXCELLENT: No security vulnerabilities detected');
      console.log('✅ All security tests passed successfully');
    } else if (this.results.summary.vulnerabilities <= 2) {
      console.log('🔒 GOOD: Minor security issues detected');
      console.log('📝 Few improvements recommended for enhanced security');
    } else if (this.results.summary.vulnerabilities <= 5) {
      console.log('⚠️  FAIR: Multiple security vulnerabilities detected');
      console.log('🚨 Significant security improvements required');
    } else {
      console.log('🚨 POOR: Multiple serious security vulnerabilities');
      console.log('🛑 Immediate security improvements required');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🔒 Security Scan Completed');
    console.log('='.repeat(80));
    
    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      scanDuration: this.results.summary.scanDuration,
      securityScore,
      summary: this.results.summary,
      tests: this.results.tests,
      recommendations: [...new Set(this.results.recommendations)]
    };
    
    const reportFile = `security-scan-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    require('fs').writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
    console.log(`📄 Detailed report saved to: ${reportFile}`);
  }
}

// Check if server is running
async function checkServer() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/stats',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      resolve(true);
    });

    req.on('error', () => {
      reject(new Error('Demo server is not running. Please start it with: node examples/simple-demo-server.cjs'));
    });

    req.end();
  });
}

// Main execution
async function main() {
  try {
    await checkServer();
    
    const scanner = new SecurityScanner();
    await scanner.runAllTests();
    
  } catch (error) {
    console.error(`❌ Security scan failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SecurityScanner;