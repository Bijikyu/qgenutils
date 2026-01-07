#!/usr/bin/env node

/**
 * Automated Testing Script for QGenUtils
 * 
 * Purpose: Provides comprehensive testing of build, demo server, and API functionality
 * Usage: node scripts/automated-test.js [options]
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const CONFIG = {
  demoServer: {
    port: 3000,
    startupTimeout: 5000,
    requestTimeout: 2000
  },
  tests: {
    timeout: 30000
  }
};

// Test results
let results = {
  build: { passed: false, error: null, duration: 0 },
  demo: { passed: false, error: null, duration: 0 },
  api: { passed: false, error: null, duration: 0 },
  overall: { passed: false, errors: [] }
};

/**
 * Execute command with promise
 */
function execCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🔧 Executing: ${command}`);
    
    const child = spawn(command, { 
      shell: true,
      stdio: 'pipe',
      ...options
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Success: ${command}`);
        resolve({ stdout, stderr, code });
      } else {
        console.log(`❌ Failed: ${command} (exit code: ${code})`);
        reject(new Error(`Command failed with exit code: ${code}\n${stderr}`));
      }
    });

    child.on('error', (error) => {
      console.log(`💥 Error: ${command} - ${error.message}`);
      reject(error);
    });
  });
}

/**
 * Test build process
 */
async function testBuild() {
  const startTime = Date.now();
  
  try {
    await execCommand('npm run build', { timeout: CONFIG.tests.timeout });
    results.build.duration = Date.now() - startTime;
    results.build.passed = true;
    console.log(`✅ Build test passed (${results.build.duration}ms)`);
  } catch (error) {
    results.build.duration = Date.now() - startTime;
    results.build.error = error.message;
    results.build.passed = false;
    console.log(`❌ Build test failed: ${error.message}`);
  }
}

/**
 * Test demo server
 */
async function testDemoServer() {
  const startTime = Date.now();
  
  try {
    // Start demo server in background
    const demoProcess = spawn('node', ['examples/simple-demo-server.cjs'], {
      stdio: 'pipe',
      detached: true
    });

    // Wait for server to start
    await new Promise((resolve, reject) => {
      let serverOutput = '';
      
      demoProcess.stdout.on('data', (data) => {
        serverOutput += data.toString();
      });

      demoProcess.on('error', reject);

      // Check for startup message
      const checkStartup = () => {
        if (serverOutput.includes('Simple Demo Server listening')) {
          console.log('✅ Demo server started successfully');
          demoProcess.unref(); // Allow parent to exit
          resolve();
        } else {
          setTimeout(checkStartup, 100);
        }
      };

      setTimeout(checkStartup, 100);
      setTimeout(() => {
        reject(new Error('Demo server failed to start within timeout'));
      }, CONFIG.demoServer.startupTimeout);
    });

    results.demo.duration = Date.now() - startTime;
    results.demo.passed = true;
    console.log(`✅ Demo server test passed (${results.demo.duration}ms)`);
    
    // Cleanup
    await execCommand('pkill -f simple-demo-server');
    
  } catch (error) {
    results.demo.duration = Date.now() - startTime;
    results.demo.error = error.message;
    results.demo.passed = false;
    console.log(`❌ Demo server test failed: ${error.message}`);
  }
}

/**
 * Test API endpoints
 */
async function testAPI() {
  const startTime = Date.now();
  
  try {
    // Wait a bit for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const apiTests = [
      {
        name: 'Email validation',
        command: `curl -s -X POST http://localhost:${CONFIG.demoServer.port}/api/validate/email -H "Content-Type: application/json" -d '{"email":"test@example.com"}'`,
        expectedContains: 'isValid'
      },
      {
        name: 'Date formatting',
        command: `curl -s -X POST http://localhost:${CONFIG.demoServer.port}/api/datetime/format -H "Content-Type: application/json" -d '{"date":"2023-12-25T10:30:00.000Z"}'`,
        expectedContains: '12/25/2023'
      },
      {
        name: 'Array grouping',
        command: `curl -s -X POST http://localhost:${CONFIG.demoServer.port}/api/collections/group-by -H "Content-Type: application/json" -d '{"array":[{"name":"John","dept":"Eng"},{"name":"Jane","dept":"Sales"}],"key":"dept"}'`,
        expectedContains: 'Eng'
      }
    ];

    for (const test of apiTests) {
      console.log(`🧪 Testing: ${test.name}`);
      
      const { stdout } = await execCommand(test.command, { timeout: CONFIG.demoServer.requestTimeout });
      
      if (stdout.includes(test.expectedContains)) {
        console.log(`✅ ${test.name} passed`);
      } else {
        throw new Error(`${test.name} failed: Expected to contain "${test.expectedContains}"`);
      }
    }

    results.api.duration = Date.now() - startTime;
    results.api.passed = true;
    console.log(`✅ API tests passed (${results.api.duration}ms)`);
    
  } catch (error) {
    results.api.duration = Date.now() - startTime;
    results.api.error = error.message;
    results.api.passed = false;
    console.log(`❌ API test failed: ${error.message}`);
  }
}

/**
 * Generate test report
 */
function generateReport() {
  const report = `
# Automated Test Report

**Date:** ${new Date().toISOString()}
**Duration:** ${Date.now() - global.startTime}ms

## Results Summary

| Test | Status | Duration | Error |
|------|--------|----------|-------|
| Build | ${results.build.passed ? '✅ PASSED' : '❌ FAILED'} | ${results.build.duration}ms | ${results.build.error || 'None'} |
| Demo Server | ${results.demo.passed ? '✅ PASSED' : '❌ FAILED'} | ${results.demo.duration}ms | ${results.demo.error || 'None'} |
| API Tests | ${results.api.passed ? '✅ PASSED' : '❌ FAILED'} | ${results.api.duration}ms | ${results.api.error || 'None'} |

## Overall Status: ${results.overall.passed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}

### Errors
${results.overall.errors.length > 0 ? results.overall.errors.join('\\n') : 'None'}

---

*This report was generated automatically by the QGenUtils automated test script*
`;

  fs.writeFileSync('test-report.md', report);
  console.log('📄 Test report saved to test-report.md');
}

/**
 * Main test runner
 */
async function runTests() {
  global.startTime = Date.now();
  
  console.log('🚀 Starting automated testing for QGenUtils');
  console.log('');

  try {
    await testBuild();
    await testDemoServer();
    await testAPI();
    
    // Calculate overall result
    const allPassed = results.build.passed && results.demo.passed && results.api.passed;
    results.overall.passed = allPassed;
    
    if (!allPassed) {
      if (results.build.error) results.overall.errors.push(`Build: ${results.build.error}`);
      if (results.demo.error) results.overall.errors.push(`Demo Server: ${results.demo.error}`);
      if (results.api.error) results.overall.errors.push(`API Tests: ${results.api.error}`);
    }
    
    generateReport();
    
    // Exit with appropriate code
    process.exit(allPassed ? 0 : 1);
    
  } catch (error) {
    console.log(`💥 Unexpected error during testing: ${error.message}`);
    process.exit(1);
  }
}

// CLI argument handling
const args = process.argv.slice(2);
const options = {
  buildOnly: args.includes('--build-only'),
  demoOnly: args.includes('--demo-only'),
  apiOnly: args.includes('--api-only'),
  help: args.includes('--help') || args.includes('-h')
};

if (options.help) {
  console.log(`
QGenUtils Automated Testing Script

Usage: node scripts/automated-test.js [options]

Options:
  --build-only    Run build tests only
  --demo-only     Run demo server tests only  
  --api-only      Run API tests only
  --help, -h     Show this help message

If no options provided, runs all tests in sequence.
`);
  process.exit(0);
}

if (options.buildOnly) {
  testBuild();
} else if (options.demoOnly) {
  testDemoServer();
} else if (options.apiOnly) {
  testAPI();
} else {
  runTests();
}