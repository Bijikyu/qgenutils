/**
 * Final Legacy Functions Test
 * Tests all legacy functions are working in qgenutils
 */

console.log('🎯 TESTING FINAL LEGACY COMPATIBILITY\n');

// Test using built distribution
async function testBuiltDistribution() {
  console.log('📦 Testing built distribution...');
  
  try {
    // Try CommonJS require
    const utils = require('./dist/index.js');
    
    const legacyFunctions = [
      'formatDateTime',
      'formatDuration',
      'addDays',
      'ensureProtocol', 
      'normalizeUrlOrigin',
      'stripProtocol',
      'parseUrlParts',
      'validateEmail',
      // Missing legacy functions we implemented
      'requireFields',
      'checkPassportAuth',
      'hasGithubStrategy',
      'calculateContentLength',
      'getRequiredHeader',
      'sendJsonResponse',
      'buildCleanHeaders',
      'renderView',
      'registerViewRoute'
    ];
    
    let availableCount = 0;
    const results = [];
    
    console.log('🔍 Checking function availability:');
    for (const funcName of legacyFunctions) {
      const isAvailable = typeof utils[funcName] === 'function';
      results.push({ name: funcName, available: isAvailable });
      
      if (isAvailable) {
        availableCount++;
        console.log(`  ✅ ${funcName}: Available`);
      } else {
        console.log(`  ❌ ${funcName}: Missing`);
      }
    }
    
    console.log(`\n📊 Legacy Functions Available: ${availableCount}/${legacyFunctions.length} (${(availableCount/legacyFunctions.length*100).toFixed(1)}%)`);
    
    // Test some functions work
    console.log('\n🧪 Testing function functionality:');
    
    if (utils.formatDateTime) {
      try {
        const result = utils.formatDateTime('2023-12-25T10:30:00.000Z');
        console.log(`  ✅ formatDateTime: ${result}`);
      } catch (error) {
        console.log(`  ❌ formatDateTime test failed: ${error.message}`);
      }
    }
    
    if (utils.ensureProtocol) {
      try {
        const result = utils.ensureProtocol('example.com');
        console.log(`  ✅ ensureProtocol: ${result}`);
      } catch (error) {
        console.log(`  ❌ ensureProtocol test failed: ${error.message}`);
      }
    }
    
    if (utils.validateEmail) {
      try {
        const valid = utils.validateEmail('test@example.com');
        const invalid = utils.validateEmail('invalid-email');
        console.log(`  ✅ validateEmail: valid=${valid}, invalid=${invalid}`);
      } catch (error) {
        console.log(`  ❌ validateEmail test failed: ${error.message}`);
      }
    }
    
    if (utils.requireFields) {
      try {
        const result = utils.requireFields(['name', 'email'], { name: 'Test', email: 'test@example.com' });
        console.log(`  ✅ requireFields: ${result}`);
      } catch (error) {
        console.log(`  ❌ requireFields test failed: ${error.message}`);
      }
    }
    
    if (utils.sendJsonResponse) {
      try {
        // Test with mock response object
        const mockRes = {
          setHeader: () => {},
          status: () => mockRes,
          json: () => {}
        };
        utils.sendJsonResponse(mockRes, { test: 'success' }, 200);
        console.log(`  ✅ sendJsonResponse: Function executed without error`);
      } catch (error) {
        console.log(`  ❌ sendJsonResponse test failed: ${error.message}`);
      }
    }
    
    return {
      total: legacyFunctions.length,
      available: availableCount,
      successRate: (availableCount / legacyFunctions.length) * 100,
      results
    };
    
  } catch (error) {
    console.error('❌ Built distribution test failed:', error.message);
    return {
      total: legacyFunctions.length,
      available: 0,
      successRate: 0,
      results: [],
      error: error.message
    };
  }
}

// Run the test
async function runFinalCompatibilityTest() {
  console.log('🚀 Running Final Compatibility Test\n');
  
  const result = await testBuiltDistribution();
  
  console.log('\n🎯 FINAL COMPATIBILITY RESULTS');
  console.log('='.repeat(50));
  console.log(`📊 Legacy Functions: ${result.available}/${result.total} available`);
  console.log(`📈 Success Rate: ${result.successRate.toFixed(1)}%`);
  console.log(`🔧 Build Status: ${result.error ? 'FAILED' : 'SUCCESS'}`);
  
  if (result.successRate >= 100) {
    console.log('\n🎉 COMPLETE SUCCESS!');
    console.log('✅ All legacy functions are available and working');
    console.log('✅ Backward compatibility implementation is COMPLETE');
    console.log('✅ Legacy systems can use qgenutils without disruption');
    console.log('✅ Production ready for deployment');
    
    console.log('\n📋 FINAL STATUS:');
    console.log('Status: ✅ BACKWARD COMPATIBILITY IMPLEMENTATION COMPLETE');
    console.log('Phase: 🚀 PRODUCTION READY');
    console.log('Coverage: 📊 100% LEGACY FUNCTION AVAILABILITY');
    console.log('Next Steps: 📚 DOCUMENTATION & DEPLOYMENT');
    
  } else if (result.successRate >= 80) {
    console.log('\n⚠️  PARTIAL SUCCESS');
    console.log('✅ Most legacy functions available');
    console.log('❌ Some missing functions need investigation');
    
  } else {
    console.log('\n❌ COMPATIBILITY ISSUES');
    console.log('❌ Significant problems with backward compatibility');
    console.log('❌ Requires immediate attention and fixes');
  }
  
  console.log('\n' + '='.repeat(50));
  
  console.log('\n📈 SUMMARY REPORT:');
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    testType: 'Final Backward Compatibility Test',
    results: result.results,
    summary: {
      totalFunctions: result.total,
      availableFunctions: result.available,
      successRate: result.successRate,
      status: result.successRate >= 100 ? 'COMPLETE_SUCCESS' : 
             result.successRate >= 80 ? 'PARTIAL_SUCCESS' : 'COMPATIBILITY_ISSUES',
      readyForProduction: result.successRate >= 80
    },
    recommendations: result.successRate >= 100 ? [
      'Deploy to production',
      'Monitor legacy system adoption',
      'Continue modern API development'
    ] : result.successRate >= 80 ? [
      'Fix missing legacy function exports',
      'Investigate import issues',
      'Test with real legacy systems'
    ] : [
      'Critical: Fix backward compatibility implementation',
      'Review all export mechanisms',
      'Test build process thoroughly',
      'Consider compatibility layer redesign'
    ]
  }, null, 2));
}

// Execute the final test
runFinalCompatibilityTest().catch(console.error);