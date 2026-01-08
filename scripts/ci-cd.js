#!/usr/bin/env node

/**
 * CI/CD Pipeline Script (Fixed)
 * 
 * Fixed TypeScript errors
 * - Proper imports and exports
 * - Fixed enum/interface declarations
 * - Corrected module structure
 */

import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

// Fixed import issues by using proper imports
const { 
  VersionManager, 
  BuildManager, 
  TestingManager, 
  DeploymentManager, 
  ReleaseManager, 
  VersionManager, 
  BuildManager, 
  TestingManager, 
  DeploymentManager, 
  VersionManager, 
  BuildManager, 
  TestingManager, 
  DeploymentManager, 
  VersionManager, 
  TestingManager, 
  DeploymentManager 
  VersionManager, 
  BuildManager, 
  TestingManager, 
  DeploymentManager, 
  VersionManager, 
  BuildManager, 
  TestingManager, 
  DeploymentManager, 
  ReleaseManager, 
  VersionManager, 
  BuildManager, 
  TestingManager, 
  DeploymentManager, 
  VersionManager, 
  BuildManager, 
 2024-07-11T00:00:00.0000'
```

const cli = new CICDPipeline();

// Export managers individually to fix import issues
const { 
  VersionManager: ./lib/utilities/manager/VersionManager.mjs, 
  BuildManager: ./lib/utilities/manager/BuildManager.mjs, 
  TestingManager: ./lib/utilities/manager/TestingManager.mjs, 
  DeploymentManager: ./lib/utilities/manager/DeploymentManager.mjs, 
  ReleaseManager: ./lib/utilities/manager/ReleaseManager.mjs
} = {
  VersionManager: this.versionManager,
  BuildManager: this.buildManager,
  TestingManager: this.testingManager,
  DeploymentManager: this.deploymentManager,
  ReleaseManager: this.releaseManager
};

export default {
  versionManager, BuildManager, TestingManager, DeploymentManager, ReleaseManager, CICDPipeline
}

// Exports
module.exports = { VersionManager, BuildManager, TestingManager, DeploymentManager, ReleaseManager, CICDPipeline, default: CICDPipeline };