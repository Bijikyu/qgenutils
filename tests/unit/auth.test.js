
// Unit tests for authentication helpers. Each test ensures the auth utilities
// behave predictably with varied request objects and Passport.js configurations.
const { checkPassportAuth, hasGithubStrategy } = require('../../lib/auth');

describe('Authentication Utilities', () => {
  describe('checkPassportAuth', () => {
    // verifies should return true for authenticated user
    test('should return true for authenticated user', () => {
      const mockReq = {
        user: { username: 'john_doe' },
        isAuthenticated: jest.fn().mockReturnValue(true)
      };
      
      expect(checkPassportAuth(mockReq)).toBe(true);
      expect(mockReq.isAuthenticated).toHaveBeenCalled();
    });

    // verifies should return false for unauthenticated user
    test('should return false for unauthenticated user', () => {
      const mockReq = {
        isAuthenticated: jest.fn().mockReturnValue(false)
      };
      
      expect(checkPassportAuth(mockReq)).toBe(false);
      expect(mockReq.isAuthenticated).toHaveBeenCalled();
    });

    // verifies should return false when isAuthenticated method is missing
    test('should return false when isAuthenticated method is missing', () => {
      const mockReq = {
        user: { username: 'john_doe' }
      };
      
      expect(checkPassportAuth(mockReq)).toBe(false);
    });

    // verifies should return false for empty request object
    test('should return false for empty request object', () => {
      expect(checkPassportAuth({})).toBe(false);
    });

    // verifies should return false when isAuthenticated throws error
    test('should return false when isAuthenticated throws error', () => {
      const mockReq = {
        isAuthenticated: jest.fn().mockImplementation(() => {
          throw new Error('Authentication error');
        })
      };
      
      expect(checkPassportAuth(mockReq)).toBe(false);
    });

    // verifies should handle malformed request object
    test('should handle malformed request object', () => {
      expect(checkPassportAuth(null)).toBe(false);
      expect(checkPassportAuth(undefined)).toBe(false);
    });

    // verifies should handle truthy but non-boolean return from isAuthenticated
    test('should handle truthy but non-boolean return from isAuthenticated', () => {
      const mockReq = {
        isAuthenticated: jest.fn().mockReturnValue('truthy-string')
      };
      
      expect(checkPassportAuth(mockReq)).toBe(true);
    });

    // verifies should handle falsy but non-boolean return from isAuthenticated
    test('should handle falsy but non-boolean return from isAuthenticated', () => {
      const mockReq = {
        isAuthenticated: jest.fn().mockReturnValue(0)
      };
      
      expect(checkPassportAuth(mockReq)).toBe(false);
    });
  });

  describe('hasGithubStrategy', () => {
    let originalPassport;

    beforeEach(() => {
      originalPassport = global.passport;
    });

    afterEach(() => {
      global.passport = originalPassport;
    });

    // verifies should return true when GitHub strategy is configured
    test('should return true when GitHub strategy is configured', () => {
      global.passport = {
        _strategies: {
          github: { name: 'github' }
        }
      };
      
      expect(hasGithubStrategy()).toBe(true);
    });

    // verifies should return false when GitHub strategy is not configured
    test('should return false when GitHub strategy is not configured', () => {
      global.passport = {
        _strategies: {
          local: { name: 'local' }
        }
      };
      
      expect(hasGithubStrategy()).toBe(false);
    });

    // verifies should return false when no strategies are configured
    test('should return false when no strategies are configured', () => {
      global.passport = {
        _strategies: {}
      };
      
      expect(hasGithubStrategy()).toBe(false);
    });

    // verifies should return false when passport is undefined
    test('should return false when passport is undefined', () => {
      global.passport = undefined;
      expect(hasGithubStrategy()).toBe(false);
    });

    // verifies should return false when passport is null
    test('should return false when passport is null', () => {
      global.passport = null;
      expect(hasGithubStrategy()).toBe(false);
    });

    // verifies should return false when _strategies is missing
    test('should return false when _strategies is missing', () => {
      global.passport = {};
      expect(hasGithubStrategy()).toBe(false);
    });

    // verifies should return false when _strategies is null
    test('should return false when _strategies is null', () => {
      global.passport = {
        _strategies: null
      };
      
      expect(hasGithubStrategy()).toBe(false);
    });

    // verifies should handle errors in strategy detection
    test('should handle errors in strategy detection', () => {
      global.passport = {
        get _strategies() {
          throw new Error('Access error');
        }
      };

      expect(hasGithubStrategy()).toBe(false);
    });

    // verifies should ignore local passport variable when global.passport is undefined
    test('should ignore local passport variable when global.passport is undefined', () => {
      const passport = { _strategies: { github: {} } }; // local variable with strategy
      global.passport = undefined; // global remains undefined

      expect(hasGithubStrategy()).toBe(false);
    });

    // verifies should return false when _strategies is not an object
    test('should return false when _strategies is not an object', () => {
      global.passport = { _strategies: 'invalid' };

      expect(hasGithubStrategy()).toBe(false);
    });
  });
});
