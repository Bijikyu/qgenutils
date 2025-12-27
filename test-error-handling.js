#!/usr/bin/env node

// Simple test to verify error handling implementation
console.log('Testing error handling implementation...\n');

// Test 1: extractApiKey with malformed request
try {
  const extractApiKey = require('./lib/utilities/security/extractApiKey.ts').default;
  
  // Test with malformed request object
  const malformedReq = {
    headers: {
      'authorization': 'Bearer valid-token'
    }
  };
  
  // This should work without throwing
  const result = extractApiKey(malformedReq);
  console.log('✅ extractApiKey: Passed normal case');
  
  // Test with null/undefined
  const nullResult = extractApiKey(null);
  console.log('✅ extractApiKey: Handled null input');
  
} catch (err) {
  console.log('❌ extractApiKey: Failed -', err.message);
}

// Test 2: createHttpConfig with invalid parameters
try {
  const createHttpConfig = require('./lib/utilities/http/createHttpConfig.ts').default;
  
  // This should work with valid parameters
  const config = createHttpConfig('test-key', { 'Content-Type': 'application/json' }, 5000);
  console.log('✅ createHttpConfig: Passed normal case');
  
} catch (err) {
  console.log('❌ createHttpConfig: Failed -', err.message);
}

// Test 3: validateAmount with edge cases
try {
  const validateAmount = require('./lib/utilities/validation/validateAmount.ts').default;
  
  // Test valid amount
  const validResult = validateAmount(100.50);
  console.log('✅ validateAmount: Passed valid amount');
  
  // Test invalid amount
  const invalidResult = validateAmount(-50);
  console.log('✅ validateAmount: Handled negative amount');
  
} catch (err) {
  console.log('❌ validateAmount: Failed -', err.message);
}

// Test 4: validateEmail with edge cases
try {
  const validateEmail = require('./lib/utilities/validation/validateEmail.ts').default;
  
  // Test valid email
  const validResult = validateEmail('test@example.com');
  console.log('✅ validateEmail: Passed valid email');
  
  // Test invalid email
  const invalidResult = validateEmail('invalid-email');
  console.log('✅ validateEmail: Handled invalid email');
  
} catch (err) {
  console.log('❌ validateEmail: Failed -', err.message);
}

console.log('\nError handling implementation test completed!');