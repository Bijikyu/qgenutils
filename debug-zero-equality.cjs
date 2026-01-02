const isEqual = require('./lib/utilities/collections/object/isEqual.cjs');

console.log('=== Zero Handling Debug ===\n');

const testCases = [
  [-0, +0],
  [0, 0],
  [-0, -0],
  [+0, +0],
  [1, 1],
  [42, 42]
];

testCases.forEach(([a, b], i) => {
  const result = isEqual(a, b);
  const expected = a === b;
  console.log(`Test ${i+1}: isEqual(${a}, ${b}) = ${result}, expected ${expected}, ${result === expected ? 'PASS' : 'FAIL'}`);
});

console.log('\nDirect JavaScript comparison:');
console.log('-0 === +0:', -0 === +0);
console.log('0 === 0:', 0 === 0);

console.log('\nChecking isEqual implementation:');
console.log('isEqual(-0, +0):', isEqual(-0, +0));
console.log('isEqual(0, 0):', isEqual(0, 0));