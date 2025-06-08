
const { greet, capitalize, randomBetween } = require('./index.js');

console.log('Testing npm module functions:\n');

// Test greet function
console.log('Greet function:');
console.log(greet('World')); // Hello, World!
console.log(greet('Alice', 'Hi')); // Hi, Alice!

// Test capitalize function
console.log('\nCapitalize function:');
console.log(capitalize('hello world')); // Hello World
console.log(capitalize('javascript is awesome')); // Javascript Is Awesome

// Test randomBetween function
console.log('\nRandom number function:');
console.log('Random between 1-10:', randomBetween(1, 10));
console.log('Random between 50-100:', randomBetween(50, 100));

console.log('\nAll tests completed!');
