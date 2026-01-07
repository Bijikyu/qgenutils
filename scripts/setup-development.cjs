#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Setting up development environment...');

try {
  // Install pre-commit hooks
  console.log('📝 Installing pre-commit hooks...');
  execSync('npm run prepare', { stdio: 'inherit' });

  // Run initial lint check
  console.log('🔍 Running initial lint check...');
  execSync('npm run lint-check', { stdio: 'inherit' });

  // Quick syntax validation
  console.log('✅ Validating critical files...');
  
  const criticalFiles = [
    'examples/simple-demo-server.cjs',
    'examples/api-client-enhanced.js',
    'examples/demo.html'
  ];

  criticalFiles.forEach(file => {
    try {
      require(`./${file}`);
      console.log(`✅ ${file} - Syntax OK`);
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        console.log(`⚠️  ${file} - Dependencies missing`);
      } else {
        console.log(`❌ ${file} - ERROR: ${error.message}`);
        process.exit(1);
      }
    }
  });

  // Run integration test to verify functionality
  console.log('🧪 Running integration test...');
  execSync('node tests/integration/frontend-backend-integration.test.cjs', { stdio: 'inherit' });

  console.log('🎉 Development setup completed successfully!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('  1. Make changes to code');
  console.log('  2. Run tests: npm test');
  console.log('  3. Pre-commit hooks will automatically run');
  console.log('  4. Deploy when ready');

} catch (error) {
  console.error('💥 Setup failed:', error.message);
  process.exit(1);
}