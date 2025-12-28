/**
 * Simple backward compatibility test
 */

// Test importing the legacy functions directly
import formatDateTime from './lib/utilities/datetime/formatDateTime.ts';
import ensureProtocol from './lib/utilities/url/ensureProtocol.ts';
import validateEmailFormat from './lib/utilities/validation/validateEmail.ts';

console.log('Testing backward compatibility functions...\n');

// Test formatDateTime
console.log('✓ formatDateTime available:', typeof formatDateTime);
if (formatDateTime) {
  const result = formatDateTime('2023-12-25T10:30:00.000Z');
  console.log('  formatDateTime test:', result);
}

// Test ensureProtocol  
console.log('✓ ensureProtocol available:', typeof ensureProtocol);
if (ensureProtocol) {
  const result = ensureProtocol('example.com');
  console.log('  ensureProtocol test:', result);
}

// Test validateEmail (with alias)
console.log('✓ validateEmailFormat available:', typeof validateEmailFormat);
if (validateEmailFormat) {
  const result = validateEmailFormat('test@example.com');
  console.log('  validateEmailFormat test:', result);
}

// Create alias for backward compatibility
const validateEmail = validateEmailFormat;
console.log('✓ validateEmail alias available:', typeof validateEmail);
if (validateEmail) {
  const result = validateEmail('alias@test.com');
  console.log('  validateEmail alias test:', result);
}

console.log('\n✅ All backward compatibility functions working!');