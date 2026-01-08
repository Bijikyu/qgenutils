#!/usr/bin/env node

/**
 * Automated Performance Benchmarking Suite for QGenUtils Demo Server
 * 
 * Performs comprehensive performance testing including:
 * - Load testing with concurrent requests
 * - Stress testing with gradual load increase  
 * - Endpoint-specific performance analysis
 * - Memory and CPU usage monitoring
 * - Response time distribution analysis
 * - Throughput and scalability testing
 */

const http = require('http');
const { performance } = require('perf_hooks');
const os = require('os');

class PerformanceBenchmark {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.results = {
      summary: {},
      endpoints: {},
      systemMetrics: [],
      testCases: []
    };
  }

  async makeRequest(endpoint, data, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      
      const postData = JSON.stringify(data);
      const requestOptions = {
        hostname: 'localhost',
        port: 3000,
        path: endpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        ...options
      };

      const req = http.request(requestOptions, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          const endTime = performance.now();
          const responseTime = endTime - startTime;
          
          resolve({
            statusCode: res.statusCode,
            responseTime,
            contentLength: body.length,
            headers: res.headers,
            data: body
          });
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.setTimeout(options.timeout || 10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.write(postData);
      req.end();
    });
  }

  async runSingleEndpointTest(endpoint, data, concurrency = 1, iterations = 100) {
    console.log(`\n🧪 Testing ${endpoint} (concurrency: ${concurrency}, iterations: ${iterations})`);
    
    const results = [];
    const startTime = performance.now();
    
    // Run concurrent batches
    const batchSize = Math.ceil(iterations / concurrency);
    const promises = [];
    
    for (let batch = 0; batch < concurrency; batch++) {
      const batchPromises = [];
      const batchIterations = Math.min(batchSize, iterations - batch * batchSize);
      
      for (let i = 0; i < batchIterations; i++) {
        const promise = this.makeRequest(endpoint, data);
        batchPromises.push(promise);
      }
      
      const batchResults = await Promise.allSettled(batchPromises);
      promises.push(...batchResults);
      
      // Small delay between batches to prevent overwhelming
      if (batch < concurrency - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    // Analyze results
    const successfulResults = promises
      .filter(p => p.status === 'fulfilled')
      .map(p => p.value)
      .filter(r => r.statusCode < 400);
    
    const failedResults = promises.filter(p => p.status === 'rejected' || (p.status === 'fulfilled' && p.value.statusCode >= 400));
    
    if (successfulResults.length === 0) {
      throw new Error(`All requests failed for ${endpoint}`);
    }
    
    const responseTimes = successfulResults.map(r => r.responseTime);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const minResponseTime = Math.min(...responseTimes);
    const maxResponseTime = Math.max(...responseTimes);
    
    // Calculate percentiles
    const sortedTimes = responseTimes.sort((a, b) => a - b);
    const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
    const p90 = sortedTimes[Math.floor(sortedTimes.length * 0.9)];
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
    
    const throughput = (successfulResults.length / totalTime) * 1000; // requests per second
    const errorRate = (failedResults.length / promises.length) * 100;
    
    const testResult = {
      endpoint,
      concurrency,
      iterations,
      totalTime: Math.round(totalTime),
      successfulRequests: successfulResults.length,
      failedRequests: failedResults.length,
      errorRate: Math.round(errorRate * 100) / 100,
      throughput: Math.round(throughput * 100) / 100,
      avgResponseTime: Math.round(avgResponseTime * 100) / 100,
      minResponseTime: Math.round(minResponseTime * 100) / 100,
      maxResponseTime: Math.round(maxResponseTime * 100) / 100,
      p50: Math.round(p50 * 100) / 100,
      p90: Math.round(p90 * 100) / 100,
      p95: Math.round(p95 * 100) / 100,
      p99: Math.round(p99 * 100) / 100
    };
    
    console.log(`✅ ${endpoint}: ${throughput.toFixed(2)} req/s, avg ${avgResponseTime.toFixed(2)}ms, error rate ${errorRate.toFixed(2)}%`);
    
    return testResult;
  }

  async runSystemMonitoring() {
    console.log('\n📊 Starting system monitoring...');
    
    const monitoringInterval = setInterval(() => {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      const loadAvg = os.loadavg();
      
      const metrics = {
        timestamp: new Date().toISOString(),
        memory: {
          rss: Math.round(memUsage.rss / 1024 / 1024), // MB
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
          external: Math.round(memUsage.external / 1024 / 1024)
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        },
        system: {
          loadAverage: {
            oneMinute: loadAvg[0],
            fiveMinute: loadAvg[1],
            fifteenMinute: loadAvg[2]
          },
          freeMemory: Math.round(os.freemem() / 1024 / 1024), // MB
          totalMemory: Math.round(os.totalmem() / 1024 / 1024) // MB
        }
      };
      
      this.results.systemMetrics.push(metrics);
    }, 1000);
    
    return monitoringInterval;
  }

  async runLoadTests() {
    console.log('🚀 Starting Load Tests...\n');
    
    const testCases = [
      {
        name: 'Email Validation',
        endpoint: '/api/validate/email',
        data: { email: 'test@example.com' }
      },
      {
        name: 'String Sanitization',
        endpoint: '/api/string/sanitize',
        data: { input: '<script>alert("xss")</script>Hello World' }
      },
      {
        name: 'API Key Masking',
        endpoint: '/api/security/mask-api-key',
        data: { apiKey: 'sk-test1234567890abcdefghijklmnopqrstuvwxyz' }
      },
      {
        name: 'File Size Formatting',
        endpoint: '/api/file/format-size',
        data: { bytes: 1048576 }
      },
      {
        name: 'URL Protocol Normalization',
        endpoint: '/api/url/ensure-protocol',
        data: { url: 'example.com', protocol: 'https' }
      }
    ];

    const monitoringInterval = this.runSystemMonitoring();
    
    try {
      for (const testCase of testCases) {
        // Test with different concurrency levels
        const concurrencyLevels = [1, 5, 10, 25, 50];
        
        for (const concurrency of concurrencyLevels) {
          try {
            const result = await this.runSingleEndpointTest(
              testCase.endpoint, 
              testCase.data, 
              concurrency, 
              Math.min(100, concurrency * 20) // Scale iterations with concurrency
            );
            
            if (!this.results.endpoints[testCase.name]) {
              this.results.endpoints[testCase.name] = [];
            }
            this.results.endpoints[testCase.name].push(result);
            
          } catch (error) {
            console.error(`❌ Failed to test ${testCase.name} with concurrency ${concurrency}: ${error.message}`);
          }
        }
        
        // Brief pause between endpoint tests
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } finally {
      clearInterval(monitoringInterval);
    }
  }

  generateReport() {
    console.log('\n📋 PERFORMANCE BENCHMARK REPORT\n');
    console.log('='.repeat(80));
    
    // Endpoint performance summary
    console.log('\n📊 ENDPOINT PERFORMANCE SUMMARY');
    console.log('-'.repeat(80));
    
    for (const [endpoint, results] of Object.entries(this.results.endpoints)) {
      console.log(`\n${endpoint}:`);
      console.log(`├─ Best Throughput: ${Math.max(...results.map(r => r.throughput))} req/s`);
      console.log(`├─ Best Response Time: ${Math.min(...results.map(r => r.avgResponseTime))}ms avg`);
      console.log(`├─ Worst Response Time: ${Math.max(...results.map(r => r.avgResponseTime))}ms avg`);
      console.log(`└─ Optimal Concurrency: ${results.reduce((best, r) => r.throughput > best.throughput ? r : best).concurrency}`);
      
      for (const result of results) {
        console.log(`   └─ ${result.concurrency} concurrent: ${result.throughput} req/s, ${result.avgResponseTime}ms avg, ${result.errorRate}% errors`);
      }
    }
    
    console.log('\n✅ BENCHMARK COMPLETED SUCCESSFULLY');
    console.log('='.repeat(80));
  }

  async runAllBenchmarks() {
    console.log('🚀 Starting QGenUtils Performance Benchmark Suite');
    console.log(`🌐 Target Server: ${this.baseUrl}`);
    console.log(`💻 System: ${os.platform()} with ${os.cpus().length} cores, ${Math.round(os.totalmem() / 1024 / 1024)}MB RAM\n`);
    
    try {
      await this.runLoadTests();
      this.generateReport();
      
    } catch (error) {
      console.error(`❌ Benchmark failed: ${error.message}`);
      process.exit(1);
    }
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

    req.on('timeout', () => {
      reject(new Error('Demo server is not responding. Please start it with: node examples/simple-demo-server.cjs'));
    });

    req.end();
  });
}

// Main execution
async function main() {
  try {
    await checkServer();
    
    const benchmark = new PerformanceBenchmark();
    await benchmark.runAllBenchmarks();
    
  } catch (error) {
    console.error(`❌ Setup error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = PerformanceBenchmark;