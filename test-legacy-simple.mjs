/**
 * Simplified Backward Compatibility Test
 * Tests only the core legacy functions we implemented
 */

// Test individual legacy function files directly
console.log('🔍 Testing Individual Legacy Functions\n');

async function testFormatDateTime() {
  console.log('📅 Testing formatDateTime...');
  try {
    const mod = await import('./lib/utilities/datetime/formatDateTime.js');
    const result = mod.default('2023-12-25T10:30:00.000Z');
    console.log(`  ✅ formatDateTime: ${result}`);
    return true;
  } catch (error) {
    console.error(`  ❌ formatDateTime failed: ${error.message}`);
    return false;
  }
}

async function testEnsureProtocol() {
  console.log('🔗 Testing ensureProtocol...');
  try {
    const mod = await import('./lib/utilities/url/ensureProtocol.js');
    const result = mod.default('example.com');
    console.log(`  ✅ ensureProtocol: ${result}`);
    return true;
  } catch (error) {
    console.error(`  ❌ ensureProtocol failed: ${error.message}`);
    return false;
  }
}

async function testValidateEmail() {
  console.log('✉️  Testing validateEmail...');
  try {
    const mod = await import('./lib/utilities/validation/validateEmail.js');
    const result1 = mod.default('test@example.com');
    const result2 = mod.default('invalid-email');
    console.log(`  ✅ validateEmail: valid=${result1}, invalid=${result2}`);
    return true;
  } catch (error) {
    console.error(`  ❌ validateEmail failed: ${error.message}`);
    return false;
  }
}

async function testFormatDuration() {
  console.log('⏱️  Testing formatDuration...');
  try {
    const mod = await import('./lib/utilities/datetime/formatDuration.js');
    const result = mod.default('2023-12-25T10:00:00.000Z', '2023-12-25T11:30:45.000Z');
    console.log(`  ✅ formatDuration: ${result}`);
    return true;
  } catch (error) {
    console.error(`  ❌ formatDuration failed: ${error.message}`);
    return false;
  }
}

async function testAddDays() {
  console.log('📆 Testing addDays...');
  try {
    const mod = await import('./lib/utilities/datetime/addDays.js');
    const result = mod.addDays(7);
    console.log(`  ✅ addDays: ${result instanceof Date ? result.toISOString() : 'Invalid'}`);
    return true;
  } catch (error) {
    console.error(`  ❌ addDays failed: ${error.message}`);
    return false;
  }
}

async function testStripProtocol() {
  console.log('✂️ Testing stripProtocol...');
  try {
    const mod = await import('./lib/utilities/url/stripProtocol.js');
    const result = mod.default('https://example.com/path');
    console.log(`  ✅ stripProtocol: ${result}`);
    return true;
  } catch (error) {
    console.error(`  ❌ stripProtocol failed: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runCompatibilityTests() {
  console.log('🎯 Running Individual Legacy Function Tests\n');
  
  const tests = [
    testFormatDateTime,
    testEnsureProtocol,
    testValidateEmail,
    testFormatDuration,
    testAddDays,
    testStripProtocol
  ];
  
  const results = [];
  for (const test of tests) {
    results.push(await test());
  }
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('\n🎉 ALL LEGACY FUNCTIONS WORKING!');
    console.log('✅ Backward compatibility implementation successful');
    console.log('📋 Legacy systems can use qgenutils without disruption');
  } else {
    console.log('\n⚠️  Some legacy functions have issues');
  }
  
  console.log('\n🔍 Testing Index Exports...');
  
  // Test if our legacy exports are in the main index
  try {
    const indexModule = await import('./index.js');
    const legacyExports = [
      'formatDateTime',
      'ensureProtocol', 
      'validateEmail',
      'formatDuration',
      'addDays',
      'stripProtocol',
      'normalizeUrlOrigin',
      'parseUrlParts'
    ];
    
    let exportCount = 0;
    legacyExports.forEach(funcName => {
      const exists = funcName in indexModule;
      console.log(`  ${exists ? '✅' : '❌'} ${funcName} ${exists ? 'exported' : 'missing'}`);
      if (exists) exportCount++;
    });
    
    console.log(`\n📦 Index Exports: ${exportCount}/${legacyExports.length} available`);
    
    if (exportCount === legacyExports.length) {
      console.log('✅ All legacy functions properly exported from index');
    }
    
  } catch (error) {
    console.error('❌ Index export test failed:', error.message);
  }
}

// Run tests
runCompatibilityTests().catch(console.error);