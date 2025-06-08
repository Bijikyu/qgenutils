
const { formatDateTime, formatDuration, calculateContentLength } = require('./index.js');

console.log('Testing npm module functions:\n');

// Test formatDateTime function
console.log('DateTime formatting function:');
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

// Test calculateContentLength function
console.log('\nContent length calculation function:');
console.log('String body:', calculateContentLength('Hello World'));
console.log('Object body:', calculateContentLength({ name: 'John', age: 30 }));
console.log('Empty string:', calculateContentLength(''));
console.log('Empty object:', calculateContentLength({}));
console.log('Null body:', calculateContentLength(null));

// Test error handling
console.log('\nTesting error handling:');
try {
  calculateContentLength(undefined);
} catch (error) {
  console.log('Caught expected error for undefined body');
}

console.log('\nAll tests completed!');
