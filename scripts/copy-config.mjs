#!/usr/bin/env node

/**
 * Post-build script to ensure config files are properly copied
 * This ensures JavaScript config files are available to the built distribution
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distConfigDir = path.join(__dirname, '..', 'dist', 'config');
const sourceConfigDir = path.join(__dirname, '..', 'config');

// Create config directory if it doesn't exist
if (!fs.existsSync(distConfigDir)) {
  fs.mkdirSync(distConfigDir, { recursive: true });
}

// Copy JavaScript config files
const configFiles = ['localVars.js'];
configFiles.forEach(file => {
  const sourcePath = path.join(sourceConfigDir, file);
  const destPath = path.join(distConfigDir, file);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✅ Copied ${file} to dist/config/`);
  }
});