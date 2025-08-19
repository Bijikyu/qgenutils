/**
 * Unit tests for GitHub repository validation utilities
 * 
 * These tests ensure GitHub validation functions maintain security-first patterns
 * while providing reliable URL and repository format validation. All functions
 * are tested for both valid GitHub URLs/repos and malicious/malformed inputs.
 */

const validateGitHubUrl = require('./validateGitHubUrl');

describe('GitHub Validation Utilities', () => {
  describe('validateGitHubUrl', () => {
    test('should validate correct GitHub repository URLs', () => {
      expect(validateGitHubUrl('https://github.com/microsoft/vscode')).toBe('');
      expect(validateGitHubUrl('https://github.com/user/repo')).toBe('');
      expect(validateGitHubUrl('https://github.com/my-org/my-project')).toBe('');
      expect(validateGitHubUrl('https://github.com/user/repo/')).toBe('');
    });

    test('should reject empty or invalid URLs', () => {
      expect(validateGitHubUrl('')).toBe('Repository URL is required');
      expect(validateGitHubUrl('   ')).toBe('Repository URL is required');
      expect(validateGitHubUrl('not-a-url')).toContain('Please enter a valid GitHub repository URL');
    });

    test('should reject non-GitHub URLs', () => {
      const errorMsg = 'Please enter a valid GitHub repository URL (e.g., https://github.com/user/repo)';
      expect(validateGitHubUrl('https://gitlab.com/user/repo')).toBe(errorMsg);
      expect(validateGitHubUrl('https://bitbucket.org/user/repo')).toBe(errorMsg);
      expect(validateGitHubUrl('https://example.com/user/repo')).toBe(errorMsg);
    });

    test('should reject HTTP URLs (require HTTPS)', () => {
      const errorMsg = 'Please enter a valid GitHub repository URL (e.g., https://github.com/user/repo)';
      expect(validateGitHubUrl('http://github.com/user/repo')).toBe(errorMsg);
    });

    test('should reject URLs with additional paths', () => {
      const errorMsg = 'Please enter a valid GitHub repository URL (e.g., https://github.com/user/repo)';
      expect(validateGitHubUrl('https://github.com/user/repo/issues')).toBe(errorMsg);
      expect(validateGitHubUrl('https://github.com/user/repo/tree/main')).toBe(errorMsg);
      expect(validateGitHubUrl('https://github.com/user/repo/pulls')).toBe(errorMsg);
    });

    test('should handle malicious input safely', () => {
      const errorMsg = 'Please enter a valid GitHub repository URL (e.g., https://github.com/user/repo)';
      expect(validateGitHubUrl('<script>alert("xss")</script>')).toBe('Repository URL is required');
      expect(validateGitHubUrl('javascript:alert("test")')).toBe(errorMsg);
      expect(validateGitHubUrl('https://github.com/../user/repo')).toBe(errorMsg);
    });
  });
});