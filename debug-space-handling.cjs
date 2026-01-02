const sanitizeInput = require('./lib/utilities/validation/sanitizeInput.cjs');

console.log('=== Testing Space Handling ===\n');

const input = '<b>Bold</b> text';
console.log('Input:', JSON.stringify(input));

const result = sanitizeInput(input);
console.log('Output:', JSON.stringify(result));
console.log('Expected (original test):', JSON.stringify('Boldtext'));

console.log('\nStep by step:');
let step = input;
console.log('1. Original:', JSON.stringify(step));

// Remove script tags
step = step.replace(/<script[^>]*>.*?<\/script>/gi, '');
console.log('2. After scripts:', JSON.stringify(step));

// Remove HTML tags
step = step.replace(/<\/?[^>]*>/g, '');
console.log('3. After HTML tags:', JSON.stringify(step));

// Trim whitespace
step = step.replace(/^\s+|\s+$/g, '');
console.log('4. After trim:', JSON.stringify(step));

// Replace entities
step = step.replace(/&/g, '&amp;');
console.log('5. After entities:', JSON.stringify(step));

// Normalize spaces
step = step.replace(/\s+/g, ' ');
console.log('6. After space normalize:', JSON.stringify(step));

console.log('\nInterpretation: The original test expects Boldtext (no space), but correct sanitization should preserve the space between Bold and text.');