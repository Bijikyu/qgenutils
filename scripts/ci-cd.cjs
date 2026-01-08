/**
 * CI/CD Pipeline Automation Script
 * 
 * Provides comprehensive automation for:
 * - Version management and semantic versioning
 * - Automated testing and quality gates
 * - Build and packaging
 * - Deployment to multiple environments
 * - Rollback capabilities
 * - Release notes generation
 * - Integration with CI/CD systems
 */

import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

// Handle both ESM and CommonJS
const require = createRequire(import.meta.url);

// Import CI/CD components
const { 
  VersionManager, 
  BuildManager, 
  TestingManager, 
  DeploymentManager, 
  ReleaseManager, 
  CICDPipeline 
} = require('./ci-cd.js');

// Main execution
if (require.main === module) {
  const [command, ...args] = process.argv.slice(2);
  
  const cli = new CICDPipeline();
  cli.handleCommand(command, args).catch(error => {
    console.error('❌ Command failed:', error.message);
    process.exit(1);
  });
}

export default CICDPipeline;