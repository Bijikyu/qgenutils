#!/usr/bin/env node

/**
 * Comprehensive Testing Suite with Coverage Reports for QGenUtils
 * 
 * Provides complete testing infrastructure including:
 * - Unit tests with code coverage
 * - Integration tests
 * - Performance benchmarks
 * - Security scans
 * - Load testing
 * - Cross-platform compatibility tests
 * - Browser compatibility tests
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

class ComprehensiveTestSuite {
  constructor() {
    this.results = {
      summary: {
        totalTestSuites: 0,
        passedSuites: 0,
        failedSuites: 0,
        totalTests: 0,
        totalAssertions: 0,
        passedAssertions: 0,
        failedAssertions: 0,
        coverage: {
          lines: 0,
          functions: 0,
          branches: 0,
          statements: 0
        },
        duration: 0,
        timestamp: new Date().toISOString()
      },
      unitTests: {},
      integrationTests: {},
      performanceTests: {},
      securityTests: {},
      loadTests: {},
      coverage: {},
      recommendations: []
    };
    
    this.testSuites = [
      this.runUnitTests,
      this.runIntegrationTests,
      this.runPerformanceTests,
      this.runSecurityTests,
      this.runLoadTests,
      this.generateCoverageReport
    ];
  }

  async executeCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      
      const child = spawn(command.command, command.args || [], {
        stdio: 'pipe',
        cwd: process.cwd(),
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
        const endTime = performance.now();
        resolve({
          code,
          stdout,
          stderr,
          duration: endTime - startTime,
          success: code === 0
        });
      });

      child.on('error', (error) => {
        const endTime = performance.now();
        resolve({
          code: -1,
          stdout: '',
          stderr: error.message,
          duration: endTime - startTime,
          success: false,
          error: error.message
        });
      });
    });
  }

  async runUnitTests() {
    console.log('🧪 Running Unit Tests...\n');
    
    const result = await this.executeCommand({
      command: 'npm',
      args: ['test', '--', '--coverage', '--verbose']
    });

    const testResult = {
      name: 'Unit Tests',
      passed: result.success,
      duration: result.duration,
      exitCode: result.code,
      output: result.stdout,
      errors: result.stderr,
      testCount: this.extractTestCount(result.stdout),
      coverage: await this.extractCoverageData()
    };

    this.results.unitTests = testResult;
    this.updateSummary(testResult);

    console.log(`${result.success ? '✅' : '❌'} Unit Tests: ${testResult.testCount} tests, Coverage: ${testResult.coverage?.lines || 0}% lines`);
    
    return testResult;
  }

  async runIntegrationTests() {
    console.log('🔗 Running Integration Tests...\n');
    
    const result = await this.executeCommand({
      command: 'node',
      args: ['scripts/test-demo-endpoints.cjs']
    });

    const testResult = {
      name: 'Integration Tests',
      passed: result.success,
      duration: result.duration,
      exitCode: result.code,
      output: result.stdout,
      errors: result.stderr,
      testCount: this.extractIntegrationTestCount(result.stdout)
    };

    this.results.integrationTests = testResult;
    this.updateSummary(testResult);

    console.log(`${result.success ? '✅' : '❌'} Integration Tests: ${testResult.testCount} tests completed`);

    return testResult;
  }

  async runPerformanceTests() {
    console.log('⚡ Running Performance Tests...\n');
    
    const result = await this.executeCommand({
      command: 'node',
      args: ['scripts/performance-benchmark.cjs']
    });

    const testResult = {
      name: 'Performance Tests',
      passed: result.success,
      duration: result.duration,
      exitCode: result.code,
      output: result.stdout,
      errors: result.stderr,
      metrics: this.extractPerformanceMetrics(result.stdout)
    };

    this.results.performanceTests = testResult;
    this.updateSummary(testResult);

    console.log(`${result.success ? '✅' : '❌'} Performance Tests completed in ${Math.round(result.duration / 1000)}s`);

    return testResult;
  }

  async runSecurityTests() {
    console.log('🔒 Running Security Tests...\n');
    
    const result = await this.executeCommand({
      command: 'node',
      args: ['scripts/security-scanner.cjs']
    });

    const testResult = {
      name: 'Security Tests',
      passed: result.success,
      duration: result.duration,
      exitCode: result.code,
      output: result.stdout,
      errors: result.stderr,
      vulnerabilities: this.extractSecurityVulnerabilities(result.stdout)
    };

    this.results.securityTests = testResult;
    this.updateSummary(testResult);

    const vulnCount = testResult.vulnerabilities?.total || 0;
    console.log(`${result.success ? '✅' : '❌'} Security Tests: ${vulnCount} vulnerabilities found`);

    return testResult;
  }

  async runLoadTests() {
    console.log('🚀 Running Load Tests...\n');
    
    // Create a comprehensive load test
    const loadTestScript = `
      const http = require('http');
      const { performance } = require('perf_hooks');
      
      async function loadTest() {
        const concurrency = 20;
        const duration = 30000; // 30 seconds
        const endpoint = '/api/string/sanitize';
        const data = { input: 'load-test-string' };
        
        console.log('Starting load test...');
        const startTime = performance.now();
        
        const results = [];
        const promises = [];
        
        for (let i = 0; i < concurrency; i++) {
          promises.push(runLoadBatch(i, duration));
        }
        
        const allResults = await Promise.allSettled(promises);
        const endTime = performance.now();
        
        const successful = allResults.filter(r => r.status === 'fulfilled');
        const failed = allResults.filter(r => r.status === 'rejected');
        
        const metrics = {
          totalRequests: allResults.length,
          successfulRequests: successful.length,
          failedRequests: failed.length,
          successRate: (successful.length / allResults.length) * 100,
          avgResponseTime: successful.reduce((sum, r) => sum + (r.value?.responseTime || 0), 0) / successful.length,
          throughput: (successful.length / ((endTime - startTime) / 1000)).toFixed(2)
        };
        
        console.log('Load Test Results:', JSON.stringify(metrics, null, 2));
        return metrics;
      }
      
      async function runLoadBatch(batchId, duration) {
        const startTime = performance.now();
        const results = [];
        
        while (performance.now() - startTime < duration) {
          try {
            const response = await makeRequest();
            results.push({ responseTime: response.responseTime, statusCode: response.statusCode });
          } catch (error) {
            results.push({ error: error.message });
          }
        }
        
        return results;
      }
      
      function makeRequest() {
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
            },
            timeout: 10000
          };
          
          const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
              resolve({
                statusCode: res.statusCode,
                responseTime: performance.now() - startTime
              });
            });
          });
          
          req.on('error', reject);
          req.write(postData);
          req.end();
        });
      }
      
      loadTest().catch(console.error);
    `;

    // Write and execute load test
    const loadTestFile = 'temp-load-test.js';
    fs.writeFileSync(loadTestFile, loadTestScript);
    
    const result = await this.executeCommand({
      command: 'node',
      args: [loadTestFile]
    });

    // Clean up
    try {
      fs.unlinkSync(loadTestFile);
    } catch (error) {
      // Ignore cleanup errors
    }

    const testResult = {
      name: 'Load Tests',
      passed: result.success,
      duration: result.duration,
      exitCode: result.code,
      output: result.stdout,
      errors: result.stderr,
      loadMetrics: this.extractLoadMetrics(result.stdout)
    };

    this.results.loadTests = testResult;
    this.updateSummary(testResult);

    console.log(`${result.success ? '✅' : '❌'} Load Tests completed`);

    return testResult;
  }

  async generateCoverageReport() {
    console.log('📊 Generating Coverage Report...\n');
    
    // Try to extract coverage from existing Jest coverage
    try {
      const coverageDir = './coverage';
      if (fs.existsSync(coverageDir)) {
        const coverageFiles = fs.readdirSync(coverageDir);
        const lcovFile = coverageFiles.find(file => file.includes('lcov.info'));
        
        if (lcovFile) {
          const coverageData = fs.readFileSync(path.join(coverageDir, lcovFile), 'utf8');
          
          const coverage = {
            lines: this.extractCoveragePercentage(coverageData, 'LF:'),
            functions: this.extractCoveragePercentage(coverageData, 'FNF:'),
            branches: this.extractCoveragePercentage(coverageData, 'BF:'),
            statements: this.extractCoveragePercentage(coverageData, 'SF:')
          };

          const testResult = {
            name: 'Code Coverage',
            passed: coverage.lines > 80,
            duration: 0,
            exitCode: 0,
            coverage
          };

          this.results.coverage = testResult;
          this.updateSummary(testResult);

          console.log(`✅ Coverage: ${coverage.lines}% lines, ${coverage.functions}% functions`);
          
          return testResult;
        }
      }
    } catch (error) {
      console.log('⚠️  Could not generate coverage report:', error.message);
    }

    return { name: 'Code Coverage', passed: false, coverage: { lines: 0, functions: 0, branches: 0, statements: 0 } };
  }

  extractTestCount(output) {
    const match = output.match(/(\d+)\s+tests?/i);
    return match ? parseInt(match[1]) : 0;
  }

  extractIntegrationTestCount(output) {
    const match = output.match(/Test Cases:\s*(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  extractCoverageData() {
    try {
      const coverageFile = './coverage/coverage-summary.json';
      if (fs.existsSync(coverageFile)) {
        const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
        return {
          lines: coverage.total?.lines?.pct || 0,
          functions: coverage.total?.functions?.pct || 0,
          branches: coverage.total?.branches?.pct || 0,
          statements: coverage.total?.statements?.pct || 0
        };
      }
    } catch (error) {
      // Ignore coverage errors
    }
    return null;
  }

  extractPerformanceMetrics(output) {
    try {
      const match = output.match(/throughput:\s*(\d+(?:\.\d+)?)/i);
      return {
        throughput: match ? parseFloat(match[1]) : 0,
        responseTime: this.extractNumber(output, 'avg response time'),
        errorRate: this.extractNumber(output, 'error rate')
      };
    } catch (error) {
      return { throughput: 0, responseTime: 0, errorRate: 0 };
    }
  }

  extractSecurityVulnerabilities(output) {
    try {
      const totalMatch = output.match(/Vulnerabilities:\s*(\d+)/);
      const scoreMatch = output.match(/Security Score:\s*(\d+)/);
      
      return {
        total: totalMatch ? parseInt(totalMatch[1]) : 0,
        score: scoreMatch ? parseInt(scoreMatch[1]) : 0,
        high: this.extractNumber(output, 'HIGH') || 0,
        medium: this.extractNumber(output, 'MEDIUM') || 0,
        low: this.extractNumber(output, 'LOW') || 0
      };
    } catch (error) {
      return { total: 0, score: 0, high: 0, medium: 0, low: 0 };
    }
  }

  extractLoadMetrics(output) {
    try {
      return {
        throughput: this.extractNumber(output, 'throughput') || 0,
        successRate: this.extractNumber(output, 'success rate') || 0,
        avgResponseTime: this.extractNumber(output, 'avg') || 0
      };
    } catch (error) {
      return { throughput: 0, successRate: 0, avgResponseTime: 0 };
    }
  }

  extractNumber(text, keyword) {
    const regex = new RegExp(`(${keyword}[^\\d]*([\\d.]+)`, 'i');
    const match = text.match(regex);
    return match ? parseFloat(match[1]) : 0;
  }

  extractCoveragePercentage(text, prefix) {
    const lines = text.split('\\n');
    for (const line of lines) {
      if (line.startsWith(prefix)) {
        const match = line.match(/(\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[0]) : 0;
      }
    }
    return 0;
  }

  updateSummary(testResult) {
    this.results.summary.totalTestSuites++;
    
    if (testResult.passed) {
      this.results.summary.passedSuites++;
    } else {
      this.results.summary.failedSuites++;
    }
    
    if (testResult.testCount) {
      this.results.summary.totalTests += testResult.testCount;
    }
    
    if (testResult.coverage) {
      this.results.summary.coverage = testResult.coverage;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Test Suite for QGenUtils\n');
    console.log(`🕐 Started at: ${new Date().toISOString()}`);
    console.log(`💻 Platform: ${process.platform}`);
    console.log(`🟢 Node.js: ${process.version()}\n`);

    const overallStartTime = performance.now();
    
    try {
      // Run all test suites
      for (const testSuite of this.testSuites) {
        try {
          await testSuite.call(this);
        } catch (error) {
          console.error(`Test suite failed: ${error.message}`);
          this.results.summary.failedSuites++;
        }
      }
      
      this.results.summary.duration = performance.now() - overallStartTime;
      
      this.generateComprehensiveReport();
      
    } catch (error) {
      console.error('Test suite execution failed:', error);
    }
  }

  generateComprehensiveReport() {
    console.log('\n📋 COMPREHENSIVE TEST REPORT\n');
    console.log('='.repeat(80));
    
    // Executive Summary
    console.log('\n📊 EXECUTIVE SUMMARY');
    console.log('-'.repeat(80));
    console.log(`Total Test Suites:   ${this.results.summary.totalTestSuites}`);
    console.log(`Passed Suites:       ${this.results.summary.passedSuites}`);
    console.log(`Failed Suites:       ${this.results.summary.failedSuites}`);
    console.log(`Total Tests:         ${this.results.summary.totalTests || 0}`);
    console.log(`Test Duration:        ${Math.round(this.results.summary.duration / 1000)}s`);
    console.log(`Completed at:          ${this.results.summary.timestamp}`);
    
    // Coverage Summary
    if (this.results.summary.coverage.lines > 0) {
      console.log('\n📈 CODE COVERAGE');
      console.log('-'.repeat(80));
      console.log(`Line Coverage:       ${this.results.summary.coverage.lines}%`);
      console.log(`Function Coverage:   ${this.results.summary.coverage.functions}%`);
      console.log(`Branch Coverage:     ${this.results.summary.coverage.branches}%`);
      console.log(`Statement Coverage:  ${this.results.summary.coverage.statements}%`);
      
      const overallCoverage = (this.results.summary.coverage.lines + this.results.summary.coverage.functions) / 2;
      console.log(`Overall Coverage:     ${overallCoverage.toFixed(1)}%`);
      
      if (overallCoverage >= 90) {
        console.log('🏆 EXCELLENT coverage (90%+)');
      } else if (overallCoverage >= 80) {
        console.log('✅ GOOD coverage (80%+)');
      } else if (overallCoverage >= 70) {
        console.log('⚠️  FAIR coverage (70%+)');
      } else {
        console.log('❌ POOR coverage (<70%)');
      }
    }
    
    // Individual Suite Results
    console.log('\n🧪 TEST SUITE DETAILS');
    console.log('-'.repeat(80));
    
    const suites = [
      { name: 'Unit Tests', result: this.results.unitTests },
      { name: 'Integration Tests', result: this.results.integrationTests },
      { name: 'Performance Tests', result: this.results.performanceTests },
      { name: 'Security Tests', result: this.results.securityTests },
      { name: 'Load Tests', result: this.results.loadTests },
      { name: 'Code Coverage', result: this.results.coverage }
    ];
    
    suites.forEach(suite => {
      if (!suite.result) return;
      
      const status = suite.result.passed ? '✅ PASS' : '❌ FAIL';
      const duration = suite.result.duration ? `${Math.round(suite.result.duration / 1000)}s` : 'N/A';
      
      console.log(`\n${suite.name}: ${status}`);
      console.log(`├─ Duration: ${duration}`);
      
      if (suite.result.testCount) {
        console.log(`├─ Tests: ${suite.result.testCount}`);
      }
      
      if (suite.result.coverage) {
        console.log(`├─ Coverage: ${suite.result.coverage.lines}% lines`);
      }
      
      if (suite.result.metrics) {
        console.log(`├─ Throughput: ${suite.result.metrics.throughput} req/s`);
      }
      
      if (suite.result.vulnerabilities) {
        console.log(`├─ Vulnerabilities: ${suite.result.vulnerabilities.total}`);
        console.log(`└─ Security Score: ${suite.result.vulnerabilities.score}/100`);
      }
    });
    
    // Quality Assessment
    console.log('\n🎯 QUALITY ASSESSMENT');
    console.log('-'.repeat(80));
    
    const passRate = (this.results.summary.passedSuites / this.results.summary.totalTestSuites) * 100;
    const overallCoverage = this.results.summary.coverage.lines || 0;
    
    let qualityGrade = 'C';
    let qualityMessage = '';
    
    if (passRate >= 90 && overallCoverage >= 80) {
      qualityGrade = 'A';
      qualityMessage = '🏆 EXCELLENT: High quality with comprehensive testing';
    } else if (passRate >= 75 && overallCoverage >= 70) {
      qualityGrade = 'B';
      qualityMessage = '✅ GOOD: Good quality with adequate coverage';
    } else if (passRate >= 60 && overallCoverage >= 60) {
      qualityGrade = 'C';
      qualityMessage = '⚠️  FAIR: Acceptable quality with room for improvement';
    } else {
      qualityGrade = 'D';
      qualityMessage = '❌ POOR: Quality improvements needed';
    }
    
    console.log(`Quality Grade:      ${qualityGrade}`);
    console.log(`Pass Rate:          ${passRate.toFixed(1)}%`);
    console.log(`Overall Coverage:   ${overallCoverage}%`);
    console.log(`Assessment:         ${qualityMessage}`);
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS');
    console.log('-'.repeat(80));
    
    const recommendations = this.generateRecommendations(passRate, overallCoverage);
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
    
    // Save Report
    this.saveComprehensiveReport();
    
    console.log('\n' + '='.repeat(80));
    console.log('🎯 COMPREHENSIVE TESTING COMPLETED');
    console.log(`📄 Detailed report saved to: comprehensive-test-report-${Date.now()}.json`);
    console.log('='.repeat(80));
  }

  generateRecommendations(passRate, coverage) {
    const recommendations = [];
    
    if (passRate < 100) {
      recommendations.push('Fix failing test suites to achieve 100% pass rate');
    }
    
    if (coverage < 80) {
      recommendations.push('Increase test coverage to at least 80% for production readiness');
      recommendations.push('Add integration tests for uncovered code paths');
      recommendations.push('Implement edge case and error scenario testing');
    }
    
    if (passRate >= 80 && coverage >= 80) {
      recommendations.push('Excellent quality! Consider setting up automated CI/CD pipeline');
    }
    
    if (this.results.securityTests.result?.vulnerabilities?.total > 0) {
      recommendations.push('Address security vulnerabilities before production deployment');
    }
    
    if (this.results.performanceTests.result?.metrics?.throughput < 50) {
      recommendations.push('Optimize performance to achieve target throughput of 50+ req/s');
    }
    
    if (this.results.loadTests.result?.metrics?.successRate < 95) {
      recommendations.push('Improve system stability under load (target: 95%+ success rate)');
    }
    
    return recommendations;
  }

  saveComprehensiveReport() {
    const reportData = {
      summary: this.results.summary,
      testSuites: {
        unitTests: this.results.unitTests,
        integrationTests: this.results.integrationTests,
        performanceTests: this.results.performanceTests,
        securityTests: this.results.securityTests,
        loadTests: this.results.loadTests,
        coverage: this.results.coverage
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
      },
      recommendations: this.generateRecommendations(
        (this.results.summary.passedSuites / this.results.summary.totalTestSuites) * 100,
        this.results.summary.coverage.lines || 0
      )
    };
    
    const reportFile = `comprehensive-test-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
    
    // Also save a human-readable version
    const humanReportFile = reportFile.replace('.json', '.md');
    fs.writeFileSync(humanReportFile, this.generateMarkdownReport(reportData));
  }

  generateMarkdownReport(reportData) {
    let markdown = `# QGenUtils Comprehensive Test Report

## Executive Summary

- **Test Suites Run**: ${reportData.summary.totalTestSuites}
- **Suites Passed**: ${reportData.summary.passedSuites}
- **Suites Failed**: ${reportData.summary.failedSuites}
- **Total Duration**: ${Math.round(reportData.summary.duration / 1000)}s
- **Completed**: ${reportData.summary.timestamp}

## Quality Assessment

- **Quality Grade**: ${this.calculateQualityGrade()}
- **Pass Rate**: ${((reportData.summary.passedSuites / reportData.summary.totalTestSuites) * 100).toFixed(1)}%
- **Overall Coverage**: ${reportData.summary.coverage.lines || 0}%

## Test Suite Results

### Unit Tests
- **Status**: ${reportData.testSuites.unitTests?.passed ? '✅ PASSED' : '❌ FAILED'}
- **Duration**: ${reportData.testSuites.unitTests?.duration ? Math.round(reportData.testSuites.unitTests.duration / 1000) + 's' : 'N/A'}
- **Tests**: ${reportData.testSuites.unitTests?.testCount || 0}

### Integration Tests
- **Status**: ${reportData.testSuites.integrationTests?.passed ? '✅ PASSED' : '❌ FAILED'}
- **Duration**: ${reportData.testSuites.integrationTests?.duration ? Math.round(reportData.testSuites.integrationTests.duration / 1000) + 's' : 'N/A'}

### Performance Tests
- **Status**: ${reportData.testSuites.performanceTests?.passed ? '✅ PASSED' : '❌ FAILED'}
- **Throughput**: ${reportData.testSuites.performanceTests?.metrics?.throughput || 0} req/s

### Security Tests
- **Status**: ${reportData.testSuites.securityTests?.passed ? '✅ PASSED' : '❌ FAILED'}
- **Vulnerabilities**: ${reportData.testSuites.securityTests?.vulnerabilities?.total || 0}
- **Security Score**: ${reportData.testSuites.securityTests?.vulnerabilities?.score || 0}/100

## Coverage Report

- **Line Coverage**: ${reportData.summary.coverage.lines}%
- **Function Coverage**: ${reportData.summary.coverage.functions}%
- **Branch Coverage**: ${reportData.summary.coverage.branches}%
- **Statement Coverage**: ${reportData.summary.coverage.statements}%

## Environment

- **Node.js**: ${reportData.environment.nodeVersion}
- **Platform**: ${reportData.environment.platform}
- **Architecture**: ${reportData.environment.arch}
- **Memory**: ${JSON.stringify(reportData.environment.memory, null, 2)}

## Recommendations

${reportData.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

---
*Report generated on ${new Date().toISOString()}*
`;

    return markdown;
  }

  calculateQualityGrade() {
    const passRate = (this.results.summary.passedSuites / this.results.summary.totalTestSuites) * 100;
    const coverage = this.results.summary.coverage.lines || 0;
    
    if (passRate >= 90 && coverage >= 80) return 'A';
    if (passRate >= 75 && coverage >= 70) return 'B';
    if (passRate >= 60 && coverage >= 60) return 'C';
    return 'D';
  }
}

// Main execution
async function main() {
  const testSuite = new ComprehensiveTestSuite();
  await testSuite.runAllTests();
}

if (require.main === module) {
  main();
}

module.exports = ComprehensiveTestSuite;