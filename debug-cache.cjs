const isEqual = require('./lib/utilities/collections/object/isEqual.cjs');

console.log('=== Debug Cache Key Issue ===\n');

// Clear cache first
if (typeof isEqual.clearCache === 'function') {
  isEqual.clearCache();
}

const obj1 = { a: 1 };
const obj2 = { a: 1 };
const obj3 = { b: 2 };

console.log('Objects:');
console.log('obj1:', obj1);
console.log('obj2:', obj2);
console.log('obj3:', obj3);

console.log('\nEquality tests:');
console.log('obj1 === obj2:', isEqual(obj1, obj2)); // Should be true
console.log('obj1 === obj3:', isEqual(obj1, obj3)); // Should be false

console.log('\nCache stats after comparisons:');
if (typeof isEqual.getCacheStats === 'function') {
  console.log('Cache:', isEqual.getCacheStats());
}

// Test different types to see cache key generation
console.log('\nTesting different type handling:');
console.log('String "hello" === String "hello":', isEqual('hello', 'hello'));
console.log('Number 42 === Number 42:', isEqual(42, 42));
console.log('Boolean true === Boolean true:', isEqual(true, true));

if (typeof isEqual.getCacheStats === 'function') {
  console.log('Cache after primitives:', isEqual.getCacheStats());
}