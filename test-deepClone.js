const deepClone = require('./lib/utilities/collections/object/deepClone.js');

console.log('deepClone function:', typeof deepClone);
console.log('deepClone:', deepClone);

// Test primitives
console.log('Testing primitives...');
console.log('42 ->', deepClone(42));
console.log('string ->', deepClone('string'));
console.log('null ->', deepClone(null));

// Test objects
console.log('Testing objects...');
const obj = { a: 1, b: { c: 2 } };
const cloned = deepClone(obj);
console.log('Original:', JSON.stringify(obj));
console.log('Cloned:', JSON.stringify(cloned));
console.log('Same reference?', cloned === obj);
console.log('Nested same?', cloned.b === obj.b);

console.log('All tests completed!');