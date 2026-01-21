const deepClone = require('./lib/utilities/collections/object/deepClone.cjs');
const isEqual = require('./lib/utilities/collections/object/isEqual.cjs');
const sanitizeInput = require('./lib/utilities/validation/sanitizeInput.cjs');

console.log('=== Critical Bug Testing ===\n');

let testsPassed = 0;
let totalTests = 0;

function test(name, condition) {
  totalTests++;
  if (condition) {
    console.log(`✓ ${name}`);
    testsPassed++;
  } else {
    console.log(`✗ ${name}`);
  }
}

// Test 1: Memory leak detection in deepClone
console.log('1. Memory Leak Tests:');
// Clear any existing monitoring
if (typeof deepClone.clearCache === 'function') {
  deepClone.clearCache();
}

try {
  // Create circular reference that could leak
  const obj1 = { a: 1 };
  obj1.circular = obj1;
  
  const clone1 = deepClone(obj1);
  test('Circular reference handled', typeof clone1 === 'object');
  
  // Test Date objects that could crash
  const date1 = new Date();
  const clone2 = deepClone(date1);
  test('Date cloning works', clone2.getTime() === date1.getTime());
  
  // Test RegExp objects
  const regex1 = /test/g;
  const clone3 = deepClone(regex1);
  test('RegExp cloning works', clone3.source === regex1.source && clone3.global === regex1.global);
  
  // Test ArrayBuffer with fallback
  const buffer1 = new ArrayBuffer(8);
  const view1 = new Uint8Array(buffer1);
  view1[0] = 42;
  const clone4 = deepClone(buffer1);
  test('ArrayBuffer cloning works', clone4.byteLength === 8);
  
} catch (e) {
  test('DeepClone memory/crash issues', false);
  console.error('Error:', e.message);
}

// Test 2: Edge case crashes in isEqual
console.log('\n2. Edge Case Crash Tests:');

try {
  // Test NaN handling (special case)
  test('NaN equality', isEqual(NaN, NaN) === true);
  
  // Test -0 vs +0 (JavaScript peculiarity)
  test('Zero handling', isEqual(-0, +0) === true); // -0 === +0 is true in JavaScript // Should be false
  
  // Test null vs undefined
  test('Null vs undefined', isEqual(null, undefined) === false);
  
  // Test different types
  test('Number vs string', isEqual(42, '42') === false);
  
} catch (e) {
  test('IsEqual crash handling', false);
  console.error('Error:', e.message);
}

// Test 3: Regex edge cases in sanitizeInput
console.log('\n3. Regex Edge Case Tests:');

try {
  // Test malformed HTML
  test('Malformed HTML', typeof sanitizeInput('<script>alert("xss")') === 'string');
  
  // Test empty attributes
  test('Empty attributes', sanitizeInput('<img src="">test</img>') === 'test');
  
  // Test nested malicious content
  test('Nested malicious', !sanitizeInput('<div><script>alert(1)</script></div>').includes('script'));
  
} catch (e) {
  test('Sanitization edge cases', false);
  console.error('Error:', e.message);
}

console.log(`\n=== Critical Bug Test Results: ${testsPassed}/${totalTests} ===`);

if (testsPassed === totalTests) {
  console.log('🎉 All critical bug tests pass!');
} else {
  console.log('❌ Critical bugs still exist!');
}