const sanitizeInput = require('./lib/utilities/validation/sanitizeInput.cjs');

console.log('=== Debug Sanitization Issues ===\n');

// Test HTML removal more thoroughly
console.log('HTML Removal Tests:');
const tests = [
  '<script>alert("xss")</script>Hello',
  '<b>Bold</b> text',
  '<div><p>Nested</p></div>',
  '<img src="x" onerror="alert(1)">',
  'Plain text'
];

tests.forEach(function(test, i) {
  const result = sanitizeInput(test);
  console.log(`${i + 1}. Input: ${JSON.stringify(test)}`);
  console.log(`   Output: ${JSON.stringify(result)}`);
  console.log(`   Length: ${test.length} -> ${result.length}`);
  console.log('');
});