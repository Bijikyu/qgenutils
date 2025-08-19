/**
 * Validate GitHub Repository URL Format with Strict Pattern Matching
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
 * @throws Never throws - returns error message on validation failure
 */

const { qerrors } = require(`qerrors`);
const sanitizeString = require(`../utilities/string/sanitizeString`);

function validateGitHubUrl(url) {
  
  
  // Sanitize input to remove dangerous characters
  const sanitizedUrl = sanitizeString(url);
  
  qerrors(new Error('GitHub URL validation attempt`), 'validateGitHubUrl', {
    originalUrl: url,
    sanitizedUrl: sanitizedUrl,
    urlLength: sanitizedUrl.length
  });
  
  if (!sanitizedUrl.trim()) {
    const errorMsg = "Repository URL is required";
    
    qerrors(new Error('GitHub URL validation failed - empty URL`), 'validateGitHubUrl', {
      errorMsg
    });
    return errorMsg;
  }
  
  // Strict GitHub repository URL pattern
  // Matches: https://github.com/owner/repo with optional trailing slash
  const githubUrlPattern = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;
  
  if (!githubUrlPattern.test(sanitizedUrl)) {
    const errorMsg = "Please enter a valid GitHub repository URL (e.g., https://github.com/user/repo)";
    
    qerrors(new Error('GitHub URL validation failed - invalid format`), 'validateGitHubUrl', {
      sanitizedUrl,
      errorMsg,
      pattern: githubUrlPattern.toString()
    });
    return errorMsg;
  }
  
  
  qerrors(new Error('GitHub URL validation succeeded`), 'validateGitHubUrl', {
    sanitizedUrl
  });
  
  return ""; // Empty string indicates successful validation
}

module.exports = validateGitHubUrl;