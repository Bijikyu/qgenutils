/**
 * Performance Benchmarking Suite
 * 
 * Purpose: Comprehensive performance testing for QGenUtils frontend-backend integration
 * with metrics collection, trend analysis, and regression detection.
 */

const http = require('http');
const { performance } = require('perf_hooks');

class PerformanceBenchmark {
  constructor() {
    this.serverProcess = null;
    this.results = [];
    this.metrics = {
      responseTime: [],
      throughput: [],
      memory: [],
      cpu: []
    };
    this.baseline = null;
  }

  /**
   * Start benchmark server
   */
  async startServer() {
    console.log('🚀 Starting performance benchmark server...');
    
    return new Promise((resolve, reject) => {
      this.serverProcess = require('child_process').spawn('node', ['examples/simple-demo-server.cjs'], {
        stdio: 'pipe',
        cwd: process.cwd()
      });

      let serverOutput = '';
      
      this.serverProcess.stdout.on('data', (data) => {
        serverOutput += data.toString();
        if (serverOutput.includes('listening on http://localhost:3000')) {
          console.log('✅ Benchmark server started');
          setTimeout(resolve, 1000);
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        console.error('Server error:', data.toString());
      });

      this.serverProcess.on('error', (error) => {
        reject(new Error(`Failed to start server: ${error.message}`));
      });

      setTimeout(() => {
        reject(new Error('Server startup timeout'));
      }, 10000);
    });
  }

  /**
   * Stop benchmark server
   */
  stopServer() {
    if (this.serverProcess) {
      console.log('🛑 Stopping benchmark server...');
      this.serverProcess.kill('SIGTERM');
      this.serverProcess = null;
    }
  }

  /**
   * Make HTTP request with timing
   */
  async makeRequest(method, path, data = null, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      
      const postData = data ? JSON.stringify(data) : null;
      const postLength = postData ? postData.length : 0;
      
      const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postLength.toString(),
          ...options.headers
        },
        timeout: options.timeout || 10000
      });

      let responseData = '';
      
      req.on('response', (res) => {
        res.on('data', (chunk) => {
          responseData += chunk.toString();
        });
        
        res.on('end', () => {
          const endTime = performance.now();
          const responseTime = endTime - startTime;
          
          try {
            const parsedData = JSON.parse(responseData);
            resolve({
              statusCode: res.statusCode,
              responseTime: responseTime,
              headers: res.headers,
              data: parsedData,
              success: res.statusCode >= 200 && res.statusCode < 300
            });
          } catch (parseError) {
            resolve({
              statusCode: res.statusCode,
              responseTime: responseTime,
              headers: res.headers,
              data: responseData,
              success: false,
              parseError: parseError.message
            });
          }
        });
      });

      req.on('error', (error) => {
        const endTime = performance.now();
        resolve({
          statusCode: 0,
          responseTime: endTime - startTime,
          error: error.message,
          success: false
        });
      });

      if (postData) {
        req.write(postData);
      }
      
      req.end();
    });
  }

  /**
   * Benchmark single endpoint
   */
  async benchmarkEndpoint(name, method, path, data = null, iterations = 100) {
    console.log(`\n🧪 Benchmarking: ${name} (${iterations} iterations)`);
    
    const results = [];
    const errors = [];
    
    for (let i = 0; i < iterations; i++) {
      const result = await this.makeRequest(method, path, data);
      
      if (result.success) {
        results.push(result.responseTime);
      } else {
        errors.push(result);
      }
      
      // Small delay to prevent overwhelming server
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    return this.analyzeResults(name, results, errors);
  }

  /**
   * Analyze benchmark results
   */
  analyzeResults(name, results, errors) {
    const analysis = {
      name: name,
      iterations: results.length + errors.length,
      errors: errors.length,
      errorRate: ((errors.length) / (results.length + errors.length)) * 100,
      successRate: ((results.length) / (results.length + errors.length)) * 100
    };

    if (results.length > 0) {
      // Calculate statistics
      const sorted = results.sort((a, b) => a - b);
      const sum = results.reduce((a, b) => a + b, 0);
      const mean = sum / results.length;
      
      // Calculate percentiles
      const p50 = sorted[Math.floor(sorted.length * 0.5)];
      const p95 = sorted[Math.floor(sorted.length * 0.95)];
      const p99 = sorted[Math.floor(sorted.length * 0.99)];
      
      analysis.stats = {
        min: sorted[0],
        max: sorted[sorted.length - 1],
        mean: mean,
        median: p50,
        p95: p95,
        p99: p99,
        standardDeviation: this.calculateStandardDeviation(results, mean)
      };
      
      // Store for trend analysis
      this.metrics.responseTime.push(mean);
    }

    if (errors.length > 0) {
      analysis.errorAnalysis = this.analyzeErrors(errors);
    }

    return analysis;
  }

  /**
   * Calculate standard deviation
   */
  calculateStandardDeviation(values, mean) {
    const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff = squaredDifferences.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  /**
   * Analyze error patterns
   */
  analyzeErrors(errors) {
    const statusCodes = {};
    const errorTypes = {};
    
    errors.forEach(error => {
      // Group by status code
      const code = error.statusCode || 'connection_error';
      statusCodes[code] = (statusCodes[code] || 0) + 1;
      
      // Group by error type
      const type = error.parseError ? 'parse_error' : 
                   error.error ? 'connection_error' : 'unknown_error';
      errorTypes[type] = (errorTypes[type] || 0) + 1;
    });

    return { statusCodes, errorTypes };
  }

  /**
   * Benchmark concurrent requests
   */
  async benchmarkConcurrency(name, method, path, data = null, concurrency = 10) {
    console.log(`\n🚀 Benchmarking: ${name} (concurrency: ${concurrency})`);
    
    const startTime = performance.now();
    const promises = [];
    
    // Launch concurrent requests
    for (let i = 0; i < concurrency; i++) {
      promises.push(this.makeRequest(method, path, data));
    }
    
    // Wait for all requests to complete
    const results = await Promise.allSettled(promises);
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    // Analyze results
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
    const failed = results.filter(r => r.status === 'rejected' || r.value.success === false);
    
    const responseTimes = successful.map(r => r.value.responseTime);
    const avgResponseTime = responseTimes.length > 0 ? 
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;
    
    const analysis = {
      name: `${name} (concurrent)`,
      concurrency: concurrency,
      totalTime: totalTime,
      requestsPerSecond: (results.length / totalTime) * 1000,
      successCount: successful.length,
      errorCount: failed.length,
      successRate: (successful.length / results.length) * 100,
      avgResponseTime: avgResponseTime,
      throughput: results.length / totalTime
    };
    
    if (responseTimes.length > 0) {
      const sorted = responseTimes.sort((a, b) => a - b);
      analysis.stats = {
        min: sorted[0],
        max: sorted[sorted.length - 1],
        median: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)]
      };
    }
    
    return analysis;
  }

  /**
   * Run memory usage benchmark
   */
  async benchmarkMemoryUsage() {
    console.log('\n📊 Benchmarking: Memory Usage');
    
    const before = process.memoryUsage();
    
    // Make multiple requests to see memory impact
    const promises = [];
    for (let i = 0; i < 1000; i++) {
      promises.push(this.makeRequest('POST', '/api/validate/email', { email: 'test@example.com' }));
    }
    
    await Promise.allSettled(promises);
    
    const after = process.memoryUsage();
    
    return {
      name: 'Memory Usage',
      before: before,
      after: after,
      increase: {
        rss: after.rss - before.rss,
        heapUsed: after.heapUsed - before.heapUsed,
        heapTotal: after.heapTotal - before.heapTotal,
        external: after.external - before.external
      },
      memoryPerRequest: (after.heapUsed - before.heapUsed) / 1000
    };
  }

  /**
   * Run comprehensive benchmark suite
   */
  async runFullBenchmarkSuite() {
    console.log('🎯 Starting Comprehensive Performance Benchmark Suite\n');
    
    try {
      await this.startServer();
      
      // Warm up
      console.log('🔥 Warming up server...');
      await this.benchmarkEndpoint('Warm-up', 'POST', '/api/validate/email', { email: 'warmup@example.com' }, 10);
      
      // Individual endpoint benchmarks
      const endpointBenchmarks = [
        { name: 'Email Validation', method: 'POST', path: '/api/validate/email', data: { email: 'test@example.com' } },
        { name: 'Password Validation', method: 'POST', path: '/api/validate/password', data: { password: 'TestP@ssw0rd123!' } },
        { name: 'API Key Masking', method: 'POST', path: '/api/security/mask-api-key', data: { apiKey: 'sk-sensitive1234567890abcdef' } },
        { name: 'Collections Group By', method: 'POST', path: '/api/collections/group-by', 
          data: { array: [{ name: 'John', category: 'A' }, { name: 'Jane', category: 'B' }], key: 'category' } }
      ];
      
      for (const benchmark of endpointBenchmarks) {
        const result = await this.benchmarkEndpoint(benchmark.name, benchmark.method, benchmark.path, benchmark.data);
        this.results.push(result);
      }
      
      // Concurrency benchmarks
      const concurrencyTests = [1, 5, 10, 25, 50];
      for (const concurrency of concurrencyTests) {
        const result = await this.benchmarkConcurrency('Email Validation', 'POST', '/api/validate/email', { email: 'test@example.com' }, concurrency);
        this.results.push(result);
      }
      
      // Memory benchmark
      const memoryResult = await this.benchmarkMemoryUsage();
      this.results.push(memoryResult);
      
      this.generateBenchmarkReport();
      
    } catch (error) {
      console.error('💥 Benchmark suite failed:', error);
    } finally {
      this.stopServer();
    }
  }

  /**
   * Generate comprehensive benchmark report
   */
  generateBenchmarkReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 PERFORMANCE BENCHMARK REPORT');
    console.log('='.repeat(80));
    
    const timestamp = new Date().toISOString();
    
    // Summary section
    console.log('\n📋 EXECUTION SUMMARY');
    console.log('─'.repeat(40));
    console.log(`Timestamp: ${timestamp}`);
    console.log(`Total Benchmarks: ${this.results.length}`);
    console.log(`Server: localhost:3000`);
    console.log(`Environment: Node.js ${process.version}`);
    console.log(`Platform: ${process.platform}`);
    console.log(`Memory: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`);
    
    // Individual endpoint results
    console.log('\n🎯 ENDPOINT PERFORMANCE');
    console.log('─'.repeat(40));
    
    this.results
      .filter(r => r.stats)
      .forEach(result => {
        console.log(`\n📊 ${result.name}`);
        console.log(`  Success Rate: ${result.successRate.toFixed(1)}% (${result.successCount}/${result.iterations})`);
        console.log(`  Error Rate: ${result.errorRate.toFixed(1)}% (${result.errors}/${result.iterations})`);
        console.log(`  Response Time (ms):`);
        console.log(`    Mean:   ${result.stats.mean.toFixed(2)}`);
        console.log(`    Median: ${result.stats.median.toFixed(2)}`);
        console.log(`    P95:    ${result.stats.p95.toFixed(2)}`);
        console.log(`    P99:    ${result.stats.p99.toFixed(2)}`);
        console.log(`    Min:     ${result.stats.min.toFixed(2)}`);
        console.log(`    Max:     ${result.stats.max.toFixed(2)}`);
        console.log(`    Std Dev: ${result.stats.standardDeviation.toFixed(2)}`);
        
        if (result.errorAnalysis) {
          console.log(`  Error Analysis:`);
          console.log(`    Status Codes: ${JSON.stringify(result.errorAnalysis.statusCodes)}`);
          console.log(`    Error Types:   ${JSON.stringify(result.errorAnalysis.errorTypes)}`);
        }
      });
    
    // Concurrency results
    console.log('\n🚀 CONCURRENCY PERFORMANCE');
    console.log('─'.repeat(40));
    
    this.results
      .filter(r => r.concurrency)
      .forEach(result => {
        console.log(`\n⚡ ${result.name} (Concurrency: ${result.concurrency})`);
        console.log(`  Success Rate:    ${result.successRate.toFixed(1)}%`);
        console.log(`  Throughput:     ${result.requestsPerSecond.toFixed(1)} req/sec`);
        console.log(`  Avg Response:   ${result.avgResponseTime.toFixed(2)} ms`);
        console.log(`  Total Time:     ${result.totalTime.toFixed(2)} ms`);
        
        if (result.stats) {
          console.log(`  Response Time (ms):`);
          console.log(`    Median: ${result.stats.median.toFixed(2)}`);
          console.log(`    P95:    ${result.stats.p95.toFixed(2)}`);
          console.log(`    Max:    ${result.stats.max.toFixed(2)}`);
        }
      });
    
    // Memory results
    const memoryResult = this.results.find(r => r.name === 'Memory Usage');
    if (memoryResult) {
      console.log('\n💾 MEMORY USAGE');
      console.log('─'.repeat(40));
      console.log(`  RSS Increase:    ${(memoryResult.increase.rss / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Heap Increase:   ${(memoryResult.increase.heapUsed / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Memory/Request:  ${(memoryResult.memoryPerRequest / 1024).toFixed(2)} KB`);
    }
    
    // Performance assessment
    console.log('\n🎯 PERFORMANCE ASSESSMENT');
    console.log('─'.repeat(40));
    
    const avgResponseTimes = this.results
      .filter(r => r.stats && r.stats.mean)
      .map(r => r.stats.mean);
    
    if (avgResponseTimes.length > 0) {
      const overallAvg = avgResponseTimes.reduce((a, b) => a + b, 0) / avgResponseTimes.length;
      const overallP95 = Math.max(...this.results.filter(r => r.stats && r.stats.p95).map(r => r.stats.p95));
      
      console.log(`  Overall Average Response: ${overallAvg.toFixed(2)} ms`);
      console.log(`  Overall P95 Response:    ${overallP95.toFixed(2)} ms`);
      
      // Performance grades
      let grade = 'A';
      if (overallAvg > 100) grade = 'C';
      else if (overallAvg > 50) grade = 'B';
      
      console.log(`  Performance Grade:       ${grade}`);
      
      if (overallAvg < 50) {
        console.log(`  Status: ✅ EXCELLENT - Response times under 50ms`);
      } else if (overallAvg < 100) {
        console.log(`  Status: ✅ GOOD - Response times under 100ms`);
      } else {
        console.log(`  Status: ⚠️  NEEDS OPTIMIZATION - Response times over 100ms`);
      }
    }
    
    this.saveBenchmarkReport(timestamp);
  }

  /**
   * Save benchmark report to file
   */
  saveBenchmarkReport(timestamp) {
    const reportData = {
      timestamp,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: process.memoryUsage()
      },
      results: this.results,
      summary: {
        totalBenchmarks: this.results.length,
        avgResponseTime: this.calculateAverage(this.results.filter(r => r.stats && r.stats.mean).map(r => r.stats.mean)),
        successRate: this.calculateAverage(this.results.map(r => r.successRate || 0)),
        performanceGrade: this.calculatePerformanceGrade()
      }
    };
    
    const filename = `agentRecords/performance-benchmark-${timestamp.replace(/[:.]/g, '-')}.json`;
    
    try {
      require('fs').writeFileSync(filename, JSON.stringify(reportData, null, 2));
      console.log(`\n📁 Detailed report saved to: ${filename}`);
    } catch (error) {
      console.error(`⚠️  Could not save report: ${error.message}`);
    }
  }

  /**
   * Calculate average of array
   */
  calculateAverage(values) {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Calculate overall performance grade
   */
  calculatePerformanceGrade() {
    const responseTimes = this.results
      .filter(r => r.stats && r.stats.mean)
      .map(r => r.stats.mean);
    
    if (responseTimes.length === 0) return 'N/A';
    
    const avg = this.calculateAverage(responseTimes);
    
    if (avg < 25) return 'A+';
    if (avg < 50) return 'A';
    if (avg < 75) return 'B';
    if (avg < 100) return 'C';
    return 'D';
  }
}

// CLI interface
if (require.main === module) {
  const benchmark = new PerformanceBenchmark();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'quick':
      benchmark.runQuickBenchmark();
      break;
    case 'full':
      benchmark.runFullBenchmarkSuite();
      break;
    case 'memory':
      benchmark.runMemoryBenchmark();
      break;
    default:
      console.log('Usage: node performance-benchmark.cjs [quick|full|memory]');
      console.log('  quick  - Quick performance test');
      console.log('  full   - Comprehensive benchmark suite');
      console.log('  memory - Memory usage analysis');
      process.exit(1);
  }
}

module.exports = PerformanceBenchmark;