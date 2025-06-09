
const { checkPassportAuth, hasGithubStrategy } = require('../../lib/auth');

describe('Authentication Utilities', () => {
  describe('checkPassportAuth', () => {
    // verifies should return true for authenticated user
    test('should return true for authenticated user', () => {
      const mockReq = {
        user: { username: 'john_doe' }, // simulate logged in user
        isAuthenticated: jest.fn().mockReturnValue(true) // passport returns true
      };

      expect(checkPassportAuth(mockReq)).toBe(true); // should detect authenticated
      expect(mockReq.isAuthenticated).toHaveBeenCalled(); // ensure passport call executed
    });

    // verifies should return false for unauthenticated user
    test('should return false for unauthenticated user', () => {
      const mockReq = {
        isAuthenticated: jest.fn().mockReturnValue(false) // fake unauthenticated
      };

      expect(checkPassportAuth(mockReq)).toBe(false); // should fail auth check
      expect(mockReq.isAuthenticated).toHaveBeenCalled(); // verify call
    });

    // verifies should return false when isAuthenticated method is missing
    test('should return false when isAuthenticated method is missing', () => {
      const mockReq = {
        user: { username: 'john_doe' } // missing isAuthenticated method
      };

      expect(checkPassportAuth(mockReq)).toBe(false); // should default to false
    });

    // verifies should return false for empty request object
    test('should return false for empty request object', () => {
      expect(checkPassportAuth({})).toBe(false); // empty object fails authentication
    });

    // verifies should return false when isAuthenticated throws error
    test('should return false when isAuthenticated throws error', () => {
      const mockReq = {
        isAuthenticated: jest.fn().mockImplementation(() => {
          throw new Error('Authentication error'); // simulate passport throwing
        })
      };

      expect(checkPassportAuth(mockReq)).toBe(false); // function should catch and return false
    });

    // verifies should handle malformed request object
    test('should handle malformed request object', () => {
      expect(checkPassportAuth(null)).toBe(false); // handle null request
      expect(checkPassportAuth(undefined)).toBe(false); // handle undefined request
    });

    // verifies should handle truthy but non-boolean return from isAuthenticated
    test('should handle truthy but non-boolean return from isAuthenticated', () => {
      const mockReq = {
        isAuthenticated: jest.fn().mockReturnValue('truthy-string') // returns truthy non-boolean
      };

      expect(checkPassportAuth(mockReq)).toBe(true); // double negation casts to true
    });

    // verifies should handle falsy but non-boolean return from isAuthenticated
    test('should handle falsy but non-boolean return from isAuthenticated', () => {
      const mockReq = {
        isAuthenticated: jest.fn().mockReturnValue(0) // falsy non-boolean
      };

      expect(checkPassportAuth(mockReq)).toBe(false); // casts to false
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
      global.passport = {}; // no strategies defined
      expect(hasGithubStrategy()).toBe(false); // should detect absence
    });

    // verifies should return false when _strategies is null
    test('should return false when _strategies is null', () => {
      global.passport = {
        _strategies: null // explicit null to simulate config issue
      };

      expect(hasGithubStrategy()).toBe(false); // should fail safely
    });

    // verifies should handle errors in strategy detection
    test('should handle errors in strategy detection', () => {
      global.passport = {
        get _strategies() {
          throw new Error('Access error'); // accessor throws to mimic failure
        }
      };

      expect(hasGithubStrategy()).toBe(false); // error handled internally
    });
  });
});
