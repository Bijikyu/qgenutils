/**
 * Distribution Directory Cleanup Script
 * 
 * Purpose: Removes compiled test files and mock directories from the dist/
 * folder to prevent duplicate mock warnings and ensure clean production builds.
 * This script is essential for maintaining build hygiene and preventing
 * test-related artifacts from polluting production distributions.
 * 
 * Cleanup Strategy:
 * - Targeted Removal: Only removes specific test-related files and directories
 * - Safe Operations: Uses force flags to prevent permission errors
 * - Recursive Scanning: Traverses entire directory tree for comprehensive cleanup
 * - Error Resilience: Continues processing even if individual operations fail
 * 
 * Files and Directories Targeted:
 * 1. Test Files: *.test.js, *.spec.js, *.test.jsx, *.spec.jsx
 * 2. Mock Directories: __mocks__/ folders at any level
 * 3. Generated Tests: Files with "GeneratedTest" in filename
 * 4. Test Variants: .cjs, .mjs, .js, .jsx extensions with test/spec patterns
 * 
 * Build Hygiene Benefits:
 * - Prevents Duplicate Mocks: Eliminates Jest mock conflicts
 * - Reduces Bundle Size: Removes test code from production builds
 * - Avoids Runtime Errors: Prevents test code execution in production
 * - Ensures Clean Deployments: Guarantees production-only artifacts
 * 
 * Safety Considerations:
 * - Force Flag: Uses { force: true } to prevent permission errors
 * - Recursive Flag: Safe directory removal with { recursive: true }
 * - Error Handling: Continues operation on individual file failures
 * - Path Validation: Uses path.join for cross-platform compatibility
 * 
 * Error Handling Strategy:
 * - Graceful Degradation: Script continues on individual file failures
 * - Comprehensive Logging: Uses qerrors for consistent error reporting
 * - Optional Dependencies: Works without qerrors if unavailable
 * - Non-Fatal Errors: Build process not interrupted by cleanup failures
 * 
 * Performance Considerations:
 * - Iterative Scanning: Uses stack-based directory traversal
 * - Early Termination: Skips non-matching files quickly
 * - Minimal System Calls: Efficient directory reading patterns
 * - Memory Conscious: Processes directories iteratively
 * 
 * @author Build Tools Team
 * @since 1.0.0
 */

import fs from 'fs';
import path from 'path';

// ============================================================================
// ERROR REPORTING SETUP
// ============================================================================

/**
 * Optional qerrors Integration for Consistent Error Reporting
 * 
 * Attempts to import qerrors for standardized error logging across the
 * application. If qerrors is not available (e.g., during early build stages),
 * script continues with basic error handling to ensure reliability.
 * 
 * Integration Strategy:
 * - Dynamic Import: Uses async function for optional dependency loading
 * - Graceful Fallback: Continues operation if qerrors unavailable
 * - Error Isolation: Import failures don't stop cleanup process
 * - Consistent Interface: Maintains qerrors API when available
 * 
 * Usage Context:
 * - Build Scripts: May run before qerrors is available
 * - CI/CD Pipelines: Error reporting consistency across environments
 * - Development Tools: Standardized logging for debugging
 * - Production Builds: Error tracking for build failures
 */
let qerrors = null;

// Fix: Wrap in async function to avoid top-level await issues
async function initializeQerrors() {
  try {
    const qerrorsModule = await import('qerrors');
    qerrors = qerrorsModule.qerrors;
  } catch {
    // qerrors not available, continue without it
    console.warn('qerrors not available for error reporting, using basic logging');
  }
}

// Fix: Remove duplicate call - will be called later in main execution
// await initializeQerrors();

/**
 * Safe Directory Removal Utility
 * 
 * Removes directories safely with comprehensive error handling and
 * force flags to prevent permission-related failures. This utility
 * is specifically designed for removing mock directories and other
 * build artifacts that may have restrictive permissions.
 * 
 * Safety Features:
 * - Force Flag: { force: true } prevents permission errors
 * - Recursive Flag: { recursive: true } removes entire directory trees
 * - Error Handling: Logs failures without stopping execution
 * - Type Safety: Validates error objects before processing
 * 
 * Use Cases:
 * - Mock Directory Cleanup: Removes __mocks__ folders safely
 * - Build Artifact Removal: Cleans generated directories
 * - Permission Handling: Works with restrictive file permissions
 * - Cross-Platform: Consistent behavior across operating systems
 * 
 * Error Handling Strategy:
 * - Non-Fatal Errors: Directory removal failures don't stop script
 * - Detailed Logging: Error context preserved for debugging
 * - Type Validation: Ensures error objects are properly formatted
 * - Graceful Degradation: Script continues on individual failures
 * 
 * @param {string} p - Path to directory to be removed
 */
function rmDirSafe(p) {
  try {
    // Remove directory recursively with force flag to prevent permission errors
    fs.rmSync(p, { recursive: true, force: true });
  } catch (error) {
    // Log error with qerrors if available, otherwise continue silently
    if (qerrors) {
      qerrors(
        error instanceof Error ? error : new Error(String(error)), 
        'rmDirSafe', 
        `Directory removal failed for: ${p}`
      );
    }
  }
}

/**
 * Main Distribution Cleanup Function
 * 
 * Performs comprehensive cleanup of the dist/ directory by removing test files,
 * mock directories, and other build artifacts that should not be included in
 * production builds. Uses iterative directory traversal for memory efficiency.
 * 
 * Cleanup Algorithm:
 * 1. Directory Validation: Checks dist/ existence and accessibility
 * 2. Iterative Traversal: Uses stack-based scanning (prevents recursion limits)
 * 3. Pattern Matching: Identifies test files and mock directories
 * 4. Safe Removal: Deletes matched items with error handling
 * 5. Error Resilience: Continues processing on individual failures
 * 
 * Target Patterns:
 * - Test Files: /\.(test|spec)\.[cm]?jsx?$/ matches various test file extensions
 * - Mock Directories: __mocks__ directories at any level
 * - Generated Tests: Files containing "GeneratedTest" in filename
 * - File Extensions: Supports .js, .jsx, .cjs, .mjs variants
 * 
 * Performance Optimizations:
 * - Stack-Based Traversal: Prevents recursion depth issues
 * - Early Pattern Matching: Quick regex tests for file filtering
 * - Minimal System Calls: Efficient directory reading patterns
 * - Memory Conscious: Processes directories iteratively
 * 
 * Error Handling Philosophy:
 * - Non-Blocking Errors: Individual file failures don't stop cleanup
 * - Comprehensive Logging: Detailed error context for debugging
 * - Graceful Continuation: Script completes even with some failures
 * - Build Resilience: Cleanup failures don't break build process
 * 
 * @param {string} root - Root directory path (typically process.cwd())
 */
function cleanDist(root) {
  // Construct dist directory path with cross-platform compatibility
  const dist = path.join(root, 'dist');
  
  // Validate dist directory existence and accessibility
  try {
    if (!fs.existsSync(dist)) return;
  } catch (error) {
    if (qerrors) {
      qerrors(
        error instanceof Error ? error : new Error(String(error)), 
        'cleanDist', 
        `Dist directory check failed for: ${dist}`
      );
    }
    return;
  }
  
  // Iterative directory traversal using stack (prevents recursion limits)
  const stack = [dist];
  while (stack.length) {
    const dir = stack.pop();
    let entries = [];
    
    // Read directory contents with file type information
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (error) {
      if (qerrors) {
        qerrors(
          error instanceof Error ? error : new Error(String(error)), 
          'cleanDist', 
          `Directory read failed for: ${dir}`
        );
      }
      continue; // Skip to next directory on read failure
    }
    
    // Process each directory entry
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      
      // Handle directories: remove __mocks__, traverse others
      if (ent.isDirectory()) {
        if (ent.name === '__mocks__') {
          // Remove mock directories safely
          rmDirSafe(full);
          continue;
        }
        // Add non-mock directories to traversal stack
        stack.push(full);
        continue;
      }
      
      // Only process regular files (skip symlinks, special files)
      if (!ent.isFile()) continue;
      
      // Remove test files matching specific patterns
      if (/\.(test|spec)\.[cm]?jsx?$/.test(ent.name) || /GeneratedTest/.test(ent.name)) {
        try {
          fs.rmSync(full, { force: true });
        } catch (error) {
          if (qerrors) {
            qerrors(
              error instanceof Error ? error : new Error(String(error)), 
              'cleanDist', 
              `Test file removal failed for: ${full}`
            );
          }
        }
      }
    }
  }
}

// ============================================================================
// SCRIPT EXECUTION
// ============================================================================

/**
 * Execute Distribution Cleanup
 * 
 * Initiates cleanup process for current working directory's
 * dist/ folder. This is main entry point for cleanup script
 * and is typically called from build scripts or CI/CD pipelines.
 * 
 * Execution Context:
 * - Current Directory: Uses process.cwd() as root for cleanup
 * - Build Integration: Designed for integration with build tools
 * - CI/CD Compatibility: Works in automated build environments
 * - Development Usage: Manual cleanup during development
 * 
 * Expected Outcomes:
 * - Clean dist/ folder with only production artifacts
 * - Removed test files and mock directories
 * - Consistent build output across environments
 * - Prevention of duplicate mock warnings
 */
// Fix: Initialize qerrors and then execute cleanup
await initializeQerrors();
cleanDist(process.cwd());
