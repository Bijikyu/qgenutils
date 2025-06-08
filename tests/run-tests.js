
const { spawn } = require('child_process');
const path = require('path');

// Test runner configuration
const testConfig = {
  configPath: path.join(__dirname, 'jest.config.js'),
  rootDir: path.join(__dirname, '..')
};

// Command line arguments
const args = process.argv.slice(2);
const isWatchMode = args.includes('--watch');
const isCoverage = args.includes('--coverage') || !args.includes('--no-coverage');
const isVerbose = args.includes('--verbose');

// Build Jest command
const jestArgs = [
  '--config', testConfig.configPath,
  '--rootDir', testConfig.rootDir
];

if (isWatchMode) {
  jestArgs.push('--watch');
}

if (isCoverage) {
  jestArgs.push('--coverage');
}

if (isVerbose) {
  jestArgs.push('--verbose');
}

// Add any additional arguments
const additionalArgs = args.filter(arg => 
  !['--watch', '--coverage', '--no-coverage', '--verbose'].includes(arg)
);
jestArgs.push(...additionalArgs);

console.log('🧪 Running QGenUtils Test Suite...\n');
console.log(`Configuration: ${testConfig.configPath}`);
console.log(`Root Directory: ${testConfig.rootDir}`);
console.log(`Jest Arguments: ${jestArgs.join(' ')}\n`);

// Run Jest
const jest = spawn('npx', ['jest', ...jestArgs], {
  stdio: 'inherit',
  cwd: testConfig.rootDir
});

jest.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ All tests passed!');
  } else {
    console.log(`\n❌ Tests failed with exit code ${code}`);
    process.exit(code);
  }
});

jest.on('error', (error) => {
  console.error('❌ Failed to start test runner:', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n⚠️  Test runner interrupted');
  jest.kill('SIGINT');
  process.exit(130);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  Test runner terminated');
  jest.kill('SIGTERM');
  process.exit(143);
});
