// Test the regex directly
const PATTERNS = {
  HTML_TAGS: /<\/?[^>]*>/g,
  HTML_ENTITIES: /&/g,
  WHITESPACE: /^\s+|\s+$/g,
  MULTIPLE_SPACES: /\s+/g,
  MALICIOUS_PATTERNS: /(?:javascript:|on\w+\s*=|data:)/i
};

function testSanitize(input) {
  var result = input;
  
  console.log('Original:', JSON.stringify(input));
  
  // Remove HTML tags
  result = result.replace(PATTERNS.HTML_TAGS, '');
  console.log('After HTML tags:', JSON.stringify(result));
  
  // Trim whitespace  
  result = result.replace(PATTERNS.WHITESPACE, '');
  console.log('After trim:', JSON.stringify(result));
  
  // Replace entities
  result = result.replace(PATTERNS.HTML_ENTITIES, '&amp;');
  console.log('After entities:', JSON.stringify(result));
  
  // Normalize spaces
  result = result.replace(PATTERNS.MULTIPLE_SPACES, ' ');
  console.log('Final:', JSON.stringify(result));
  
  return result;
}

console.log('=== Testing Regex Directly ===\n');
testSanitize('<script>alert("xss")</script>Hello');