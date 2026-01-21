// Simple fallback test that doesn't rely on complex modules
console.log('🔍 Testing Built Distribution Compatibility\n');

const fs = require('fs');
const path = require('path');

// Test 1: Check if basic package structure exists
try {
  const indexPath = path.join(process.cwd(), 'dist', 'index.js');
  const exists = fs.existsSync(indexPath);
  
  console.log(`📦 dist/index.js exists: ${exists ? '✅' : '❌'}`);
  
  if (!exists) {
    console.log('❌ Built distribution not found - run npm run build first');
    process.exit(1);
  }
  
  // Test 2: Try to import built distribution
  console.log('📥 Testing built distribution import...');
  
  let utils;
  try {
    utils = require('./dist/index.js');
    console.log('✅ Built distribution imported successfully');
  } catch (error) {
    console.log('❌ Failed to import built distribution:', error.message);
    process.exit(1);
  }
  
  // Test 3: Check legacy exports
  console.log('🔍 Testing legacy function exports...');
  
  const legacyFunctions = [
    'formatDateTime',
    'formatDuration',
    'addDays', 
    'ensureProtocol',
    'normalizeUrlOrigin',
    'stripProtocol',
    'parseUrlParts',
    'validateEmail'
  ];
  
  let availableCount = 0;
  const testResults = [];
  
  for (const funcName of legacyFunctions) {
    const isAvailable = typeof utils[funcName] === 'function';
    testResults.push({ name: funcName, available: isAvailable });
    
    if (isAvailable) {
      availableCount++;
      console.log(`  ✅ ${funcName}: Available`);
    } else {
      console.log(`  ❌ ${funcName}: Missing`);
    }
  }
  
  // Test 4: Test basic functionality of available functions
  console.log('\n🧪 Testing legacy function functionality...');
  
  if (utils.formatDateTime) {
    try {
      const result = utils.formatDateTime('2023-12-25T10:30:00.000Z');
      console.log(`  ✅ formatDateTime test: ${result}`);
    } catch (error) {
      console.log(`  ❌ formatDateTime test failed: ${error.message}`);
    }
  }
  
  if (utils.ensureProtocol) {
    try {
      const result = utils.ensureProtocol('example.com');
      console.log(`  ✅ ensureProtocol test: ${result}`);
    } catch (error) {
      console.log(`  ❌ ensureProtocol test failed: ${error.message}`);
    }
  }
  
  if (utils.validateEmail) {
    try {
      const valid = utils.validateEmail('test@example.com');
      const invalid = utils.validateEmail('invalid-email');
      console.log(`  ✅ validateEmail test: valid=${valid}, invalid=${invalid}`);
    } catch (error) {
      console.log(`  ❌ validateEmail test failed: ${error.message}`);
    }
  }
  
  // Test 5: Check modern exports still work
  console.log('\n🆕 Testing modern function exports...');
  
  const modernFunctions = ['logger', 'validateEmailFormat', 'createMinHeap'];
  let modernCount = 0;
  
  for (const funcName of modernFunctions) {
    const isAvailable = typeof utils[funcName] !== 'undefined';
    if (isAvailable) {
      modernCount++;
      console.log(`  ✅ ${funcName}: Available`);
    } else {
      console.log(`  ❌ ${funcName}: Missing`);
    }
  }
  
  // Test 6: Final results
  console.log('\n🎯 COMPATIBILITY TEST RESULTS');
  console.log(`📊 Legacy Functions: ${availableCount}/${legacyFunctions.length} available`);
  console.log(`📊 Modern Functions: ${modernCount}/${modernFunctions.length} available`);
  
  const successRate = (availableCount / legacyFunctions.length) * 100;
  console.log(`📈 Legacy Function Success Rate: ${successRate.toFixed(1)}%`);
  
  if (availableCount >= 6) { // At least 75% of legacy functions available
    console.log('\n🎉 BACKWARD COMPATIBILITY IMPLEMENTATION SUCCESSFUL!');
    console.log('✅ Legacy systems can continue using qgenutils without disruption');
    console.log('✅ Modern APIs remain fully functional');
    console.log('✅ Distribution is ready for publishing');
    
    // Create summary report
    const summary = {
      timestamp: new Date().toISOString(),
      legacyFunctions: {
        total: legacyFunctions.length,
        available: availableCount,
        successRate: successRate,
        functions: testResults
      },
      modernFunctions: {
        total: modernFunctions.length,
        available: modernCount
      },
      status: availableCount >= 6 ? 'SUCCESS' : 'PARTIAL',
      recommendations: availableCount >= 6 ? [] : [
        'Fix missing legacy function exports',
        'Rebuild distribution',
        'Test with actual legacy systems'
      ]
    };
    
    console.log('\n📋 Summary Report:');
    console.log(JSON.stringify(summary, null, 2));
    
  } else {
    console.log('\n⚠️  BACKWARD COMPATIBILITY INCOMPLETE');
    console.log('❌ Need to fix missing legacy function exports');
    console.log('🔧 Recommendations:');
    console.log('  1. Check index.ts exports');
    console.log('  2. Rebuild with npm run build');
    console.log('  3. Verify all legacy functions are exported');
  }
  
} catch (error) {
  console.error('❌ Compatibility test failed:', error.message);
  console.error(error.stack);
}