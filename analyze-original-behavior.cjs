// Simple implementation of sanitizeInput based on original test expectations
function simpleSanitize(input) {
  if (input === null || input === undefined) return '';
  var str = String(input);
  if (str.length === 0) return '';
  
  // Remove ALL HTML tags and their content based on test expectations
  var result = str.replace(/<[^>]*>/g, '');
  result = result.trim(); // This removes leading/trailing spaces
  result = result.replace(/&/g, '&amp;');
  result = result.replace(/\s+/g, ' ');
  
  return result;
}

console.log('=== Testing Simple Implementation ===\n');
console.log('<b>Bold</b> text ->', JSON.stringify(simpleSanitize('<b>Bold</b> text')));
console.log('Expected Boldtext:', JSON.stringify('Boldtext'));
console.log('With space preserved:', JSON.stringify('Bold text'));

console.log('\nConclusion: Original test expects spaces removed after tags.');
console.log('My implementation preserves spaces (more correct behavior).');