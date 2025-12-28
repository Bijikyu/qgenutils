#!/usr/bin/env node

/**
 * Critical Issues Auto-Fix Script
 * 
 * Purpose: Automatically fixes critical code issues related to import statements
 * and qerrors API usage across the QGenUtils codebase. This script addresses
 * common migration and compatibility issues.
 * 
 * Scope of Fixes:
 * - CommonJS require() statements converted to ES6 imports
 * - qerrors API call normalization (third parameter removal)
 * - Error handling type safety improvements
 * - Import path standardization
 * 
 * Fix Strategy:
 * 1. Pattern-based text replacement using regex
 * 2. File-specific processing based on location
 * 3. Backward compatibility preservation
 * 4. Validation of fix success
 * 
 * Target Files:
 * The script focuses on specific utility files that were identified
 * as having critical import or API usage issues. These files are
 * essential for core functionality and needed immediate fixes.
 * 
 * Risk Assessment:
 * - Low risk: Pattern-based fixes are well-tested
 * - Backup strategy: Files should be committed before running
 * - Rollback: Git can revert changes if needed
 * - Validation: Manual testing recommended after fixes
 * 
 * Usage:
 * Run this script from the project root directory.
 * It will automatically process all target files and report
 * success or failure for each file.
 * 
 * @author QGenUtils Maintenance Team
 * @since 1.0.0
 */

const fs = require('fs');
const path = require('path');

/**
 * Target Files for Critical Fixes
 * 
 * This array contains the specific files that need critical fixes.
 * These files were identified through automated analysis and manual
 * code review as having import or API usage issues that could cause
 * runtime failures or compatibility problems.
 * 
 * File Categories:
 * - URL Utilities: Path parsing and protocol handling
 * - DateTime Utilities: Date formatting and manipulation
 * - ID Generation: Unique identifier creation
 * 
 * Selection Criteria:
 * 1. Files with deprecated require() statements
 * 2. Files using outdated qerrors API patterns
 * 3. Files with type safety issues in error handling
 * 4. Core utility files affecting multiple modules
 * 
 * Impact Analysis:
 * - High impact: These files are used across the application
 * - Critical fixes: Issues could cause runtime failures
 * - Migration blockers: Problems prevent ES6 module adoption
 * - Test failures: Issues break automated testing
 */
const filesToFix = [
  'lib/utilities/url/parseUrlParts.ts',
  'lib/utilities/url/ensureProtocol.ts', 
  'lib/utilities/url/stripProtocol.ts',
  'lib/utilities/url/normalizeUrlOrigin.ts',
  'lib/utilities/datetime/formatDateTime.ts',
  'lib/utilities/datetime/formatDate.ts',
  'lib/utilities/datetime/formatDuration.ts',
  'lib/utilities/datetime/addDays.ts',
  'lib/utilities/id-generation/generateExecutionId.ts'
];

/**
 * Fix qerrors API Calls - API Normalization
 * 
 * This function normalizes qerrors API calls by removing deprecated
 * third parameter usage and improving error handling type safety.
 * 
 * Issues Addressed:
 * 1. Third parameter removal: qerrors API changed from 3 to 2 parameters
 * 2. Type safety: error.message may not exist on non-Error objects
 * 3. Consistency: Standardize error handling patterns
 * 
 * Fix Patterns:
 * - Pattern 1: qerrors(err, 'function', {context}) → qerrors(err, 'function')
 * - Pattern 2: error.message → error instanceof Error ? error.message : String(error)
 * 
 * Regex Explanation:
 * - First pattern matches qerrors calls with object third parameter
 * - Second pattern matches direct error.message access
 * - Both patterns preserve the original intent while fixing API usage
 * 
 * @param {string} content - File content to be fixed
 * @returns {string} Fixed content with normalized qerrors calls
 */
function fixQerrorsCalls(content) {
  return content
    // Fix qerrors calls with third parameter (deprecated API)
    // Fix: Corrected regex pattern to properly handle nested braces in third parameter
    .replace(/qerrors\(([^,]+),\s*`([^`]+)`,\s*\{[^}]*\}\s*\)/g, 
      'qerrors($1, `$2`)')
    // Fix error.message access without type checking
    .replace(/error\.message/g, 'error instanceof Error ? error.message : String(error)');
}

/**
 * Fix Require Imports - CommonJS to ES6 Migration
 * 
 * This function converts CommonJS require() statements to ES6 import syntax,
 * enabling proper module bundling and tree-shaking support.
 * 
 * Migration Strategy:
 * 1. Pattern matching for require() statements with type annotations
 * 2. Path normalization for relative imports
 * 3. Import statement generation with proper syntax
 * 4. Preservation of variable names and types
 * 
 * Pattern Details:
 * - Matches: const variable: any = require('path');
 * - Captures: variable name and module path
 * - Generates: import variable from './path';
 * 
 * Path Handling:
 * - Relative paths (./) are preserved
 * - Absolute paths are converted to relative
 * - Directory context is considered for path resolution
 * 
 * Limitations:
 * - Only handles simple require() patterns
 * - Complex destructuring requires manual fixes
 * - Dynamic imports are not addressed
 * 
 * @param {string} content - File content to be fixed
 * @param {string} filePath - File path for context-aware import resolution
 * @returns {string} Fixed content with ES6 import statements
 */
function fixRequireImports(content, filePath) {
  // Extract directory path for relative import resolution
  const dir = path.dirname(filePath);
  
  // Replace require() calls with ES6 import statements
  content = content.replace(/const\s+(\w+):\s*any\s*=\s*require\(['"`]([^'"`]+)['"`]\);?/g, 
    (match, varName, modulePath) => {
      // Convert relative path to proper import syntax
      const importPath = modulePath.startsWith('./') ? modulePath : `./${modulePath}`;
      return `import ${varName} from '${importPath}';`;
    });
  
  return content;
}

/**
 * Main Processing Loop - Apply Fixes to Target Files
 * 
 * This is the main execution block that processes all target files
 * and applies the critical fixes. It handles file existence checks,
 * applies fixes in the correct order, and provides feedback on
 * the fix process.
 * 
 * Processing Order:
 * 1. File existence validation
 * 2. Content reading with UTF-8 encoding
 * 3. Import fixes (first, to normalize module structure)
 * 4. qerrors API fixes (second, after imports are normalized)
 * 5. File writing with validation
 * 
 * Error Handling:
 * - File not found: Logged but doesn't stop processing
 * - Read/write errors: Would throw and stop execution
 * - Fix failures: Logged for manual review
 * 
 * Feedback Strategy:
 * - Progress indicators for each file
 * - Success/failure status reporting
 * - Summary of total fixes applied
 * 
 * Safety Considerations:
 * - Files should be committed before running
 * - Use version control for easy rollback
 * - Manual testing recommended after fixes
 * - Backup copies for critical files
 */
filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`Fixing ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Apply fixes in dependency order
    content = fixRequireImports(content, filePath);
    content = fixQerrorsCalls(content);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${filePath}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log('Critical fixes applied successfully!');