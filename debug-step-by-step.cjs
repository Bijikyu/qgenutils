const input = '<script>alert("xss")</script>Hello';
console.log('Input:', input);

// Test step by step
const regex = /<\/?[^>]*>/g;
const matches = input.match(regex);
console.log('Matches:', matches);

const result = input.replace(regex, '');
console.log('After replace:', result);
console.log('Expected: Hello');

// Test each tag separately
console.log('\nTesting individual tags:');
console.log('<script> ->', '<script>'.replace(regex, ''));
console.log('</script> ->', '</script>'.replace(regex, ''));

// Test comprehensive HTML removal
const comprehensiveRegex = /<[^>]*>/g;
console.log('\nComprehensive regex:');
console.log('Input:', input);
console.log('After comprehensive:', input.replace(comprehensiveRegex, ''));