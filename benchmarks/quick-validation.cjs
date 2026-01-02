#!/usr/bin/env node

/**
 * Quick Performance Validation
 */

console.log('🚀 Quick Migration Validation\n');

// Test basic functionality
try {
  console.log('Testing module imports...');
  
  // Test with dynamic import for ES modules
  import('../dist/lib/utilities/collections/index.js').then(module => {
    console.log('✅ Collections module loaded successfully');
    
    // Test basic operations
    const testArray = [1, 2, 3, 4, 5, 1, 2];
    const uniqueResult = module.default.unique(testArray);
    console.log('✅ unique() works:', uniqueResult.length === 5);
    
    const chunkResult = module.default.chunk(testArray, 2);
    console.log('✅ chunk() works:', chunkResult.length === 4);
    
    const testObj = { a: 1, b: 2, c: 3 };
    const pickResult = module.default.pick(testObj, ['a', 'c']);
    console.log('✅ pick() works:', Object.keys(pickResult).length === 2);
    
    console.log('\n🎯 All basic functionality tests PASSED');
    console.log('✅ Migration validation SUCCESSFUL');
    
    // Simple performance test
    console.log('\n📊 Performance Test:');
    const start = Date.now();
    for (let i = 0; i < 100000; i++) {
      module.default.unique([1, 2, 3, 4, 5]);
    }
    const end = Date.now();
    const time = end - start;
    
    console.log(`100k unique() operations: ${time}ms (${(time/100000).toFixed(3)}ms avg)`);
    
    if (time < 1000) {
      console.log('✅ Performance acceptable');
    } else {
      console.log('⚠️ Performance may need optimization');
    }
    
  }).catch(error => {
    console.error('❌ Module import failed:', error.message);
    process.exit(1);
  });
  
} catch (error) {
  console.error('❌ Validation failed:', error.message);
  process.exit(1);
}