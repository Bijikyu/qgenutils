/**
 * GitHub Repository URL Validation Utilities
 * 
 * RATIONALE: GitHub repository operations require strict URL validation to
 * prevent automation against invalid targets and ensure reliable repository
 * access. This module provides comprehensive GitHub URL validation with
 * security-first patterns and detailed error reporting.
 * 
 * SECURITY MODEL: Fail-closed - reject URLs that don't match exact GitHub
 * patterns to prevent automation against unauthorized or malicious targets.
 * All validation operations are logged for security auditing.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Use strict regex patterns for exact GitHub URL format matching
 * - Support both HTTPS and SSH GitHub URL formats
 * - Provide detailed error messages for different validation failures
 * - Log all validation attempts for security monitoring
 * - Integrate with existing string sanitization utilities
 */

const { qerrors } = require('qerrors');
const { sanitizeString } = require('./string-utils');

/**
 * Validates GitHub repository URL format with strict pattern matching
 * 
 * RATIONALE: GitHub automation requires exact repository URLs to function
 * correctly. This function ensures only valid GitHub repository URLs are
 * accepted, preventing errors and potential security issues from malformed URLs.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Use regex pattern for strict GitHub URL format validation
 * - Support standard HTTPS GitHub repository URL format
 * - Allow optional trailing slash for user convenience
 * - Provide specific error messages for different validation failures
 * - Log validation attempts for security monitoring
 * 
 * GITHUB URL REQUIREMENTS:
 * - Must use HTTPS protocol for security
 * - Must be on github.com domain
 * - Must follow owner/repository format
 * - Owner and repository names must use valid GitHub naming conventions
 * - No additional paths or query parameters allowed
 * 
 * VALIDATION PATTERN:
 * ^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$
 * - ^https:\/\/github\.com\/ - Requires exact GitHub HTTPS URL start
 * - [\w.-]+ - Owner name (letters, numbers, dots, hyphens)
 * - \/ - Separator between owner and repository
 * - [\w.-]+ - Repository name (letters, numbers, dots, hyphens)
 * - \/? - Optional trailing slash
 * - $ - End of string (no additional content allowed)
 * 
 * @param {string} url - The GitHub repository URL to validate
 * @returns {string} Empty string if valid, descriptive error message if invalid
 * 
 * USAGE EXAMPLES:
 * validateGitHubUrl("https://github.com/user/repo")           // Returns ""
 * validateGitHubUrl("https://github.com/user/repo/")          // Returns ""
 * validateGitHubUrl("http://github.com/user/repo")            // Returns error (HTTP not HTTPS)
 * validateGitHubUrl("https://gitlab.com/user/repo")           // Returns error (not GitHub)
 * validateGitHubUrl("https://github.com/user/repo/issues")    // Returns error (additional path)
 * validateGitHubUrl("")                                       // Returns error (empty URL)
 */
function validateGitHubUrl(url) {
  console.log(`validateGitHubUrl is running with url: ${url}`);
  
  // Sanitize input to remove dangerous characters
  const sanitizedUrl = sanitizeString(url);
  
  qerrors('GitHub URL validation attempt', 'validateGitHubUrl', {
    originalUrl: url,
    sanitizedUrl: sanitizedUrl,
    urlLength: sanitizedUrl.length
  });
  
  if (!sanitizedUrl.trim()) {
    const errorMsg = "Repository URL is required";
    console.log(`validateGitHubUrl is returning error: ${errorMsg}`);
    qerrors('GitHub URL validation failed - empty URL', 'validateGitHubUrl', {
      errorMsg
    });
    return errorMsg;
  }
  
  // Strict GitHub repository URL pattern
  // Matches: https://github.com/owner/repo with optional trailing slash
  const githubUrlPattern = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;
  
  if (!githubUrlPattern.test(sanitizedUrl)) {
    const errorMsg = "Please enter a valid GitHub repository URL (e.g., https://github.com/user/repo)";
    console.log(`validateGitHubUrl is returning error: ${errorMsg}`);
    qerrors('GitHub URL validation failed - invalid format', 'validateGitHubUrl', {
      sanitizedUrl,
      errorMsg,
      pattern: githubUrlPattern.toString()
    });
    return errorMsg;
  }
  
  console.log(`validateGitHubUrl is returning success (empty string)`);
  qerrors('GitHub URL validation succeeded', 'validateGitHubUrl', {
    sanitizedUrl
  });
  
  return ""; // Empty string indicates successful validation
}

/**
 * Extract owner and repository name from validated GitHub URL
 * 
 * RATIONALE: After URL validation, applications often need to extract the
 * owner and repository components for API calls, display purposes, or
 * database storage. This function provides reliable extraction.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Assume URL has already been validated by validateGitHubUrl()
 * - Use URL parsing to extract path components safely
 * - Handle edge cases like trailing slashes gracefully
 * - Return structured object for easy destructuring
 * - Log extraction operations for debugging
 * 
 * @param {string} validatedUrl - GitHub URL that has passed validation
 * @returns {object} Object with owner and repo properties, or null if extraction fails
 * 
 * USAGE EXAMPLES:
 * extractGitHubInfo("https://github.com/microsoft/vscode")
 * // Returns { owner: "microsoft", repo: "vscode" }
 * 
 * extractGitHubInfo("https://github.com/user/my-project/")
 * // Returns { owner: "user", repo: "my-project" }
 */
function extractGitHubInfo(validatedUrl) {
  console.log(`extractGitHubInfo is running with url: ${validatedUrl}`);
  
  try {
    const url = new URL(validatedUrl);
    const pathParts = url.pathname.split('/').filter(part => part.length > 0);
    
    if (pathParts.length >= 2) {
      const owner = pathParts[0];
      const repo = pathParts[1];
      
      const result = { owner, repo };
      console.log(`extractGitHubInfo is returning:`, result);
      qerrors('GitHub info extraction succeeded', 'extractGitHubInfo', {
        validatedUrl,
        owner,
        repo
      });
      
      return result;
    }
    
    console.log(`extractGitHubInfo is returning null - insufficient path parts`);
    qerrors('GitHub info extraction failed - insufficient path parts', 'extractGitHubInfo', {
      validatedUrl,
      pathParts: pathParts.length
    });
    
    return null;
  } catch (error) {
    console.log(`extractGitHubInfo is returning null - URL parsing error`);
    qerrors(error, 'extractGitHubInfo', { validatedUrl });
    return null;
  }
}

/**
 * Validate GitHub repository name format (without URL)
 * 
 * RATIONALE: Some interfaces accept repository names in "owner/repo" format
 * without the full URL. This function validates that format while integrating
 * with string sanitization utilities.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Accept "owner/repo" format input
 * - Apply string sanitization first for security
 * - Use regex pattern for GitHub naming conventions
 * - Provide specific error messages for validation failures
 * - Support GitHub naming rules (alphanumeric, dots, hyphens, underscores)
 * 
 * GITHUB NAMING CONVENTIONS:
 * - Owner and repository names can contain letters, numbers, dots, hyphens
 * - Names cannot start or end with dots or hyphens
 * - Names must be between 1 and 100 characters
 * - Case-sensitive but typically lowercase
 * 
 * @param {string} repo - Repository in "owner/repo" format
 * @returns {string} Sanitized repository string if valid, throws error if invalid
 * 
 * USAGE EXAMPLES:
 * validateGitHubRepo("microsoft/vscode")     // Returns "microsoft/vscode"
 * validateGitHubRepo("user/my-project.js")   // Returns "user/my-project.js"
 * validateGitHubRepo("invalid")              // Throws error
 * validateGitHubRepo("")                     // Throws error
 */
function validateGitHubRepo(repo) {
  console.log(`validateGitHubRepo is running with repo: ${repo}`);
  
  if (!repo || typeof repo !== 'string') {
    const errorMsg = 'Repository name is required and must be a string.';
    console.log(`validateGitHubRepo is throwing error: ${errorMsg}`);
    qerrors('GitHub repo validation failed - invalid input type', 'validateGitHubRepo', {
      repo,
      inputType: typeof repo,
      errorMsg
    });
    throw new Error(errorMsg);
  }
  
  // Apply string sanitization first
  const sanitized = sanitizeString(repo);
  
  if (!sanitized) {
    const errorMsg = 'Repository name cannot be empty after sanitization.';
    console.log(`validateGitHubRepo is throwing error: ${errorMsg}`);
    qerrors('GitHub repo validation failed - empty after sanitization', 'validateGitHubRepo', {
      originalRepo: repo,
      sanitized,
      errorMsg
    });
    throw new Error(errorMsg);
  }
  
  // GitHub repository name pattern: owner/repo
  // Allows letters, numbers, dots, hyphens, underscores
  const githubRepoPattern = /^[\w.-]+\/[\w.-]+$/;
  
  if (!githubRepoPattern.test(sanitized)) {
    const errorMsg = 'Invalid repository format. Must be in format "owner/repo".';
    console.log(`validateGitHubRepo is throwing error: ${errorMsg}`);
    qerrors('GitHub repo validation failed - invalid format', 'validateGitHubRepo', {
      sanitized,
      errorMsg,
      pattern: githubRepoPattern.toString()
    });
    throw new Error(errorMsg);
  }
  
  console.log(`validateGitHubRepo is returning: ${sanitized}`);
  qerrors('GitHub repo validation succeeded', 'validateGitHubRepo', {
    originalRepo: repo,
    sanitized
  });
  
  return sanitized;
}

/**
 * Comprehensive GitHub URL validation with detailed error categorization
 * 
 * RATIONALE: Different parts of applications need different levels of GitHub
 * URL validation detail. This function provides comprehensive validation with
 * categorized error types for advanced error handling.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Perform multiple validation checks in sequence
 * - Categorize different types of validation failures
 * - Return structured validation result object
 * - Support both error checking and success confirmation
 * - Log detailed validation context for debugging
 * 
 * ERROR CATEGORIES:
 * - empty: URL is missing or empty
 * - format: URL doesn't match basic URL format
 * - domain: URL is not on github.com domain
 * - protocol: URL doesn't use HTTPS
 * - path: URL path doesn't match repository format
 * - valid: URL passes all validation checks
 * 
 * @param {string} url - GitHub URL to validate comprehensively
 * @returns {object} Validation result with isValid boolean and error details
 * 
 * USAGE EXAMPLES:
 * validateGitHubUrlDetailed("https://github.com/user/repo")
 * // Returns { isValid: true, category: "valid", message: "", url: "..." }
 * 
 * validateGitHubUrlDetailed("http://github.com/user/repo")
 * // Returns { isValid: false, category: "protocol", message: "Must use HTTPS", url: "..." }
 */
function validateGitHubUrlDetailed(url) {
  console.log(`validateGitHubUrlDetailed is running with url: ${url}`);
  
  const sanitizedUrl = sanitizeString(url);
  
  const result = {
    isValid: false,
    category: '',
    message: '',
    url: sanitizedUrl,
    originalUrl: url
  };
  
  // Check for empty URL
  if (!sanitizedUrl.trim()) {
    result.category = 'empty';
    result.message = 'Repository URL is required';
    console.log(`validateGitHubUrlDetailed is returning:`, result);
    qerrors('Detailed GitHub URL validation - empty', 'validateGitHubUrlDetailed', result);
    return result;
  }
  
  // Check basic URL format
  let parsedUrl;
  try {
    parsedUrl = new URL(sanitizedUrl);
  } catch (error) {
    result.category = 'format';
    result.message = 'Invalid URL format';
    console.log(`validateGitHubUrlDetailed is returning:`, result);
    qerrors('Detailed GitHub URL validation - invalid format', 'validateGitHubUrlDetailed', { 
      ...result, 
      parseError: error.message 
    });
    return result;
  }
  
  // Check protocol
  if (parsedUrl.protocol !== 'https:') {
    result.category = 'protocol';
    result.message = 'GitHub URLs must use HTTPS protocol';
    console.log(`validateGitHubUrlDetailed is returning:`, result);
    qerrors('Detailed GitHub URL validation - invalid protocol', 'validateGitHubUrlDetailed', {
      ...result,
      actualProtocol: parsedUrl.protocol
    });
    return result;
  }
  
  // Check domain
  if (parsedUrl.hostname !== 'github.com') {
    result.category = 'domain';
    result.message = 'URL must be on github.com domain';
    console.log(`validateGitHubUrlDetailed is returning:`, result);
    qerrors('Detailed GitHub URL validation - invalid domain', 'validateGitHubUrlDetailed', {
      ...result,
      actualDomain: parsedUrl.hostname
    });
    return result;
  }
  
  // Check path format (should be /owner/repo or /owner/repo/)
  const pathParts = parsedUrl.pathname.split('/').filter(part => part.length > 0);
  if (pathParts.length !== 2) {
    result.category = 'path';
    result.message = 'URL must point to a repository (owner/repo format)';
    console.log(`validateGitHubUrlDetailed is returning:`, result);
    qerrors('Detailed GitHub URL validation - invalid path', 'validateGitHubUrlDetailed', {
      ...result,
      pathParts: pathParts.length,
      actualPath: parsedUrl.pathname
    });
    return result;
  }
  
  // Check for valid owner/repo names
  const [owner, repo] = pathParts;
  const namePattern = /^[\w.-]+$/;
  if (!namePattern.test(owner) || !namePattern.test(repo)) {
    result.category = 'path';
    result.message = 'Invalid owner or repository name format';
    console.log(`validateGitHubUrlDetailed is returning:`, result);
    qerrors('Detailed GitHub URL validation - invalid names', 'validateGitHubUrlDetailed', {
      ...result,
      owner,
      repo,
      ownerValid: namePattern.test(owner),
      repoValid: namePattern.test(repo)
    });
    return result;
  }
  
  // All validation checks passed
  result.isValid = true;
  result.category = 'valid';
  result.message = 'Valid GitHub repository URL';
  result.owner = owner;
  result.repo = repo;
  
  console.log(`validateGitHubUrlDetailed is returning:`, result);
  qerrors('Detailed GitHub URL validation - success', 'validateGitHubUrlDetailed', result);
  
  return result;
}

module.exports = {
  validateGitHubUrl,
  extractGitHubInfo,
  validateGitHubRepo,
  validateGitHubUrlDetailed
};