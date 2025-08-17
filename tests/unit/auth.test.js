
// Unit tests for authentication helpers. Each test ensures the auth utilities
// behave predictably with varied request objects and Passport.js configurations.
const checkPassportAuth = require('../../lib/auth/checkPassportAuth');
const hasGithubStrategy = require('../../lib/auth/hasGithubStrategy');

describe('Authentication Utilities', () => { // ensures login helpers behave consistently
  describe('checkPassportAuth', () => { // validates session checks across requests
    // verifies should return true for authenticated user
    test('should return true for authenticated user', () => {
      const mockReq = {
        user: { username: 'john_doe' },
        isAuthenticated: jest.fn().mockReturnValue(true)
      };
      
      expect(checkPassportAuth(mockReq)).toBe(true); // should succeed for logged-in user
      expect(mockReq.isAuthenticated).toHaveBeenCalled(); // verify auth check invoked
    });

    // verifies should return false for unauthenticated user
    test('should return false for unauthenticated user', () => {
      const mockReq = {
        isAuthenticated: jest.fn().mockReturnValue(false)
      };
      
      expect(checkPassportAuth(mockReq)).toBe(false); // expected failure for guest
      expect(mockReq.isAuthenticated).toHaveBeenCalled(); // ensure method called
    });

    // verifies should return false when isAuthenticated method is missing
    test('should return false when isAuthenticated method is missing', () => {
      const mockReq = {
        user: { username: 'john_doe' }
      };
      
      expect(checkPassportAuth(mockReq)).toBe(false); // missing method means unauthenticated
    });

    // verifies should return false for empty request object
    test('should return false for empty request object', () => {
      expect(checkPassportAuth({})).toBe(false); // empty object should fail auth
    });

    // verifies should return false when isAuthenticated throws error
    test('should return false when isAuthenticated throws error', () => {
      const mockReq = {
        isAuthenticated: jest.fn().mockImplementation(() => {
          throw new Error('Authentication error');
        })
      };
      
      expect(checkPassportAuth(mockReq)).toBe(false); // error thrown should result in false
    });

    // verifies should handle malformed request object
    test('should handle malformed request object', () => {
      expect(checkPassportAuth(null)).toBe(false); // null request fails auth
      expect(checkPassportAuth(undefined)).toBe(false); // undefined request fails auth
    });

    // verifies should handle truthy but non-boolean return from isAuthenticated
    test('should handle truthy but non-boolean return from isAuthenticated', () => {
      const mockReq = {
        isAuthenticated: jest.fn().mockReturnValue('truthy-string')
      };
      
      expect(checkPassportAuth(mockReq)).toBe(true); // non-boolean truthy counts as authenticated
    });

    // verifies should handle falsy but non-boolean return from isAuthenticated
    test('should handle falsy but non-boolean return from isAuthenticated', () => {
      const mockReq = {
        isAuthenticated: jest.fn().mockReturnValue(0)
      };
      
      expect(checkPassportAuth(mockReq)).toBe(false); // non-boolean falsy treated as unauthenticated
    });
  });

  describe('hasGithubStrategy', () => { // confirms passport strategy detection
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
      
      expect(hasGithubStrategy()).toBe(true); // function should detect github strategy
    });

    // verifies should return false when GitHub strategy is not configured
    test('should return false when GitHub strategy is not configured', () => {
      global.passport = {
        _strategies: {
          local: { name: 'local' }
        }
      };
      
      expect(hasGithubStrategy()).toBe(false); // should fail when only local strategy exists
    });

    // verifies should return false when no strategies are configured
    test('should return false when no strategies are configured', () => {
      global.passport = {
        _strategies: {}
      };
      
      expect(hasGithubStrategy()).toBe(false); // no strategies returns false
    });

    // verifies should return false when passport is undefined
    test('should return false when passport is undefined', () => {
      global.passport = undefined;
      expect(hasGithubStrategy()).toBe(false); // undefined passport should be handled
    });

    // verifies should return false when passport is null
    test('should return false when passport is null', () => {
      global.passport = null;
      expect(hasGithubStrategy()).toBe(false); // null passport should be handled
    });

    // verifies should return false when _strategies is missing
    test('should return false when _strategies is missing', () => {
      global.passport = {};
      expect(hasGithubStrategy()).toBe(false); // missing strategies property returns false
    });

    // verifies should return false when _strategies is null
    test('should return false when _strategies is null', () => {
      global.passport = {
        _strategies: null
      };
      
      expect(hasGithubStrategy()).toBe(false); // null strategies property handled
    });

    // verifies should handle errors in strategy detection
    test('should handle errors in strategy detection', () => {
      global.passport = {
        get _strategies() {
          throw new Error('Access error');
        }
      };

      expect(hasGithubStrategy()).toBe(false); // catching error should result in false
    });

    // verifies should ignore local passport variable when global.passport is undefined
    test('should ignore local passport variable when global.passport is undefined', () => {
      const passport = { _strategies: { github: {} } }; // local variable with strategy
      global.passport = undefined; // global remains undefined

      expect(hasGithubStrategy()).toBe(false); // global undefined should override local variable
    });

    // verifies should return false when _strategies is not an object
    test('should return false when _strategies is not an object', () => {
      global.passport = { _strategies: 'invalid' };

      expect(hasGithubStrategy()).toBe(false); // non-object strategies results in false
    });
  });
});
