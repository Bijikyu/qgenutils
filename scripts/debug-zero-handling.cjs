console.log('=== Debug Zero Handling ===\n');

const a = -0;
const b = +0;

console.log('a =', a);
console.log('b =', b);
console.log('a === b:', a === b); // Should be true
console.log('1/a =', 1/a);
console.log('1/b =', 1/b);
console.log('1/a === 1/b:', 1/a === 1/b); // Should be false

// My condition logic
const result = a === b || (isNaN(a) && isNaN(b));
console.log('First result:', result);

if (result && a === 0 && b === 0) {
  const finalResult = (1/a === 1/b);
  console.log('Final result:', finalResult);
}

console.log('\nExpected: true (both numbers are equal under JavaScript ===)');
console.log('The issue: -0 === +0 is true, but 1/(-0) === 1/(+0) is false');
console.log('Should just use a === b directly for numbers');