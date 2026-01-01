#!/usr/bin/env node

/**
 * Simple performance benchmark to identify actual bottlenecks
 */

// Test some of the utility functions that were flagged
console.log('=== Performance Benchmark ===\n');

// Test deepMerge performance
console.log('Testing deepMerge performance...');
const start = Date.now();

// Create test objects
const obj1 = { a: 1, b: { c: 2, d: { e: 3 } } };
const obj2 = { b: { d: { f: 4 } }, g: 5 };

// Run multiple iterations
for (let i = 0; i < 10000; i++) {
  // Simple merge test
  Object.assign({}, obj1, obj2);
}

const end = Date.now();
console.log(`Object.assign test: ${end - start}ms for 10,000 iterations\n`);

// Test array operations
console.log('Testing array operations...');
const arrStart = Date.now();

const testArrayForGrouping = Array.from({ length: 1000 }, (_, i) => ({ id: i, group: i % 10 }));

// Test groupBy performance
for (let i = 0; i < 1000; i++) {
  const grouped = testArrayForGrouping.reduce((acc, item) => {
    const key = item.group;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

const arrEnd = Date.now();
console.log(`Array grouping test: ${arrEnd - arrStart}ms for 1,000 iterations\n`);

// Test Set vs Array.includes performance
console.log('Testing Set vs Array.includes...');
const setStart = Date.now();

const testItems = ['item1', 'item2', 'item3', 'item4', 'item5'];
const testSet = new Set(testItems);
const testArray = testItems;

// Test Set.has (O(1))
for (let i = 0; i < 10000; i++) {
  testSet.has('item3');
}

const setEnd = Date.now();
console.log(`Set.has test: ${setEnd - setStart}ms for 10,000 lookups`);

// Test Array.includes (O(n))
const arrayStart = Date.now();
for (let i = 0; i < 10000; i++) {
  testArray.includes('item3');
}
const arrayEnd = Date.now();
console.log(`Array.includes test: ${arrayEnd - arrayStart}ms for 10,000 lookups\n`);

console.log('=== Benchmark Complete ===');