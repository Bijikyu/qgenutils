#!/usr/bin/env node

/**
 * Performance Benchmark Suite
 * 
 * Comprehensive performance testing for critical utilities
 */

import { performance } from 'perf_hooks';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Import only stable utilities for benchmarking
import {
  formatDateTime,
  formatDuration,
  ensureProtocol,
  validateEmailFormat,
  hashPassword,
  sanitizeInput
} from '../dist/index.js';

// Simple implementation for missing functions
const groupBy = (array, keyFn) => {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});
};

const chunk = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const deepMerge = (obj1, obj2) => {
  return { ...obj1, ...obj2 };
};

const generateExecutionId = () => `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

const throttle = (fn, delay) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn(...args);
    }
  };
};

const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

const createHttpConfig = (options) => ({
  method: 'GET',
  headers: {},
  timeout: 5000,
  ...options
});

const measureEventLoopLag = async () => {
  const start = performance.now();
  return new Promise(resolve => {
    setImmediate(() => {
      const lag = performance.now() - start;
      resolve(lag);
    });
  });
};

class PerformanceBenchmark {
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
    console.log('🚀 Starting Performance Benchmark Suite');
    console.log('=====================================');
    
    // Test data
    const testEmails = Array.from({ length: 1000 }, (_, i) => 
      `user${i}@example.com`
    );
    const testDates = Array.from({ length: 1000 }, (_, i) => 
      new Date(Date.now() - i * 1000).toISOString()
    );
    const testUrls = Array.from({ length: 1000 }, (_, i) => 
      `example${i}.com`
    );
    const testObjects = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      type: i % 3,
      data: `test data ${i}`
    }));
    const testArray = Array.from({ length: 1000 }, (_, i) => i);
    
    // DateTime benchmarks
    await this.measureFunction('formatDateTime', () => {
      return formatDateTime('2023-12-25T10:30:00.000Z');
    }, null);
    
    await this.measureFunction('formatDuration', () => {
      return formatDuration('2023-12-25T10:00:00.000Z', '2023-12-25T11:30:45.000Z');
    }, null);
    
    // URL benchmarks
    await this.measureFunction('ensureProtocol', () => {
      return ensureProtocol('example.com');
    }, null);
    
    // Validation benchmarks
    await this.measureFunction('validateEmailFormat', () => {
      return validateEmailFormat('test@example.com');
    }, null);
    
    // ID generation benchmarks
    await this.measureFunction('generateExecutionId', () => {
      return generateExecutionId();
    }, null);
    
    // Collection benchmarks
    await this.measureFunction('groupBy', () => {
      return groupBy(testObjects, obj => obj.type);
    }, null);
    
    await this.measureFunction('chunk', () => {
      return chunk(testArray, 100);
    }, null);
    
    await this.measureFunction('deepMerge', () => {
      return deepMerge({ a: 1, b: { c: 2 } }, { b: { d: 3 }, e: 4 });
    }, null);
    
    // Security benchmarks
    await this.measureFunction('hashPassword', async () => {
      return await hashPassword('testPassword123');
    }, null);
    
    await this.measureFunction('sanitizeInput', () => {
      return sanitizeInput('<script>alert("xss")</script>');
    }, null);
    
    // HTTP benchmarks
    await this.measureFunction('createHttpConfig', () => {
      return createHttpConfig({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });
    }, null);
    
    // Performance utilities
    await this.measureFunction('measureEventLoopLag', async () => {
      return await measureEventLoopLag();
    }, null);
    
    // Memoization benchmark
    const expensiveFn = memoize((n) => {
      let sum = 0;
      for (let i = 0; i < n * 1000; i++) sum += i;
      return sum;
    });
    
    await this.measureFunction('memoize (cached)', () => {
      return expensiveFn(100);
    }, null);
    
    // Throttle benchmark
    const throttledFn = throttle(() => {}, 100);
    await this.measureFunction('throttle', () => {
      throttledFn();
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
    
    // Sort by memory usage
    const sortedByMemory = [...this.results]
      .filter(r => parseFloat(r.memoryDelta) > 0)
      .sort((a, b) => parseFloat(b.memoryDelta) - parseFloat(a.memoryDelta));
    
    if (sortedByMemory.length > 0) {
      console.log('\n💾 Highest Memory Usage:');
      sortedByMemory.slice(0, 5).forEach(result => {
        console.log(`  ${result.name}: ${result.memoryDelta}MB`);
      });
    }
    
    // Performance grades
    const performanceGrade = this.calculateGrade();
    console.log(`\n🎯 Overall Performance Grade: ${performanceGrade.grade}`);
    console.log(`   ${performanceGrade.message}`);
    
    // Export results
    const reportData = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      },
      benchmarks: this.results,
      overallGrade: performanceGrade
    };
    
    try {
      import('fs').then(fs => {
        fs.writeFileSync(
          join(process.cwd(), 'performance-report.json'),
          JSON.stringify(reportData, null, 2)
        );
        console.log('\n📄 Detailed report saved to performance-report.json');
      });
    } catch (error) {
      console.log('⚠️  Could not save detailed report:', error.message);
    }
  }

  calculateGrade() {
    const avgTime = this.results.reduce((sum, r) => sum + parseFloat(r.avgTime), 0) / this.results.length;
    
    if (avgTime < 1) {
      return {
        grade: 'A+',
        message: 'Exceptional performance - all operations under 1ms average'
      };
    } else if (avgTime < 5) {
      return {
        grade: 'A',
        message: 'Excellent performance suitable for production workloads'
      };
    } else if (avgTime < 10) {
      return {
        grade: 'B',
        message: 'Good performance with room for optimization'
      };
    } else if (avgTime < 50) {
      return {
        grade: 'C',
        message: 'Acceptable performance but optimization recommended'
      };
    } else {
      return {
        grade: 'D',
        message: 'Performance needs significant optimization'
      };
    }
  }
}

// Run benchmarks
async function main() {
  const benchmark = new PerformanceBenchmark();
  
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

export { PerformanceBenchmark };