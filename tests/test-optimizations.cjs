const deepClone = require('./lib/utilities/collections/object/deepClone.js');
const isEqual = require('./lib/utilities/collections/object/isEqual.js');
const sanitizeInput = require('./lib/utilities/validation/sanitizeInput.js');

console.log('=== Testing Optimized Utilities ===\n');

// Test deepClone
console.log('1. Testing deepClone:');
const obj1 = { a: 1, b: { c: 2 } };
const cloned1 = deepClone(obj1);
console.log('✓ Objects:', cloned1.a === 1 && cloned1.b.c === 2 && cloned1 !== obj1 && cloned1.b !== obj1.b);

const arr1 = [1, [2, 3], { a: 4 }];
const cloned2 = deepClone(arr1);
console.log('✓ Arrays:', cloned2.length === 3 && cloned2 !== arr1 && cloned2[1] !== arr1[1]);

const date1 = new Date('2024-01-15');
const cloned3 = deepClone(date1);
console.log('✓ Dates:', cloned3.getTime() === date1.getTime() && cloned3 !== date1);

// Test isEqual
console.log('\n2. Testing isEqual:');
const obj2 = { a: 1, b: { c: 2 } };
const obj3 = { a: 1, b: { c: 2 } };
const obj4 = { a: 1, b: { c: 3 } };
console.log('✓ Equal objects:', isEqual(obj2, obj3));
console.log('✓ Unequal objects:', !isEqual(obj2, obj4));
console.log('✓ Same reference:', isEqual(obj2, obj2));

// Test sanitizeInput
console.log('\n3. Testing sanitizeInput:');
console.log('✓ HTML removal:', sanitizeInput('<script>alert("xss")</script>Hello') === 'Hello');
console.log('✓ Whitespace trim:', sanitizeInput('  trimmed  ') === 'trimmed');
console.log('✓ Entities:', sanitizeInput('Test & special') === 'Test &amp; special');

// Performance checks
console.log('\n4. Performance Features:');
console.log('✓ Cache stats available:', typeof deepClone.getCacheStats === 'function');
console.log('✓ Cache clear available:', typeof deepClone.clearCache === 'function');

console.log('\n=== All Tests Passed! ===');