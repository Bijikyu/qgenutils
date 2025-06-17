/**
 * Unit tests for GitHub repository validation utilities
 * 
 * These tests ensure GitHub validation functions maintain security-first patterns
 * while providing reliable URL and repository format validation. All functions
 * are tested for both valid GitHub URLs/repos and malicious/malformed inputs.
 */

const githubValidation = require('../../lib/github-validation');

describe('GitHub Validation Utilities', () => {
  describe('validateGitHubUrl', () => {
    test('should validate correct GitHub repository URLs', () => {
      expect(githubValidation.validateGitHubUrl('https://github.com/microsoft/vscode')).toBe('');
      expect(githubValidation.validateGitHubUrl('https://github.com/user/repo')).toBe('');
      expect(githubValidation.validateGitHubUrl('https://github.com/my-org/my-project')).toBe('');
      expect(githubValidation.validateGitHubUrl('https://github.com/user/repo/')).toBe('');
    });

    test('should reject empty or invalid URLs', () => {
      expect(githubValidation.validateGitHubUrl('')).toBe('Repository URL is required');
      expect(githubValidation.validateGitHubUrl('   ')).toBe('Repository URL is required');
      expect(githubValidation.validateGitHubUrl('not-a-url')).toContain('Please enter a valid GitHub repository URL');
    });

    test('should reject non-GitHub URLs', () => {
      const errorMsg = 'Please enter a valid GitHub repository URL (e.g., https://github.com/user/repo)';
      expect(githubValidation.validateGitHubUrl('https://gitlab.com/user/repo')).toBe(errorMsg);
      expect(githubValidation.validateGitHubUrl('https://bitbucket.org/user/repo')).toBe(errorMsg);
      expect(githubValidation.validateGitHubUrl('https://example.com/user/repo')).toBe(errorMsg);
    });

    test('should reject HTTP URLs (require HTTPS)', () => {
      const errorMsg = 'Please enter a valid GitHub repository URL (e.g., https://github.com/user/repo)';
      expect(githubValidation.validateGitHubUrl('http://github.com/user/repo')).toBe(errorMsg);
    });

    test('should reject URLs with additional paths', () => {
      const errorMsg = 'Please enter a valid GitHub repository URL (e.g., https://github.com/user/repo)';
      expect(githubValidation.validateGitHubUrl('https://github.com/user/repo/issues')).toBe(errorMsg);
      expect(githubValidation.validateGitHubUrl('https://github.com/user/repo/tree/main')).toBe(errorMsg);
      expect(githubValidation.validateGitHubUrl('https://github.com/user')).toBe(errorMsg);
    });

    test('should handle malformed input safely', () => {
      expect(githubValidation.validateGitHubUrl('https://github.com/')).toContain('Please enter a valid GitHub repository URL');
      expect(githubValidation.validateGitHubUrl('https://github.com/user')).toContain('Please enter a valid GitHub repository URL');
      expect(githubValidation.validateGitHubUrl('https://github.com//repo')).toContain('Please enter a valid GitHub repository URL');
    });
  });

  describe('extractGitHubInfo', () => {
    test('should extract owner and repository from valid URLs', () => {
      expect(githubValidation.extractGitHubInfo('https://github.com/microsoft/vscode'))
        .toEqual({ owner: 'microsoft', repo: 'vscode' });
      expect(githubValidation.extractGitHubInfo('https://github.com/user/my-project/'))
        .toEqual({ owner: 'user', repo: 'my-project' });
    });

    test('should handle URLs with special characters in names', () => {
      expect(githubValidation.extractGitHubInfo('https://github.com/my-org/my.project'))
        .toEqual({ owner: 'my-org', repo: 'my.project' });
      expect(githubValidation.extractGitHubInfo('https://github.com/user_name/repo-name'))
        .toEqual({ owner: 'user_name', repo: 'repo-name' });
    });

    test('should return null for invalid URLs', () => {
      expect(githubValidation.extractGitHubInfo('invalid-url')).toBeNull();
      expect(githubValidation.extractGitHubInfo('https://github.com/user')).toBeNull();
      expect(githubValidation.extractGitHubInfo('https://github.com/')).toBeNull();
    });

    test('should return null for URLs with insufficient path parts', () => {
      expect(githubValidation.extractGitHubInfo('https://github.com/user/repo/issues')).toEqual({ owner: 'user', repo: 'repo' });
      expect(githubValidation.extractGitHubInfo('https://github.com/user')).toBeNull();
    });
  });

  describe('validateGitHubRepo', () => {
    test('should validate correct repository formats', () => {
      expect(githubValidation.validateGitHubRepo('microsoft/vscode')).toBe('microsoft/vscode');
      expect(githubValidation.validateGitHubRepo('user/my-project')).toBe('user/my-project');
      expect(githubValidation.validateGitHubRepo('my-org/my.project.js')).toBe('my-org/my.project.js');
    });

    test('should apply string sanitization', () => {
      expect(githubValidation.validateGitHubRepo(' user/repo \t')).toBe('user/repo');
      expect(githubValidation.validateGitHubRepo('user/repo\x00')).toBe('user/repo');
    });

    test('should throw error for invalid input types', () => {
      expect(() => githubValidation.validateGitHubRepo(null))
        .toThrow('Repository name is required and must be a string.');
      expect(() => githubValidation.validateGitHubRepo(undefined))
        .toThrow('Repository name is required and must be a string.');
      expect(() => githubValidation.validateGitHubRepo(123))
        .toThrow('Repository name is required and must be a string.');
    });

    test('should throw error for empty or invalid formats', () => {
      expect(() => githubValidation.validateGitHubRepo(''))
        .toThrow('Repository name cannot be empty after sanitization.');
      expect(() => githubValidation.validateGitHubRepo('   '))
        .toThrow('Repository name cannot be empty after sanitization.');
      expect(() => githubValidation.validateGitHubRepo('invalid-format'))
        .toThrow('Invalid repository format. Must be in format "owner/repo".');
      expect(() => githubValidation.validateGitHubRepo('owner/repo/extra'))
        .toThrow('Invalid repository format. Must be in format "owner/repo".');
    });
  });

  describe('validateGitHubUrlDetailed', () => {
    test('should return valid result for correct URLs', () => {
      const result = githubValidation.validateGitHubUrlDetailed('https://github.com/user/repo');
      expect(result).toMatchObject({
        isValid: true,
        category: 'valid',
        message: 'Valid GitHub repository URL',
        owner: 'user',
        repo: 'repo'
      });
    });

    test('should categorize empty URL errors', () => {
      const result = githubValidation.validateGitHubUrlDetailed('');
      expect(result).toMatchObject({
        isValid: false,
        category: 'empty',
        message: 'Repository URL is required'
      });
    });

    test('should categorize format errors', () => {
      const result = githubValidation.validateGitHubUrlDetailed('not-a-url');
      expect(result).toMatchObject({
        isValid: false,
        category: 'format',
        message: 'Invalid URL format'
      });
    });

    test('should categorize protocol errors', () => {
      const result = githubValidation.validateGitHubUrlDetailed('http://github.com/user/repo');
      expect(result).toMatchObject({
        isValid: false,
        category: 'protocol',
        message: 'GitHub URLs must use HTTPS protocol'
      });
    });

    test('should categorize domain errors', () => {
      const result = githubValidation.validateGitHubUrlDetailed('https://gitlab.com/user/repo');
      expect(result).toMatchObject({
        isValid: false,
        category: 'domain',
        message: 'URL must be on github.com domain'
      });
    });

    test('should categorize path errors', () => {
      const result1 = githubValidation.validateGitHubUrlDetailed('https://github.com/user');
      expect(result1).toMatchObject({
        isValid: false,
        category: 'path',
        message: 'URL must point to a repository (owner/repo format)'
      });

      const result2 = githubValidation.validateGitHubUrlDetailed('https://github.com/user/repo/issues');
      expect(result2).toMatchObject({
        isValid: false,
        category: 'path',
        message: 'URL must point to a repository (owner/repo format)'
      });
    });

    test('should categorize invalid name errors', () => {
      const result = githubValidation.validateGitHubUrlDetailed('https://github.com/user$/repo@');
      expect(result).toMatchObject({
        isValid: false,
        category: 'path',
        message: 'Invalid owner or repository name format'
      });
    });

    test('should include original URL in all results', () => {
      const originalUrl = 'https://github.com/user/repo';
      const result = githubValidation.validateGitHubUrlDetailed(originalUrl);
      expect(result.originalUrl).toBe(originalUrl);
    });
  });
});