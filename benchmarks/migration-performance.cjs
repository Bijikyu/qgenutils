#!/usr/bin/env node

/**
 * Performance Benchmark for Migration Validation
 * 
 * PURPOSE: Validate that lodash migration provides expected performance
 * characteristics and compare against baseline expectations.
 */

const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// Test utilities (these will be from migrated implementations)
const collectionsModule = require('../dist/lib/utilities/collections/index.js');

const 
  chunk = collectionsModule.chunk, 
  groupBy = collectionsModule.groupBy, 
  unique = collectionsModule.unique, 
  pick = collectionsModule.pick, 
  omit = collectionsModule.omit,
  deepClone = collectionsModule.deepClone,
  deepMerge = collectionsModule.deepMerge,
  isEqual = collectionsModule.isEqual;

const { 
  chunk, 
  groupBy, 
  unique, 
  pick, 
  omit,
  deepClone,
  deepMerge,
  isEqual 
} = utilitiesModule;

// Benchmark configuration
const BENCHMARK_CONFIG = {
  iterations: 10000,
  arraySizes: [100, 500, 1000],
  objectSizes: [50, 200, 500],
  warmupIterations: 1000
};

// Generate test data
function generateTestData(size, type) {
  switch (type) {
    case 'array':
      return Array.from({ length: size }, (_, i) => ({
        id: i,
        value: Math.random(),
        category: ['A', 'B', 'C'][i % 3]
      }));
    case 'object':
      return Object.fromEntries(
        Array.from({ length: size }, (_, i) => [
          `prop${i}`, 
          { value: Math.random(), nested: { id: i, data: `test${i}` } }
        ])
      );
    default:
      return [];
  }
}

// Performance measurement utilities
function measurePerformance(name, fn, iterations = BENCHMARK_CONFIG.iterations) {
  // Warmup
  for (let i = 0; i < BENCHMARK_CONFIG.warmupIterations; i++) {
    fn();
  }
  
  // Actual measurement
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  
  return {
    name,
    totalTime: end - start,
    averageTime: (end - start) / iterations,
    iterations
  };
}

// Benchmark suite
function runBenchmarks() {
  console.log('🚀 Running Performance Benchmarks for Migration Validation\n');
  console.log(`Iterations: ${BENCHMARK_CONFIG.iterations} per operation`);
  console.log(`Warmup: ${BENCHMARK_CONFIG.warmupIterations} iterations\n`);
  
  const results = [];
  
  // Array benchmarks
  console.log('📊 Array Utilities Benchmarks');
  
  BENCHMARK_CONFIG.arraySizes.forEach(size => {
    const testData = generateTestData(size, 'array');
    const testDataForChunk = Array.from({ length: size }, (_, i) => i);
    
    // chunk benchmark
    results.push(measurePerformance(
      `chunk-${size}`, 
      () => chunk(testDataForChunk, 10)
    ));
    
    // groupBy benchmark
    results.push(measurePerformance(
      `groupBy-${size}`, 
      () => groupBy(testData, item => item.category)
    ));
    
    // unique benchmark
    results.push(measurePerformance(
      `unique-${size}`, 
      () => unique(testData)
    ));
  });
  
  // Object benchmarks
  console.log('\n🗄️ Object Utilities Benchmarks');
  
  BENCHMARK_CONFIG.objectSizes.forEach(size => {
    const testData = generateTestData(size, 'object');
    const keysToPick = Object.keys(testData).slice(0, Math.floor(size / 2));
    const keysToOmit = Object.keys(testData).slice(Math.floor(size / 4), Math.floor(size / 2));
    const otherObject = generateTestData(size / 2, 'object');
    
    // pick benchmark
    results.push(measurePerformance(
      `pick-${size}`, 
      () => pick(testData, keysToPick)
    ));
    
    // omit benchmark
    results.push(measurePerformance(
      `omit-${size}`, 
      () => omit(testData, keysToOmit)
    ));
    
    // deepClone benchmark
    results.push(measurePerformance(
      `deepClone-${size}`, 
      () => deepClone(testData)
    ));
    
    // deepMerge benchmark
    results.push(measurePerformance(
      `deepMerge-${size}`, 
      () => deepMerge(testData, otherObject)
    ));
    
    // isEqual benchmark
    results.push(measurePerformance(
      `isEqual-${size}`, 
      () => isEqual(testData, otherObject)
    ));
  });
  
  return results;
}

// Results analysis
function analyzeResults(results) {
  console.log('\n📈 Performance Analysis Results\n');
  
  // Group by operation type
  const operations = {};
  results.forEach(result => {
    const [opName] = result.name.split('-');
    if (!operations[opName]) {
      operations[opName] = [];
    }
    operations[opName].push(result);
  });
  
  // Performance thresholds (microseconds per operation)
  const THRESHOLDS = {
    chunk: { target: 50, acceptable: 100 },
    groupBy: { target: 100, acceptable: 200 },
    unique: { target: 80, acceptable: 150 },
    pick: { target: 30, acceptable: 60 },
    omit: { target: 30, acceptable: 60 },
    deepClone: { target: 200, acceptable: 400 },
    deepMerge: { target: 300, acceptable: 600 },
    isEqual: { target: 150, acceptable: 300 }
  };
  
  let allPassed = true;
  
  Object.entries(operations).forEach(([opName, opResults]) => {
    console.log(`\n${opName.toUpperCase()} Performance:`);
    
    opResults.forEach(result => {
      const threshold = THRESHOLDS[opName];
      const status = result.averageTime <= threshold.target ? '✅ Excellent' :
                   result.averageTime <= threshold.acceptable ? '✅ Good' : '⚠️ Needs Optimization';
      
      if (result.averageTime > threshold.acceptable) {
        allPassed = false;
      }
      
      console.log(`  ${status} - ${result.averageTime.toFixed(2)}μs avg (${result.name})`);
    });
  });
  
  console.log(`\n🎯 Overall Performance: ${allPassed ? '✅ PASSED' : '⚠️ NEEDS ATTENTION'}`);
  
  return allPassed;
}

// Save benchmark report
function saveBenchmarkReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    configuration: BENCHMARK_CONFIG,
    results,
    summary: {
      totalTests: results.length,
      performancePassed: analyzeResults(results)
    }
  };
  
  const reportPath = path.join(__dirname, '../agentRecords/PERFORMANCE_BENCHMARK_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Benchmark report saved to: ${reportPath}`);
}

// Main execution
function main() {
  try {
    const results = runBenchmarks();
    const performancePassed = analyzeResults(results);
    saveBenchmarkReport(results);
    
    console.log('\n' + '='.repeat(50));
    console.log('🏁 Migration Performance Validation Complete');
    console.log('='.repeat(50));
    
    if (performancePassed) {
      console.log('✅ All performance targets met - migration successful!');
      process.exit(0);
    } else {
      console.log('⚠️ Some performance targets not met - optimization may be needed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Benchmark failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

if (require.main === module) {
  main();
}

module.exports = { runBenchmarks, analyzeResults, saveBenchmarkReport };