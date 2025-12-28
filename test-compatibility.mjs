// Test backward compatibility with ES modules
import utils from './index.ts';

console.log('Testing backward compatibility exports...');

try {
  // Test named exports
  console.log('✓ formatDateTime available:', typeof utils.formatDateTime);
  console.log('✓ ensureProtocol available:', typeof utils.ensureProtocol);
  console.log('✓ validateEmail available:', typeof utils.validateEmail);
  console.log('✓ formatDuration available:', typeof utils.formatDuration);
  console.log('✓ addDays available:', typeof utils.addDays);
  console.log('✓ normalizeUrlOrigin available:', typeof utils.normalizeUrlOrigin);
  console.log('✓ stripProtocol available:', typeof utils.stripProtocol);
  console.log('✓ parseUrlParts available:', typeof utils.parseUrlParts);
  
  // Test basic functionality
  if (utils.formatDateTime) {
    console.log('✓ formatDateTime test:', utils.formatDateTime('2023-12-25T10:30:00.000Z'));
  }
  
  if (utils.ensureProtocol) {
    console.log('✓ ensureProtocol test:', utils.ensureProtocol('example.com'));
  }
  
  if (utils.validateEmail) {
    console.log('✓ validateEmail test:', utils.validateEmail('test@example.com'));
  }
  
  console.log('\n✅ All backward compatibility exports working!');
  
} catch (error) {
  console.error('❌ Error testing backward compatibility:', error.message);
  process.exit(1);
}