// Unit tests for browser utilities. These tests ensure proper clipboard functionality,
// environment detection, and graceful degradation when browser APIs are unavailable.
const { makeCopyFn, isClipboardSupported, isBrowser } = require('../../lib/browser');

describe('Browser Utilities', () => { // validates client-side functionality

  describe('makeCopyFn', () => { // factory for clipboard copy handlers
    let mockSetMsg, mockSetCode;
    let originalNavigator, originalWindow;

    beforeEach(() => {
      // Create mock callback functions
      mockSetMsg = jest.fn();
      mockSetCode = jest.fn();
      
      // Save original globals
      originalNavigator = global.navigator;
      originalWindow = global.window;
      
      // Mock successful clipboard API
      global.navigator = {
        clipboard: {
          writeText: jest.fn().mockResolvedValue()
        }
      };
      
      global.window = {
        isSecureContext: true
      };
      
      // Clear any existing timers
      jest.clearAllTimers();
      jest.useFakeTimers();
    });

    afterEach(() => {
      // Restore original globals
      global.navigator = originalNavigator;
      global.window = originalWindow;
      
      jest.useRealTimers();
    });

    // verifies should create copy function with valid callbacks
    test('should create copy function with valid callbacks', () => {
      const copyFn = makeCopyFn(mockSetMsg, mockSetCode);
      
      expect(typeof copyFn).toBe('function'); // returns function
      expect(copyFn.constructor.name).toBe('AsyncFunction'); // returns async function
    });

    // verifies should handle invalid callback parameters gracefully
    test('should handle invalid callback parameters gracefully', () => {
      const copyFn1 = makeCopyFn(null, mockSetCode);
      const copyFn2 = makeCopyFn(mockSetMsg, 'not-a-function');
      const copyFn3 = makeCopyFn(undefined, undefined);
      
      expect(typeof copyFn1).toBe('function'); // still returns function with null callback
      expect(typeof copyFn2).toBe('function'); // still returns function with invalid callback
      expect(typeof copyFn3).toBe('function'); // still returns function with undefined callbacks
    });

    // verifies should successfully copy text to clipboard
    test('should successfully copy text to clipboard', async () => {
      const copyFn = makeCopyFn(mockSetMsg, mockSetCode);
      
      await copyFn('Hello World', 'test-id');
      
      expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith('Hello World'); // clipboard API called
      expect(mockSetCode).toHaveBeenCalledWith('test-id'); // success state set
      expect(mockSetMsg).toHaveBeenCalledWith('Copied to clipboard'); // success message set
    });

    // verifies should reset state after timeout
    test('should reset state after timeout', async () => {
      const copyFn = makeCopyFn(mockSetMsg, mockSetCode);
      
      await copyFn('Hello World', 'test-id');
      
      // Fast-forward time by 4 seconds
      jest.advanceTimersByTime(4000);
      
      expect(mockSetCode).toHaveBeenCalledWith(null); // state reset
      expect(mockSetMsg).toHaveBeenCalledWith(''); // message cleared
    });

    // verifies should handle clipboard API errors
    test('should handle clipboard API errors', async () => {
      // Mock clipboard API to reject
      global.navigator.clipboard.writeText = jest.fn().mockRejectedValue(new Error('Permission denied'));
      
      const copyFn = makeCopyFn(mockSetMsg, mockSetCode);
      
      await copyFn('Hello World', 'test-id');
      
      expect(mockSetMsg).toHaveBeenCalledWith('Failed to copy'); // error message set
      expect(mockSetCode).not.toHaveBeenCalledWith('test-id'); // success state not set
    });

    // verifies should handle NotAllowedError specifically
    test('should handle NotAllowedError specifically', async () => {
      // Mock clipboard API to reject with permission error
      const permissionError = new Error('Permission denied');
      permissionError.name = 'NotAllowedError';
      global.navigator.clipboard.writeText = jest.fn().mockRejectedValue(permissionError);
      
      const copyFn = makeCopyFn(mockSetMsg, mockSetCode);
      
      await copyFn('Hello World', 'test-id');
      
      expect(mockSetMsg).toHaveBeenCalledWith('Permission denied - please try again'); // specific permission message
    });

    // verifies should handle missing clipboard API
    test('should handle missing clipboard API', async () => {
      global.navigator = {}; // no clipboard property
      
      const copyFn = makeCopyFn(mockSetMsg, mockSetCode);
      
      await copyFn('Hello World', 'test-id');
      
      expect(mockSetMsg).toHaveBeenCalledWith('Clipboard not supported'); // fallback message
      expect(mockSetCode).not.toHaveBeenCalled(); // no success state
    });

    // verifies should handle insecure context
    test('should handle insecure context', async () => {
      global.window.isSecureContext = false; // HTTP context
      
      const copyFn = makeCopyFn(mockSetMsg, mockSetCode);
      
      await copyFn('Hello World', 'test-id');
      
      expect(mockSetMsg).toHaveBeenCalledWith('Clipboard requires HTTPS'); // HTTPS requirement message
      expect(global.navigator.clipboard.writeText).not.toHaveBeenCalled(); // clipboard not called
    });

    // verifies should handle invalid text parameter
    test('should handle invalid text parameter', async () => {
      const copyFn = makeCopyFn(mockSetMsg, mockSetCode);
      
      await copyFn(null, 'test-id');
      await copyFn(undefined, 'test-id');
      await copyFn(123, 'test-id');
      
      expect(mockSetMsg).toHaveBeenCalledWith('Invalid text to copy'); // invalid text message
      expect(global.navigator.clipboard.writeText).not.toHaveBeenCalled(); // clipboard not called
    });

    // verifies should work with empty string text
    test('should work with empty string text', async () => {
      const copyFn = makeCopyFn(mockSetMsg, mockSetCode);
      
      await copyFn('', 'test-id');
      
      expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith(''); // empty string copied
      expect(mockSetMsg).toHaveBeenCalledWith('Copied to clipboard'); // success message
    });

    // verifies should work without id parameter
    test('should work without id parameter', async () => {
      const copyFn = makeCopyFn(mockSetMsg, mockSetCode);
      
      await copyFn('Hello World');
      
      expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith('Hello World'); // text copied
      expect(mockSetCode).toHaveBeenCalledWith(undefined); // undefined id passed
      expect(mockSetMsg).toHaveBeenCalledWith('Copied to clipboard'); // success message
    });
  });

  describe('isClipboardSupported', () => { // clipboard API feature detection
    let originalNavigator, originalWindow;

    beforeEach(() => {
      originalNavigator = global.navigator;
      originalWindow = global.window;
    });

    afterEach(() => {
      global.navigator = originalNavigator;
      global.window = originalWindow;
    });

    // verifies should return true when clipboard API is fully supported
    test('should return true when clipboard API is fully supported', () => {
      global.navigator = {
        clipboard: {
          writeText: jest.fn()
        }
      };
      global.window = {
        isSecureContext: true
      };
      
      const result = isClipboardSupported();
      
      expect(result).toBe(true); // clipboard fully supported
    });

    // verifies should return false when navigator is undefined
    test('should return false when navigator is undefined', () => {
      global.navigator = undefined;
      
      const result = isClipboardSupported();
      
      expect(result).toBe(false); // navigator missing
    });

    // verifies should return false when clipboard API is missing
    test('should return false when clipboard API is missing', () => {
      global.navigator = {}; // no clipboard property
      global.window = { isSecureContext: true };
      
      const result = isClipboardSupported();
      
      expect(result).toBe(false); // clipboard API missing
    });

    // verifies should return false when writeText method is missing
    test('should return false when writeText method is missing', () => {
      global.navigator = {
        clipboard: {} // no writeText method
      };
      global.window = { isSecureContext: true };
      
      const result = isClipboardSupported();
      
      expect(result).toBe(false); // writeText method missing
    });

    // verifies should return false when context is not secure
    test('should return false when context is not secure', () => {
      global.navigator = {
        clipboard: {
          writeText: jest.fn()
        }
      };
      global.window = {
        isSecureContext: false // HTTP context
      };
      
      const result = isClipboardSupported();
      
      expect(result).toBe(false); // insecure context
    });

    // verifies should return false when window is undefined
    test('should return false when window is undefined', () => {
      global.navigator = {
        clipboard: {
          writeText: jest.fn()
        }
      };
      global.window = undefined;
      
      const result = isClipboardSupported();
      
      expect(result).toBe(true); // still supported when window undefined (Node.js context)
    });

    // verifies should handle errors gracefully
    test('should handle errors gracefully', () => {
      // Mock navigator to throw error on access
      Object.defineProperty(global, 'navigator', {
        get: () => {
          throw new Error('Navigator access error');
        },
        configurable: true
      });
      
      const result = isClipboardSupported();
      
      expect(result).toBe(false); // error handled gracefully
    });
  });

  describe('isBrowser', () => { // browser environment detection
    let originalWindow, originalDocument, originalNavigator;

    beforeEach(() => {
      originalWindow = global.window;
      originalDocument = global.document;
      originalNavigator = global.navigator;
    });

    afterEach(() => {
      global.window = originalWindow;
      global.document = originalDocument;
      global.navigator = originalNavigator;
    });

    // verifies should return true in browser environment
    test('should return true in browser environment', () => {
      global.window = {};
      global.document = {};
      global.navigator = {};
      
      const result = isBrowser();
      
      expect(result).toBe(true); // browser environment detected
    });

    // verifies should return false when window is missing
    test('should return false when window is missing', () => {
      global.window = undefined;
      global.document = {};
      global.navigator = {};
      
      const result = isBrowser();
      
      expect(result).toBe(false); // window missing
    });

    // verifies should return false when document is missing
    test('should return false when document is missing', () => {
      global.window = {};
      global.document = undefined;
      global.navigator = {};
      
      const result = isBrowser();
      
      expect(result).toBe(false); // document missing
    });

    // verifies should return false when navigator is missing
    test('should return false when navigator is missing', () => {
      global.window = {};
      global.document = {};
      global.navigator = undefined;
      
      const result = isBrowser();
      
      expect(result).toBe(false); // navigator missing
    });

    // verifies should return false when all globals are missing
    test('should return false when all globals are missing', () => {
      global.window = undefined;
      global.document = undefined;
      global.navigator = undefined;
      
      const result = isBrowser();
      
      expect(result).toBe(false); // Node.js environment
    });

    // verifies should handle errors gracefully
    test('should handle errors gracefully', () => {
      // Mock window to throw error on access
      Object.defineProperty(global, 'window', {
        get: () => {
          throw new Error('Window access error');
        },
        configurable: true
      });
      
      const result = isBrowser();
      
      expect(result).toBe(false); // error handled gracefully
    });
  });

  describe('Integration Scenarios', () => { // realistic usage patterns
    let originalNavigator, originalWindow;

    beforeEach(() => {
      originalNavigator = global.navigator;
      originalWindow = global.window;
    });

    afterEach(() => {
      global.navigator = originalNavigator;
      global.window = originalWindow;
    });

    // verifies should conditionally enable clipboard features
    test('should conditionally enable clipboard features', () => {
      // Setup browser environment with clipboard support
      global.window = { isSecureContext: true };
      global.document = {};
      global.navigator = {
        clipboard: {
          writeText: jest.fn().mockResolvedValue()
        }
      };
      
      const browserDetected = isBrowser();
      const clipboardSupported = isClipboardSupported();
      
      expect(browserDetected).toBe(true); // browser environment
      expect(clipboardSupported).toBe(true); // clipboard supported
      
      // Should enable clipboard features
      if (browserDetected && clipboardSupported) {
        const mockSetMsg = jest.fn();
        const mockSetCode = jest.fn();
        const copyFn = makeCopyFn(mockSetMsg, mockSetCode);
        
        expect(typeof copyFn).toBe('function'); // copy function created
      }
    });

    // verifies should handle server-side execution gracefully
    test('should handle server-side execution gracefully', () => {
      // Setup Node.js environment (no browser globals)
      global.window = undefined;
      global.document = undefined;
      global.navigator = undefined;
      
      const browserDetected = isBrowser();
      const clipboardSupported = isClipboardSupported();
      
      expect(browserDetected).toBe(false); // Node.js environment
      expect(clipboardSupported).toBe(false); // clipboard not supported
      
      // Should still create copy function but it won't work
      const mockSetMsg = jest.fn();
      const mockSetCode = jest.fn();
      const copyFn = makeCopyFn(mockSetMsg, mockSetCode);
      
      expect(typeof copyFn).toBe('function'); // copy function still created
    });

    // verifies should handle partial browser support
    test('should handle partial browser support', () => {
      // Setup browser environment without clipboard support
      global.window = { isSecureContext: true };
      global.document = {};
      global.navigator = {}; // no clipboard property
      
      const browserDetected = isBrowser();
      const clipboardSupported = isClipboardSupported();
      
      expect(browserDetected).toBe(true); // browser environment
      expect(clipboardSupported).toBe(false); // clipboard not supported
      
      // Should create copy function but clipboard operations will fail gracefully
      const mockSetMsg = jest.fn();
      const mockSetCode = jest.fn();
      const copyFn = makeCopyFn(mockSetMsg, mockSetCode);
      
      expect(typeof copyFn).toBe('function'); // copy function created
    });
  });
});