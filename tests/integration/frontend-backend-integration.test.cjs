/**
 * Frontend-Backend Integration Tests
 * 
 * Purpose: Comprehensive testing of API endpoints and error handling
 * between frontend client and backend server.
 */

const http = require('http');
const { spawn } = require('child_process');

class IntegrationTestSuite {
  constructor() {
    this.serverProcess = null;
    this.serverUrl = 'http://localhost:3000';
    this.testResults = [];
    this.passedTests = 0;
    this.failedTests = 0;
  }

  /**
   * Start the demo server for testing
   */
  async startTestServer() {
    console.log('🚀 Starting test server...');
    
    return new Promise((resolve, reject) => {
      this.serverProcess = spawn('node', ['examples/simple-demo-server.cjs'], {
        stdio: 'pipe',
        cwd: process.cwd()
      });

      let serverOutput = '';
      
      this.serverProcess.stdout.on('data', (data) => {
        serverOutput += data.toString();
        if (serverOutput.includes('listening on http://localhost:3000')) {
          console.log('✅ Test server started successfully');
          setTimeout(resolve, 1000); // Give server time to fully start
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        console.error('Server error:', data.toString());
      });

      this.serverProcess.on('error', (error) => {
        reject(new Error(`Failed to start server: ${error.message}`));
      });

      this.serverProcess.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Server exited with code ${code}`));
        }
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!serverOutput.includes('listening on http://localhost:3000')) {
          reject(new Error('Server startup timeout'));
        }
      }, 10000);
    });
  }

  /**
   * Stop the test server
   */
  stopTestServer() {
    if (this.serverProcess) {
      console.log('🛑 Stopping test server...');
      this.serverProcess.kill('SIGTERM');
      this.serverProcess = null;
    }
  }

  /**
   * Make HTTP request for testing
   */
  async makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          try {
            const data = body ? JSON.parse(body) : {};
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: data
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: { error: 'Invalid JSON response', body }
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  /**
   * Run a single test
   */
  async runTest(name, testFunction) {
    console.log(`\n🧪 Running test: ${name}`);
    
    try {
      const result = await testFunction();
      
      if (result.passed) {
        console.log(`✅ ${name}: PASSED`);
        this.passedTests++;
      } else {
        console.log(`❌ ${name}: FAILED - ${result.reason}`);
        this.failedTests++;
      }
      
      this.testResults.push({
        name,
        passed: result.passed,
        reason: result.reason || '',
        details: result.details || {},
        duration: result.duration || 0
      });
      
    } catch (error) {
      console.log(`💥 ${name}: ERROR - ${error.message}`);
      this.failedTests++;
      this.testResults.push({
        name,
        passed: false,
        reason: error.message,
        details: { error: error.stack },
        duration: 0
      });
    }
  }

  /**
   * Test validation endpoints
   */
  async testValidationEndpoints() {
    await this.runTest('Email Validation - Valid Email', async () => {
      const response = await this.makeRequest('POST', '/api/validate/email', {
        email: 'test@example.com'
      });
      
      const passed = response.statusCode === 200 && response.data.isValid === true;
      return {
        passed,
        reason: passed ? '' : `Expected isValid=true, got ${response.data.isValid}`,
        details: response.data
      };
    });

    await this.runTest('Email Validation - Invalid Email', async () => {
      const response = await this.makeRequest('POST', '/api/validate/email', {
        email: 'invalid-email'
      });
      
      const passed = response.statusCode === 200 && response.data.isValid === false;
      return {
        passed,
        reason: passed ? '' : `Expected isValid=false, got ${response.data.isValid}`,
        details: response.data
      };
    });

    await this.runTest('Password Validation - Strong Password', async () => {
      const response = await this.makeRequest('POST', '/api/validate/password', {
        password: 'StrongP@ssw0rd123!'
      });
      
      const passed = response.statusCode === 200 && 
                   response.data.strength >= 4 &&
                   response.data.score >= 0.8;
      return {
        passed,
        reason: passed ? '' : `Expected strong password, got strength=${response.data.strength}`,
        details: response.data
      };
    });
  }

  /**
   * Test security endpoints
   */
  async testSecurityEndpoints() {
    await this.runTest('API Key Masking', async () => {
      const apiKey = 'sk-sensitive1234567890abcdef';
      const response = await this.makeRequest('POST', '/api/security/mask-api-key', {
        apiKey
      });
      
      const passed = response.statusCode === 200 && 
                   response.data.original === apiKey &&
                   response.data.masked.includes('****');
      return {
        passed,
        reason: passed ? '' : 'API key masking failed',
        details: response.data
      };
    });
  }

  /**
   * Test collections endpoints
   */
  async testCollectionsEndpoints() {
    await this.runTest('Collections - Group By', async () => {
      const testData = {
        array: [
          { name: 'John', category: 'A' },
          { name: 'Jane', category: 'B' },
          { name: 'Bob', category: 'A' }
        ],
        key: 'category'
      };
      
      const response = await this.makeRequest('POST', '/api/collections/group-by', testData);
      
      const passed = response.statusCode === 200 &&
                   response.data.A &&
                   response.data.B &&
                   response.data.A.length === 2 &&
                   response.data.B.length === 1;
      return {
        passed,
        reason: passed ? '' : 'Group by operation failed',
        details: response.data
      };
    });
  }

  /**
   * Test error handling
   */
  async testErrorHandling() {
    await this.runTest('Error Handling - Invalid Endpoint', async () => {
      const response = await this.makeRequest('POST', '/api/invalid/endpoint', {
        test: 'data'
      });
      
      const passed = response.statusCode === 404;
      return {
        passed,
        reason: passed ? '' : `Expected 404, got ${response.statusCode}`,
        details: { statusCode: response.statusCode, data: response.data }
      };
    });

    await this.runTest('Error Handling - Invalid Method', async () => {
      const response = await this.makeRequest('GET', '/api/validate/email');
      
      const passed = response.statusCode === 405;
      return {
        passed,
        reason: passed ? '' : `Expected 405, got ${response.statusCode}`,
        details: { statusCode: response.statusCode, data: response.data }
      };
    });

    await this.runTest('Error Handling - Invalid JSON', async () => {
      const response = await this.makeRequest('POST', '/api/validate/email', 'invalid-json');
      
      const passed = response.statusCode === 400 || response.statusCode === 200;
      return {
        passed,
        reason: passed ? '' : `Should handle invalid JSON gracefully`,
        details: { statusCode: response.statusCode, data: response.data }
      };
    });
  }

  /**
   * Test CORS functionality
   */
  async testCORS() {
    await this.runTest('CORS - OPTIONS Request', async () => {
      const response = await this.makeRequest('OPTIONS', '/api/validate/email');
      
      const passed = response.statusCode === 200 ||
                   response.statusCode === 204;
      return {
        passed,
        reason: passed ? '' : `CORS preflight failed`,
        details: { statusCode: response.statusCode, headers: response.headers }
      };
    });

    await this.runTest('CORS Headers', async () => {
      const response = await this.makeRequest('POST', '/api/validate/email', {
        email: 'test@example.com'
      });
      
      const hasCorsHeaders = response.headers['access-control-allow-origin'] ||
                          response.headers['Access-Control-Allow-Origin'];
      
      const passed = response.statusCode === 200 && hasCorsHeaders;
      return {
        passed,
        reason: passed ? '' : 'CORS headers missing',
        details: { 
          statusCode: response.statusCode, 
          headers: response.headers,
          hasCorsHeaders
        }
      };
    });
  }

  /**
   * Test performance and load
   */
  async testPerformance() {
    await this.runTest('Performance - Concurrent Requests', async () => {
      const concurrentRequests = 10;
      const requests = [];
      
      const startTime = Date.now();
      
      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(this.makeRequest('POST', '/api/validate/email', {
          email: `test${i}@example.com`
        }));
      }
      
      const results = await Promise.allSettled(requests);
      const endTime = Date.now();
      
      const successfulRequests = results.filter(r => 
        r.status === 'fulfilled' && r.value.statusCode === 200
      ).length;
      
      const duration = endTime - startTime;
      const passed = successfulRequests === concurrentRequests && duration < 5000;
      
      return {
        passed,
        reason: passed ? '' : `Only ${successfulRequests}/${concurrentRequests} requests succeeded in ${duration}ms`,
        details: {
          concurrentRequests,
          successfulRequests,
          duration,
          averageTime: duration / concurrentRequests
        }
      };
    });
  }

  /**
   * Run all integration tests
   */
  async runAllTests() {
    console.log('🎯 Starting Frontend-Backend Integration Tests\n');
    
    try {
      await this.startTestServer();
      
      // Run test suites
      await this.testValidationEndpoints();
      await this.testSecurityEndpoints();
      await this.testCollectionsEndpoints();
      await this.testErrorHandling();
      await this.testCORS();
      await this.testPerformance();
      
      // Print results
      this.printResults();
      
    } catch (error) {
      console.error('💥 Test suite failed:', error);
    } finally {
      this.stopTestServer();
    }
  }

  /**
   * Print test results summary
   */
  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`Passed: ${this.passedTests} ✅`);
    console.log(`Failed: ${this.failedTests} ❌`);
    console.log(`Success Rate: ${((this.passedTests / this.testResults.length) * 100).toFixed(1)}%`);
    
    if (this.failedTests > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.testResults
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`  • ${test.name}: ${test.reason}`);
        });
    }
    
    console.log('\n' + '='.repeat(60));
    
    // Save results to file
    const fs = require('fs');
    const resultsPath = 'agentRecords/integration-test-results.json';
    
    try {
      fs.writeFileSync(resultsPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: {
          total: this.testResults.length,
          passed: this.passedTests,
          failed: this.failedTests,
          successRate: (this.passedTests / this.testResults.length) * 100
        },
        tests: this.testResults
      }, null, 2));
      console.log(`📁 Detailed results saved to: ${resultsPath}`);
    } catch (error) {
      console.log(`⚠️  Could not save results: ${error.message}`);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const testSuite = new IntegrationTestSuite();
  testSuite.runAllTests().catch(console.error);
}

module.exports = IntegrationTestSuite;