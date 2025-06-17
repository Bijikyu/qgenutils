/*
 * Browser Utilities Module
 * 
 * This module provides client-side browser utilities that complement the server-side
 * utilities in QGenUtils. These functions are designed to work in browser environments
 * where DOM APIs and Web APIs are available.
 * 
 * DESIGN PHILOSOPHY:
 * - Graceful degradation: Functions handle missing browser APIs safely
 * - Fail-safe behavior: Return meaningful fallbacks when browser features unavailable
 * - Factory patterns: Create configurable handlers for common browser operations
 * - Consistent error handling: Use structured logging and clear error messages
 * 
 * BROWSER COMPATIBILITY CONSIDERATIONS:
 * - Check for API availability before use (navigator.clipboard, etc.)
 * - Provide fallback mechanisms for older browsers
 * - Handle security restrictions (HTTPS requirements, user gesture requirements)
 * - Test across different browser environments and security contexts
 * 
 * SECURITY CONSIDERATIONS:
 * - Clipboard access requires HTTPS in most browsers
 * - Some APIs require user gesture (click, keypress) to function
 * - Handle permission denied scenarios gracefully
 * - Never expose sensitive data through browser APIs
 * 
 * COMMON USE CASES:
 * - Copy text to clipboard with user feedback
 * - Form interaction helpers
 * - DOM manipulation utilities
 * - Browser feature detection
 * - User experience enhancements
 * 
 * INTEGRATION WITH EXISTING UTILITIES:
 * While this module contains browser-specific code, it maintains consistency
 * with the existing QGenUtils patterns for error handling, logging, and
 * function design principles.
 */

const { qerrors } = require('qerrors'); // central error logging integration
const logger = require('./logger'); // structured logger

/**
 * Factory function to create clipboard copy handlers with customizable feedback
 * 
 * RATIONALE: Different UI frameworks and applications need different ways to
 * provide user feedback when clipboard operations succeed or fail. This factory
 * pattern allows the caller to provide their own feedback mechanisms while
 * handling the clipboard logic consistently.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Use factory pattern to create customizable handlers
 * - Accept callback functions for success/failure feedback
 * - Return async function that can be used as event handler
 * - Handle both success and failure scenarios with appropriate feedback
 * - Use setTimeout for automatic state reset after successful copy
 * 
 * BROWSER API REQUIREMENTS:
 * - Requires navigator.clipboard.writeText() API (modern browsers)
 * - Requires HTTPS context for security (except localhost)
 * - May require user gesture to trigger (click, keypress)
 * - Falls back gracefully when API is not available
 * 
 * FACTORY PATTERN BENEFITS:
 * - Separates clipboard logic from UI state management
 * - Allows different feedback mechanisms (React setState, Vue refs, vanilla DOM)
 * - Enables reuse across different components and frameworks
 * - Centralizes error handling and timeout logic
 * 
 * CALLBACK FUNCTION USAGE:
 * - setMsg: Function to update user-visible message (success/failure feedback)
 * - setCode: Function to update UI state (often used for visual indicators like icons)
 * 
 * AUTOMATIC STATE RESET:
 * After successful copy, the factory sets a 4-second timeout to automatically
 * reset the UI state. This provides enough time for users to see the success
 * feedback without requiring manual state management.
 * 
 * ERROR HANDLING STRATEGY:
 * - Log technical errors for debugging without exposing to users
 * - Provide user-friendly error messages through callback functions
 * - Continue execution even when clipboard API fails
 * - Handle both async errors and synchronous API availability issues
 * 
 * @param {Function} setMsg - Callback to update user message (success/failure text)
 * @param {Function} setCode - Callback to update UI state (often for visual indicators)
 * @returns {Function} Async function that handles clipboard copy operations
 * 
 * USAGE EXAMPLES:
 * 
 * // React component usage
 * const [message, setMessage] = useState('');
 * const [copiedId, setCopiedId] = useState(null);
 * const copyHandler = makeCopyFn(setMessage, setCopiedId);
 * 
 * // Vue component usage
 * const copyHandler = makeCopyFn(
 *   (msg) => { this.message = msg; },
 *   (id) => { this.copiedId = id; }
 * );
 * 
 * // Vanilla JavaScript usage
 * const copyHandler = makeCopyFn(
 *   (msg) => document.getElementById('status').textContent = msg,
 *   (id) => document.getElementById('button-' + id).classList.add('copied')
 * );
 * 
 * // Then use the handler:
 * await copyHandler('Hello World', 'button-1');
 */
function makeCopyFn(setMsg, setCode) {
  console.log(`makeCopyFn is running with ${typeof setMsg} and ${typeof setCode}`); 
  logger.debug(`makeCopyFn creating clipboard handler with callbacks: ${typeof setMsg}, ${typeof setCode}`); // log factory creation
  
  try {
    // Validate callback parameters
    if (typeof setMsg !== 'function') {
      console.log(`makeCopyFn received invalid setMsg parameter: ${typeof setMsg}`);
      logger.warn(`makeCopyFn received non-function setMsg parameter`);
      setMsg = () => {}; // provide no-op fallback
    }
    
    if (typeof setCode !== 'function') {
      console.log(`makeCopyFn received invalid setCode parameter: ${typeof setCode}`);
      logger.warn(`makeCopyFn received non-function setCode parameter`);
      setCode = () => {}; // provide no-op fallback
    }
    
    // Return the actual clipboard handler function
    async function copyToClipboard(text, id) {
      console.log(`copyToClipboard is running with ${text} and ${id}`); 
      logger.debug(`copyToClipboard attempting to copy text length: ${text ? text.length : 0}`); // log copy attempt
      
      try {
        // Validate input parameters
        if (typeof text !== 'string') {
          console.log(`copyToClipboard received invalid text parameter: ${typeof text}`);
          logger.warn(`copyToClipboard received non-string text parameter`);
          setMsg('Invalid text to copy');
          return;
        }
        
        // Check for clipboard API availability
        if (!navigator || !navigator.clipboard || !navigator.clipboard.writeText) {
          const errorMsg = 'Clipboard API not available in this browser';
          console.log(`copyToClipboard failed: ${errorMsg}`);
          logger.warn(`copyToClipboard failed - clipboard API unavailable`);
          setMsg('Clipboard not supported');
          return;
        }
        
        // Check for secure context (HTTPS requirement)
        if (!window.isSecureContext) {
          const errorMsg = 'Clipboard API requires secure context (HTTPS)';
          console.log(`copyToClipboard failed: ${errorMsg}`);
          logger.warn(`copyToClipboard failed - insecure context`);
          setMsg('Clipboard requires HTTPS');
          return;
        }
        
        // Attempt to copy text to clipboard
        await navigator.clipboard.writeText(text);
        
        // Success feedback
        setCode(id); // mark as copied on success
        setMsg('Copied to clipboard'); // announce success
        
        console.log(`copyToClipboard succeeded for id: ${id}`);
        logger.debug(`copyToClipboard successful copy operation`);
        
        // Reset state after delay
        setTimeout(() => {
          setCode(null); // clear copied id
          setMsg(''); // clear message
          console.log(`copyToClipboard state reset completed`);
          logger.debug(`copyToClipboard automatic state reset completed`);
        }, 4000); // 4 second delay for user feedback
        
      } catch (error) {
        // Handle clipboard operation errors
        console.error('Failed to copy to clipboard:', error);
        qerrors(error, 'copyToClipboard', { textLength: text ? text.length : 0, id }); // log with safe context
        
        // Provide user-friendly error message
        const userMessage = error.name === 'NotAllowedError' 
          ? 'Permission denied - please try again'
          : 'Failed to copy';
        
        setMsg(userMessage); // notify user of failure
        logger.error(`copyToClipboard failed with error: ${error.message}`);
      }
    }
    
    console.log(`makeCopyFn is returning copyToClipboard function`);
    logger.debug(`makeCopyFn successfully created clipboard handler`);
    return copyToClipboard; // expose handler
    
  } catch (error) {
    // Handle factory creation errors
    console.error('Failed to create copy function:', error);
    qerrors(error, 'makeCopyFn', { setMsgType: typeof setMsg, setCodeType: typeof setCode });
    
    // Return safe fallback function
    return async function fallbackCopyToClipboard(text, id) {
      console.log(`fallbackCopyToClipboard called due to factory error`);
      if (typeof setMsg === 'function') {
        setMsg('Copy function unavailable');
      }
    };
  }
}

/**
 * Check if clipboard API is available in current browser context
 * 
 * RATIONALE: Applications may want to conditionally show copy buttons or
 * provide alternative workflows when clipboard functionality is not available.
 * This function provides a simple way to detect clipboard support.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Check for multiple API requirements (navigator, clipboard, writeText)
 * - Verify secure context requirement (HTTPS)
 * - Return boolean for simple conditional logic
 * - Handle all error conditions gracefully
 * 
 * CLIPBOARD API REQUIREMENTS:
 * The modern clipboard API requires several conditions to be met:
 * 1. Browser supports navigator.clipboard (modern browsers)
 * 2. writeText method is available (not all implementations complete)
 * 3. Secure context (HTTPS) for security reasons
 * 4. Document has focus (some browsers require this)
 * 
 * FALLBACK CONSIDERATIONS:
 * When this function returns false, applications can:
 * - Hide copy buttons and show alternative instructions
 * - Use legacy clipboard methods (document.execCommand - deprecated)
 * - Provide manual copy instructions ("Press Ctrl+C to copy")
 * - Show content in a text area for manual selection
 * 
 * @returns {boolean} True if clipboard write operations are supported, false otherwise
 * 
 * USAGE EXAMPLES:
 * if (isClipboardSupported()) {
 *   showCopyButton();
 * } else {
 *   showManualCopyInstructions();
 * }
 */
function isClipboardSupported() {
  console.log(`isClipboardSupported is checking browser capabilities`);
  logger.debug(`isClipboardSupported checking clipboard API availability`);
  
  try {
    // Check for navigator object (not available in Node.js or some contexts)
    if (typeof navigator === 'undefined') {
      console.log(`isClipboardSupported: navigator not available`);
      logger.debug(`isClipboardSupported: navigator object not available`);
      return false;
    }
    
    // Check for clipboard API
    if (!navigator.clipboard) {
      console.log(`isClipboardSupported: clipboard API not available`);
      logger.debug(`isClipboardSupported: navigator.clipboard not available`);
      return false;
    }
    
    // Check for writeText method
    if (typeof navigator.clipboard.writeText !== 'function') {
      console.log(`isClipboardSupported: writeText method not available`);
      logger.debug(`isClipboardSupported: clipboard.writeText not available`);
      return false;
    }
    
    // Check for secure context (HTTPS requirement)
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      console.log(`isClipboardSupported: secure context required`);
      logger.debug(`isClipboardSupported: secure context (HTTPS) required`);
      return false;
    }
    
    console.log(`isClipboardSupported: clipboard API fully supported`);
    logger.debug(`isClipboardSupported: clipboard API available and supported`);
    return true;
    
  } catch (error) {
    console.error('Error checking clipboard support:', error);
    qerrors(error, 'isClipboardSupported', {});
    logger.error(`isClipboardSupported error: ${error.message}`);
    return false; // fail-safe: assume not supported on error
  }
}

/**
 * Detect if code is running in a browser environment
 * 
 * RATIONALE: Since QGenUtils can be used in both server-side (Node.js) and
 * client-side (browser) contexts, utilities need to detect their environment
 * to provide appropriate functionality and avoid errors.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Check for multiple browser-specific global objects
 * - Return boolean for simple conditional logic
 * - Handle cases where globals are undefined or modified
 * - Fail-safe behavior when detection is uncertain
 * 
 * BROWSER DETECTION STRATEGY:
 * We check for the presence of key browser globals:
 * - window: Main browser global object
 * - document: DOM document object
 * - navigator: Browser information object
 * 
 * These are reliably present in browser environments and absent in Node.js.
 * 
 * USE CASES:
 * - Conditional imports of browser-specific code
 * - Feature detection for environment-specific utilities
 * - Safe initialization of browser APIs
 * - Preventing server-side execution of client-side code
 * 
 * @returns {boolean} True if running in browser environment, false otherwise
 * 
 * USAGE EXAMPLES:
 * if (isBrowser()) {
 *   // Safe to use DOM APIs
 *   document.getElementById('myElement');
 * } else {
 *   // Running in Node.js, use server-side alternatives
 *   console.log('Server-side execution');
 * }
 */
function isBrowser() {
  console.log(`isBrowser is checking execution environment`);
  logger.debug(`isBrowser checking for browser environment`);
  
  try {
    // Check for browser global objects
    const hasWindow = typeof window !== 'undefined';
    const hasDocument = typeof document !== 'undefined';
    const hasNavigator = typeof navigator !== 'undefined';
    
    // Browser environment should have all three
    const browserDetected = hasWindow && hasDocument && hasNavigator;
    
    console.log(`isBrowser detected: ${browserDetected ? 'browser' : 'non-browser'} environment`);
    logger.debug(`isBrowser result: ${browserDetected}, window: ${hasWindow}, document: ${hasDocument}, navigator: ${hasNavigator}`);
    
    return browserDetected;
    
  } catch (error) {
    console.error('Error detecting browser environment:', error);
    qerrors(error, 'isBrowser', {});
    logger.error(`isBrowser error: ${error.message}`);
    return false; // fail-safe: assume not browser on error
  }
}

/*
 * Module Export Strategy:
 * 
 * We export browser utilities that complement the existing server-side utilities:
 * 
 * 1. makeCopyFn - Factory for creating clipboard copy handlers
 * 2. isClipboardSupported - Feature detection for clipboard API
 * 3. isBrowser - Environment detection for conditional logic
 * 
 * These functions follow the same patterns as other QGenUtils modules:
 * - Comprehensive error handling with qerrors integration
 * - Structured logging for debugging and monitoring
 * - Fail-safe behavior when browser APIs are unavailable
 * - Clear, descriptive function names and consistent interfaces
 * 
 * FUTURE ENHANCEMENTS:
 * - Add DOM manipulation utilities (element selection, event handling)
 * - Add form validation helpers for client-side validation
 * - Add browser storage utilities (localStorage, sessionStorage)
 * - Add URL parameter parsing and manipulation for client-side routing
 * - Add responsive design helpers (viewport detection, media queries)
 * - Add accessibility utilities (focus management, ARIA helpers)
 */
module.exports = {
  makeCopyFn, // export clipboard copy factory
  isClipboardSupported, // export clipboard feature detection
  isBrowser // export browser environment detection
};