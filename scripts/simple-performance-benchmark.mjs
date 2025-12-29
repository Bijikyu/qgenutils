#!/usr/bin/env node

/**
 * Simple Performance Benchmark
 * 
 * Direct module imports for performance testing
 */

import { performance } from 'perf_hooks';

// Simple benchmarks
class SimplePerformanceBenchmark {
  constructor() {
    this.results = [];
    this.warmupRuns = 3;
    this.benchmarkRuns = 100;
  }

  async measureFunction(name, fn, data) {
    console.log(`\n🔍 Benchmarking: ${name}`);
    
    // Warmup
    for (let i = 0; i < this.warmupRuns; i++) {
      await fn(data);
    }
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    // Benchmark
    const times = [];
    const memoryBefore = process.memoryUsage();
    
    for (let i = 0; i < this.benchmarkRuns; i++) {
      const start = performance.now();
      await fn(data);
      const end = performance.now();
      times.push(end - start);
    }
    
    const memoryAfter = process.memoryUsage();
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const memoryDelta = memoryAfter.heapUsed - memoryBefore.heapUsed;
    
    const result = {
      name,
      runs: this.benchmarkRuns,
      avgTime: avgTime.toFixed(3),
      minTime: minTime.toFixed(3),
      maxTime: maxTime.toFixed(3),
      memoryDelta: (memoryDelta / 1024 / 1024).toFixed(2),
      opsPerSec: Math.round(1000 / avgTime)
    };
    
    this.results.push(result);
    console.log(`  ⚡ Avg: ${result.avgTime}ms | Min: ${result.minTime}ms | Max: ${result.maxTime}ms`);
    console.log(`  💾 Memory: ${result.memoryDelta}MB | Ops/sec: ${result.opsPerSec}`);
    
    return result;
  }

  async runBenchmarks() {
    console.log('🚀 Simple Performance Benchmark Suite');
    console.log('=====================================');
    
    // Import utilities one by one
    try {
      const { formatDateTime } = await import('../dist/lib/utilities/datetime/formatDateTime.js');
      await this.measureFunction('formatDateTime', () => {
        return formatDateTime('2023-12-25T10:30:00.000Z');
      }, null);
    } catch (error) {
      console.log('❌ formatDateTime benchmark failed:', error.message);
    }
    
    try {
      const { formatDuration } = await import('../dist/lib/utilities/datetime/formatDuration.js');
      await this.measureFunction('formatDuration', () => {
        return formatDuration('2023-12-25T10:00:00.000Z', '2023-12-25T11:30:45.000Z');
      }, null);
    } catch (error) {
      console.log('❌ formatDuration benchmark failed:', error.message);
    }
    
    try {
      const { ensureProtocol } = await import('../dist/lib/utilities/url/ensureProtocol.js');
      await this.measureFunction('ensureProtocol', () => {
        return ensureProtocol('example.com');
      }, null);
    } catch (error) {
      console.log('❌ ensureProtocol benchmark failed:', error.message);
    }
    
    try {
      const { validateEmailFormat } = await import('../dist/lib/utilities/validation/validateEmailSimple.js');
      await this.measureFunction('validateEmailFormat', () => {
        return validateEmailFormat('test@example.com');
      }, null);
    } catch (error) {
      console.log('❌ validateEmailFormat benchmark failed:', error.message);
    }
    
    try {
      const { hashPassword } = await import('../dist/lib/utilities/password/hashPassword.js');
      await this.measureFunction('hashPassword', async () => {
        return await hashPassword('testPassword123');
      }, null);
    } catch (error) {
      console.log('❌ hashPassword benchmark failed:', error.message);
    }
    
    try {
      const { sanitizeInput } = await import('../dist/lib/utilities/validation/sanitizeInput.js');
      await this.measureFunction('sanitizeInput', () => {
        return sanitizeInput('<script>alert("xss")</script>');
      }, null);
    } catch (error) {
      console.log('❌ sanitizeInput benchmark failed:', error.message);
    }
    
    // Test pure JavaScript functions
    await this.measureFunction('array operations', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i);
      return arr.map(x => x * 2).filter(x => x % 4 === 0).slice(0, 100);
    }, null);
    
    await this.measureFunction('string operations', () => {
      return 'test string'.split(' ').map(word => word.toUpperCase()).join('_');
    }, null);
    
    await this.measureFunction('object operations', () => {
      const obj = { a: 1, b: 2, c: 3 };
      return Object.keys(obj).reduce((acc, key) => ({ ...acc, [key]: obj[key] * 2 }), {});
    }, null);
    
    // Memory stress test
    console.log('\n🧠 Memory Stress Test');
    const largeArrays = [];
    const memoryBefore = process.memoryUsage();
    
    for (let i = 0; i < 100; i++) {
      largeArrays.push(Array.from({ length: 10000 }, (_, j) => ({
        id: j,
        data: `test data ${j}`,
        timestamp: Date.now()
      })));
    }
    
    const memoryAfter = process.memoryUsage();
    const memoryUsed = (memoryAfter.heapUsed - memoryBefore.heapUsed) / 1024 / 1024;
    console.log(`  📊 Memory used for 100 large arrays: ${memoryUsed.toFixed(2)}MB`);
    
    // Cleanup
    largeArrays.length = 0;
    if (global.gc) {
      global.gc();
    }
    
    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 Performance Benchmark Report');
    console.log('=================================');
    
    if (this.results.length === 0) {
      console.log('❌ No successful benchmarks completed');
      return;
    }
    
    // Sort by average time
    const sortedByTime = [...this.results].sort((a, b) => 
      parseFloat(a.avgTime) - parseFloat(b.avgTime)
    );
    
    console.log('\n⚡ Fastest Operations:');
    sortedByTime.slice(0, 5).forEach(result => {
      console.log(`  ${result.name}: ${result.avgTime}ms (${result.opsPerSec} ops/sec)`);
    });
    
    console.log('\n🐌 Slowest Operations:');
    sortedByTime.slice(-5).reverse().forEach(result => {
      console.log(`  ${result.name}: ${result.avgTime}ms (${result.opsPerSec} ops/sec)`);
    });
    
    // Performance grade
    const avgTime = this.results.reduce((sum, r) => sum + parseFloat(r.avgTime), 0) / this.results.length;
    
    let grade, message;
    if (avgTime < 1) {
      grade = 'A+';
      message = 'Exceptional performance - all operations under 1ms average';
    } else if (avgTime < 5) {
      grade = 'A';
      message = 'Excellent performance suitable for production workloads';
    } else if (avgTime < 10) {
      grade = 'B';
      message = 'Good performance with room for optimization';
    } else if (avgTime < 50) {
      grade = 'C';
      message = 'Acceptable performance but optimization recommended';
    } else {
      grade = 'D';
      message = 'Performance needs significant optimization';
    }
    
    console.log(`\n🎯 Overall Performance Grade: ${grade}`);
    console.log(`   ${message}`);
    
    // Export results
    const reportData = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      },
      benchmarks: this.results,
      overallGrade: { grade, message, avgTime: avgTime.toFixed(3) }
    };
    
    try {
      writeFileSync('performance-report.json', JSON.stringify(reportData, null, 2));
      console.log('\n📄 Detailed report saved to performance-report.json');
    } catch (error) {
      console.log('⚠️  Could not save detailed report:', error.message);
    }
  }
}

// Run benchmarks
async function main() {
  const benchmark = new SimplePerformanceBenchmark();
  
  try {
    await benchmark.runBenchmarks();
    console.log('\n✅ Performance benchmark completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Performance benchmark failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { SimplePerformanceBenchmark };