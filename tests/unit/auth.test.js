
const { checkPassportAuth, hasGithubStrategy } = require('../../lib/auth');

describe('Authentication Utilities', () => {
  describe('checkPassportAuth', () => {
    test('should return true for authenticated user', () => {
      const mockReq = {
        user: { username: 'john_doe' },
        isAuthenticated: jest.fn().mockReturnValue(true)
      };
      
      expect(checkPassportAuth(mockReq)).toBe(true);
      expect(mockReq.isAuthenticated).toHaveBeenCalled();
    });

    test('should return false for unauthenticated user', () => {
      const mockReq = {
        isAuthenticated: jest.fn().mockReturnValue(false)
      };
      
      expect(checkPassportAuth(mockReq)).toBe(false);
      expect(mockReq.isAuthenticated).toHaveBeenCalled();
    });

    test('should return false when isAuthenticated method is missing', () => {
      const mockReq = {
        user: { username: 'john_doe' }
      };
      
      expect(checkPassportAuth(mockReq)).toBe(false);
    });

    test('should return false for empty request object', () => {
      expect(checkPassportAuth({})).toBe(false);
    });

    test('should return false when isAuthenticated throws error', () => {
      const mockReq = {
        isAuthenticated: jest.fn().mockImplementation(() => {
          throw new Error('Authentication error');
        })
      };
      
      expect(checkPassportAuth(mockReq)).toBe(false);
    });

    test('should handle malformed request object', () => {
      expect(checkPassportAuth(null)).toBe(false);
      expect(checkPassportAuth(undefined)).toBe(false);
    });

    test('should handle truthy but non-boolean return from isAuthenticated', () => {
      const mockReq = {
        isAuthenticated: jest.fn().mockReturnValue('truthy-string')
      };
      
      expect(checkPassportAuth(mockReq)).toBe(true);
    });

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

    test('should return true when GitHub strategy is configured', () => {
      global.passport = {
        _strategies: {
          github: { name: 'github' }
        }
      };
      
      expect(hasGithubStrategy()).toBe(true);
    });

    test('should return false when GitHub strategy is not configured', () => {
      global.passport = {
        _strategies: {
          local: { name: 'local' }
        }
      };
      
      expect(hasGithubStrategy()).toBe(false);
    });

    test('should return false when no strategies are configured', () => {
      global.passport = {
        _strategies: {}
      };
      
      expect(hasGithubStrategy()).toBe(false);
    });

    test('should return false when passport is undefined', () => {
      global.passport = undefined;
      expect(hasGithubStrategy()).toBe(false);
    });

    test('should return false when passport is null', () => {
      global.passport = null;
      expect(hasGithubStrategy()).toBe(false);
    });

    test('should return false when _strategies is missing', () => {
      global.passport = {};
      expect(hasGithubStrategy()).toBe(false);
    });

    test('should return false when _strategies is null', () => {
      global.passport = {
        _strategies: null
      };
      
      expect(hasGithubStrategy()).toBe(false);
    });

    test('should handle errors in strategy detection', () => {
      global.passport = {
        get _strategies() {
          throw new Error('Access error');
        }
      };
      
      expect(hasGithubStrategy()).toBe(false);
    });
  });
});
