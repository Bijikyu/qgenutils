const deepClone = require('./lib/utilities/collections/object/deepClone.cjs');
const sanitizeInput = require('./lib/utilities/validation/sanitizeInput.cjs');

console.log('=== Debugging Issues ===\n');

// Debug sanitizeInput HTML removal
console.log('Testing sanitizeInput:');
const htmlTest = '<script>alert("xss")</script>Hello';
const result = sanitizeInput(htmlTest);
console.log('Input:', JSON.stringify(htmlTest));
console.log('Output:', JSON.stringify(result));
console.log('Expected:', JSON.stringify('Hello'));
console.log('Match:', result === 'Hello');

// Debug deepClone cache stats
console.log('\nTesting deepClone cache:');
console.log('getCacheStats type:', typeof deepClone.getCacheStats);
if (typeof deepClone.getCacheStats === 'function') {
  console.log('Stats:', deepClone.getCacheStats());
} else {
  console.log('No getCacheStats function');
}