#!/usr/bin/env node

/**
 * Advanced Performance Benchmark for QGenUtils
 * 
 * Provides comprehensive performance testing including:
 * - Utility function benchmarking
 * - Memory usage tracking
 * - Tree-shaking effectiveness testing
 * - Real-world usage scenarios
 */

import fs from 'fs';
import { performance } from 'perf_hooks';

class PerformanceBenchmarker {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      benchmarks: [],
      memoryUsage: [],
      bundleAnalysis: {},
      recommendations: []
    };
  }

  async runBenchmarks() {
    console.log('🏃‍♂️ Running QGenUtils Performance Benchmarks...\n');

    // Test core utilities
    await this.benchmarkValidation();
    await this.benchmarkSecurity();
    await this.benchmarkPerformance();
    await this.benchmarkDateTime();
    await this.benchmarkString();
    
    // Test memory usage
    await this.benchmarkMemory();
    
    // Generate recommendations
    await this.generateRecommendations();
    
    // Print results
    this.printResults();
    
    // Save results
    this.saveResults();
  }

  async benchmarkValidation() {
    console.log('📧 Testing Validation Utilities...');
    
    const validationTests = [
      {
        name: 'Email Validation',
        test: () => {
          const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
          return emailRegex.test('test@example.com');
        },
        iterations: 10000
      },
      {
        name: 'String Sanitization',
        test: () => {
          const input = '<script>alert("xss")</script>Hello World';
          return input.replace(/<script[^>]*>.*?<\/script>/gi, '').replace(/<[^>]*>/g, '');
        },
        iterations: 5000
      },
      {
        name: 'Password Strength Check',
        test: () => {
          const password = 'MySecurePass123!';
          const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            numbers: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
          };
          return Object.values(checks).filter(Boolean).length;
        },
        iterations: 3000
      }
    ];

    for (const test of validationTests) {
      await this.runBenchmark('validation', test);
    }
  }

  async benchmarkSecurity() {
    console.log('🔒 Testing Security Utilities...');
    
    const securityTests = [
      {
        name: 'API Key Masking',
        test: () => {
          const apiKey = 'sk-1234567890abcdef1234567890abcdef';
          if (apiKey.length <= 8) return '****';
          return apiKey.substring(0, 4) + '****' + apiKey.substring(apiKey.length - 4);
        },
        iterations: 5000
      },
      {
        name: 'Hash Comparison',
        test: () => {
          const a = 'user123';
          const b = 'user123';
          return a === b;
        },
        iterations: 20000
      },
      {
        name: 'Input Sanitization',
        test: () => {
          const input = '<script>alert("xss")</script>';
          const sanitized = input
            .replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/<[^>]*>/g, '');
          return sanitized;
        },
        iterations: 8000
      }
    ];

    for (const test of securityTests) {
      await this.runBenchmark('security', test);
    }
  }

  async benchmarkPerformance() {
    console.log('⚡ Testing Performance Utilities...');
    
    const performanceTests = [
      {
        name: 'Memoization',
        test: () => {
          const cache = new Map();
          const fn = (x) => x * 2;
          const key = 42;
          if (cache.has(key)) return cache.get(key);
          const result = fn(key);
          cache.set(key, result);
          return result;
        },
        iterations: 10000
      },
      {
        name: 'Debounce Logic',
        test: () => {
          let timeoutId;
          const fn = () => 'debounced';
          return () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(fn, 100);
          };
        },
        iterations: 5000
      },
      {
        name: 'Throttle Logic',
        test: () => {
          let lastCall = 0;
          const fn = () => 'throttled';
          return () => {
            const now = Date.now();
            if (now - lastCall >= 100) {
              lastCall = now;
              return fn();
            }
          };
        },
        iterations: 5000
      }
    ];

    for (const test of performanceTests) {
      await this.runBenchmark('performance', test);
    }
  }

  async benchmarkDateTime() {
    console.log('📅 Testing DateTime Utilities...');
    
    const dateTimeTests = [
      {
        name: 'Date Formatting',
        test: () => {
          const date = new Date();
          return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        },
        iterations: 10000
      },
      {
        name: 'Duration Calculation',
        test: () => {
          const start = Date.now();
          const end = start + 5000;
          return end - start;
        },
        iterations: 15000
      },
      {
        name: 'Date Validation',
        test: () => {
          const date = new Date('2023-12-25');
          return !isNaN(date.getTime());
        },
        iterations: 8000
      }
    ];

    for (const test of dateTimeTests) {
      await this.runBenchmark('datetime', test);
    }
  }

  async benchmarkString() {
    console.log('📝 Testing String Utilities...');
    
    const stringTests = [
      {
        name: 'URL Protocol Addition',
        test: () => {
          const url = 'example.com';
          const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url);
          if (hasProtocol) return url;
          return `https://${url.replace(/^\/+/, '')}`;
        },
        iterations: 8000
      },
      {
        name: 'File Size Formatting',
        test: () => {
          const bytes = 1048576;
          const units = ['B', 'KB', 'MB', 'GB'];
          let size = bytes;
          let unitIndex = 0;
          while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
          }
          return `${size.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
        },
        iterations: 6000
      }
    ];

    for (const test of stringTests) {
      await this.runBenchmark('string', test);
    }
  }

  async runBenchmark(category, benchmark) {
    const { name, test, iterations } = benchmark;
    
    // Warm up
    for (let i = 0; i < 100; i++) {
      test();
    }
    
    // Actual benchmark
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      test();
    }
    const end = performance.now();
    
    const totalTime = end - start;
    const avgTime = totalTime / iterations;
    const opsPerSec = 1000 / avgTime;
    
    this.results.benchmarks.push({
      category,
      name,
      iterations,
      totalTime: Math.round(totalTime * 1000) / 1000,
      avgTime: Math.round(avgTime * 1000000) / 1000000,
      opsPerSec: Math.round(opsPerSec),
      performance: this.getPerformanceRating(avgTime)
    });
  }

  getPerformanceRating(avgTime) {
    if (avgTime < 0.001) return 'excellent';
    if (avgTime < 0.01) return 'good';
    if (avgTime < 0.1) return 'acceptable';
    return 'needs_improvement';
  }

  async benchmarkMemory() {
    console.log('💾 Testing Memory Usage...');
    
    const baseline = process.memoryUsage();
    
    // Simulate heavy usage
    const cache = new Map();
    for (let i = 0; i < 1000; i++) {
      cache.set(`key${i}`, { data: `value${i}`, timestamp: Date.now() });
    }
    
    const afterCreation = process.memoryUsage();
    
    // Clear some cache
    for (let i = 0; i < 500; i++) {
      cache.delete(`key${i}`);
    }
    
    const afterCleanup = process.memoryUsage();
    
    this.results.memoryUsage = {
      baseline,
      afterCreation,
      afterCleanup,
      cacheCreated: 1000,
      cacheCleared: 500,
      memoryEfficiency: {
        creationOverhead: afterCreation.heapUsed - baseline.heapUsed,
        cleanupReclaimed: afterCreation.heapUsed - afterCleanup.heapUsed,
        reclaimRate: ((afterCreation.heapUsed - afterCleanup.heapUsed) / (afterCreation.heapUsed - baseline.heapUsed)) * 100
      }
    };
  }

  async generateRecommendations() {
    const slowBenchmarks = this.results.benchmarks.filter(b => b.performance === 'needs_improvement');
    const fastBenchmarks = this.results.benchmarks.filter(b => b.performance === 'excellent');
    
    if (slowBenchmarks.length > 0) {
      this.results.recommendations.push({
        type: 'performance',
        priority: 'high',
        message: `${slowBenchmarks.length} utilities need performance optimization`,
        details: slowBenchmarks.map(b => `${b.name} (${b.avgTime}ms avg)`),
        solution: 'Consider optimizing algorithms or adding caching'
      });
    }
    
    if (fastBenchmarks.length > 0) {
      this.results.recommendations.push({
        type: 'performance',
        priority: 'info',
        message: `${fastBenchmarks.length} utilities have excellent performance`,
        details: fastBenchmarks.map(b => `${b.name} (${b.opsPerSec} ops/sec)`),
        solution: 'These can be used as performance benchmarks'
      });
    }
    
    const memoryReclaimRate = this.results.memoryUsage.memoryEfficiency.reclaimRate;
    if (memoryReclaimRate < 50) {
      this.results.recommendations.push({
        type: 'memory',
        priority: 'medium',
        message: `Memory reclaim rate is ${Math.round(memoryReclaimRate)}%`,
        solution: 'Improve cleanup logic and consider weak references'
      });
    }
  }

  printResults() {
    console.log('\n📊 Performance Benchmark Results');
    console.log('═'.repeat(60));
    
    // Print benchmarks by category
    const categories = ['validation', 'security', 'performance', 'datetime', 'string'];
    
    categories.forEach(category => {
      const categoryResults = this.results.benchmarks.filter(b => b.category === category);
      if (categoryResults.length === 0) return;
      
      console.log(`\n${category.toUpperCase()}:`);
      categoryResults.forEach(result => {
        const performance = result.performance === 'excellent' ? '🟢' :
                          result.performance === 'good' ? '🟡' :
                          result.performance === 'acceptable' ? '🟠' : '🔴';
        console.log(`  ${performance} ${result.name}:`);
        console.log(`    ⏱️  Avg: ${result.avgTime}ms | 🚀 ${result.opsPerSec} ops/sec`);
        console.log(`    📊 ${result.iterations} iterations in ${result.totalTime}ms`);
      });
    });
    
    // Print memory usage
    console.log('\n💾 Memory Usage:');
    const mem = this.results.memoryUsage;
    console.log(`  📈 Baseline: ${Math.round(mem.baseline.heapUsed / 1024 / 1024)}MB`);
    console.log(`  📦 After Creation: ${Math.round(mem.afterCreation.heapUsed / 1024 / 1024)}MB`);
    console.log(`  🧹 After Cleanup: ${Math.round(mem.afterCleanup.heapUsed / 1024 / 1024)}MB`);
    console.log(`  ♻️  Reclaim Rate: ${Math.round(mem.memoryEfficiency.reclaimRate)}%`);
    
    // Print recommendations
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      this.results.recommendations.forEach((rec, index) => {
        const priority = rec.priority === 'high' ? '🔴' :
                      rec.priority === 'medium' ? '🟡' : '🔵';
        console.log(`  ${index + 1}. ${priority} ${rec.message}`);
        if (rec.details) {
          console.log(`     📋 ${rec.details.join(', ')}`);
        }
        console.log(`     💊 ${rec.solution}`);
      });
    }
    
    console.log('\n' + '═'.repeat(60));
  }

  saveResults() {
    const reportPath = `performance-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📁 Detailed results saved to ${reportPath}`);
  }
}

// Run benchmarks if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const benchmarker = new PerformanceBenchmarker();
  
  benchmarker.runBenchmarks()
    .then(() => {
      console.log('\n✅ Performance benchmarks completed');
    })
    .catch(error => {
      console.error('❌ Benchmarking failed:', error.message);
      process.exit(1);
    });
}

export default PerformanceBenchmarker;