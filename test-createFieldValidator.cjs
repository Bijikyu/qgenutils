// Test createFieldValidator behavior
const { createFieldValidator } = require('./dist/lib/utilities/validation/createFieldValidator.js');

console.log('🧪 Testing createFieldValidator behavior...\n');

// Test 1: Success case
const successValidator = createFieldValidator(
  (value) => value === 'success',
  'must be success'
);

const successResult = successValidator('success', 'testField');
console.log('Success case:', successResult);
console.log('Type:', typeof successResult);

// Test 2: Failure case
const failureValidator = createFieldValidator(
  (value) => value === 'fail',
  'must be fail'
);

const failureResult = failureValidator('fail', 'testField');
console.log('Failure case:', failureResult);
console.log('Type:', typeof failureResult);

// Test 3: What happens with no options
const defaultValidator = createFieldValidator(
  (value) => typeof value === 'string',
  'must be string'
);

const defaultResult = defaultValidator(123, 'testField');
console.log('Default options:', defaultResult);
console.log('Type:', typeof defaultResult);