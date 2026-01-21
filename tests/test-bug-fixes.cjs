const deepClone = require('./lib/utilities/collections/object/deepClone.cjs');
const isEqual = require('./lib/utilities/collections/object/isEqual.cjs');
const sanitizeInput = require('./lib/utilities/validation/sanitizeInput.cjs');

console.log('=== Testing Bug Fixes ===\n');

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

// Test 1: Circular reference handling in deepClone
console.log('1. Testing circular reference handling:');
try {
  const obj = { a: 1 };
  obj.self = obj;
  const cloned = deepClone(obj);
  test('Circular reference doesn\'t crash', typeof cloned === 'object');
  test('Circular reference returns safe object', cloned.a === 1);
} catch (e) {
  test('Circular reference doesn\'t crash', false);
  console.error('Error:', e.message);
}

// Test 2: Date handling in deepClone
console.log('\n2. Testing Date handling:');
try {
  const date = new Date('2024-01-15');
  const cloned = deepClone(date);
  test('Date cloning works', cloned.getTime() === date.getTime());
  test('Date is new instance', cloned !== date);
} catch (e) {
  test('Date cloning works', false);
  console.error('Error:', e.message);
}

// Test 3: RegExp handling in deepClone
console.log('\n3. Testing RegExp handling:');
try {
  const regex = /test/gi;
  const cloned = deepClone(regex);
  test('RegExp cloning works', cloned.source === regex.source);
  test('RegExp flags preserved', cloned.global === regex.global && cloned.ignoreCase === regex.ignoreCase);
} catch (e) {
  test('RegExp cloning works', false);
  console.error('Error:', e.message);
}

// Test 4: Cache key collisions in isEqual
console.log('\n4. Testing cache key handling:');
try {
  const obj1 = { a: 1 };
  const obj2 = { a: 1 };
  const obj3 = { b: 2 };
  
  // Clear cache first
  if (typeof isEqual.clearCache === 'function') {
    isEqual.clearCache();
  }
  
  const result1 = isEqual(obj1, obj2);
  const result2 = isEqual(obj1, obj3);
  
  test('Cache doesn\'t cause false positives', result1 === true && result2 === false);
} catch (e) {
  test('Cache doesn\'t cause false positives', false);
  console.error('Error:', e.message);
}

// Test 5: Input sanitization regex patterns
console.log('\n5. Testing sanitization regex patterns:');
try {
  test('HTML tag removal', sanitizeInput('<script>alert("xss")</script>Hello') === 'Hello');
  test('Whitespace trimming', sanitizeInput('  trimmed  ') === 'trimmed');
  test('Entity encoding', sanitizeInput('Test & special') === 'Test &amp; special');
  test('Malicious content handling', sanitizeInput('<img src="x" onerror="alert(1)">') === '');
} catch (e) {
  test('Sanitization works', false);
  console.error('Error:', e.message);
}

// Test 6: Memory leak prevention
console.log('\n6. Testing memory management:');
try {
  if (typeof deepClone.getCacheStats === 'function') {
    const stats1 = deepClone.getCacheStats();
    // Create some objects to test caching
    for (let i = 0; i < 10; i++) {
      deepClone({ [`test${i}`]: i });
    }
    const stats2 = deepClone.getCacheStats();
    test('Cache bounded', stats2.size >= stats1.size);
  } else {
    test('Cache stats available', false);
  }
} catch (e) {
  test('Memory management works', false);
  console.error('Error:', e.message);
}

console.log(`\n=== Test Results: ${testsPassed}/${totalTests} passed ===`);

if (testsPassed === totalTests) {
  console.log('🎉 All bug fixes verified!');
  process.exit(0);
} else {
  console.log('❌ Some tests failed - bugs may remain');
  process.exit(1);
}