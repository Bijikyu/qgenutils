#!/usr/bin/env node

/**
 * Simple Performance Benchmark for Migration Validation
 */

const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// Import migrated utilities
const collectionsModule = require('../dist/lib/utilities/collections/index.js');

function measurePerformance(name, testFn, iterations = 10000) {
  // Warmup
  for (let i = 0; i < 1000; i++) {
    testFn();
  }
  
  // Measure
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    testFn();
  }
  const end = performance.now();
  
  const totalTime = end - start;
  const avgTime = totalTime / iterations;
  
  console.log(`${name}: ${avgTime.toFixed(3)}μs average (${totalTime.toFixed(2)}ms total)`);
  return { name, avgTime, totalTime, iterations };
}

// Generate test data
function generateArrayData(size) {
  return Array.from({ length: size }, (_, i) => ({
    id: i,
    value: Math.random(),
    category: ['A', 'B', 'C'][i % 3]
  }));
}

function generateObjectData(size) {
  return Object.fromEntries(
    Array.from({ length: size }, (_, i) => [
      `prop${i}`,
      { value: Math.random(), nested: { id: i, data: `test${i}` } }
    ])
  );
}

// Run benchmarks
function runBenchmarks() {
  console.log('🚀 Migration Performance Validation\n');
  
  const results = [];
  
  // Array utilities benchmarks
  console.log('\n📊 Array Utilities:');
  
  const array100 = generateArrayData(100);
  results.push(measurePerformance('chunk-100', () => collectionsModule.chunk(array100, 10)));
  results.push(measurePerformance('groupBy-100', () => collectionsModule.groupBy(array100, item => item.category)));
  results.push(measurePerformance('unique-100', () => collectionsModule.unique(array100)));
  
  // Object utilities benchmarks
  console.log('\n🗄️ Object Utilities:');
  
  const object50 = generateObjectData(50);
  const keysToPick = Object.keys(object50).slice(0, 25);
  const keysToOmit = Object.keys(object50).slice(25, 50);
  
  results.push(measurePerformance('pick-50', () => collectionsModule.pick(object50, keysToPick)));
  results.push(measurePerformance('omit-50', () => collectionsModule.omit(object50, keysToOmit)));
  results.push(measurePerformance('deepClone-50', () => collectionsModule.deepClone(object50)));
  
  // Performance thresholds (microseconds)
  const thresholds = {
    chunk: 50,
    groupBy: 100,
    unique: 80,
    pick: 30,
    omit: 30,
    deepClone: 200
  };
  
  console.log('\n📈 Performance Analysis:');
  let allPassed = true;
  
  results.forEach(result => {
    const [operation] = result.name.split('-');
    const threshold = thresholds[operation];
    const status = result.avgTime <= threshold ? '✅ PASS' : '⚠️ OPTIMIZE';
    
    if (result.avgTime > threshold) {
      allPassed = false;
    }
    
    console.log(`${result.name.padEnd(15)}: ${status} (${result.avgTime.toFixed(2)}μs)`);
  });
  
  console.log(`\n🎯 Overall Result: ${allPassed ? '✅ PERFORMANCE ACCEPTABLE' : '⚠️ OPTIMIZATION NEEDED'}`);
  
  // Save results
  const report = {
    timestamp: new Date().toISOString(),
    performancePassed: allPassed,
    results: results.map(r => ({
      ...r,
      threshold: thresholds[r.name.split('-')[0]]
    }))
  };
  
  const reportPath = path.join(__dirname, '../agentRecords/MIGRATION_PERFORMANCE_RESULTS.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved: ${reportPath}`);
  
  return allPassed;
}

// Main execution
if (require.main === module) {
  try {
    const success = runBenchmarks();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('❌ Benchmark failed:', error.message);
    process.exit(1);
  }
}

module.exports = { runBenchmarks };