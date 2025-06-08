
const { greet, capitalize, randomBetween, formatDateTime, formatDuration } = require('./index.js');

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

// Test formatDateTime function
console.log('\nDateTime formatting function:');
const now = new Date().toISOString();
console.log('Current time formatted:', formatDateTime(now));
console.log('Invalid date:', formatDateTime(''));

// Test formatDuration function
console.log('\nDuration formatting function:');
const startTime = new Date(Date.now() - 3661000).toISOString(); // 1 hour, 1 minute, 1 second ago
console.log('Duration from start to now:', formatDuration(startTime));
const endTime = new Date().toISOString();
console.log('Duration between two times:', formatDuration(startTime, endTime));
console.log('Empty start date:', formatDuration(''));

console.log('\nAll tests completed!');
