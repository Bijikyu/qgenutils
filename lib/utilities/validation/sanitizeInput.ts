import sanitizeHtml from 'sanitize-html'; // XSS prevention library

interface SanitizeInputOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  textFilter?: (text: string) => string;
  maxLength?: number; // Maximum allowed input length to prevent DoS
  allowedEncodings?: string[]; // Allowed character encodings (utf-8, ascii)
}

/**
 * Sanitize input to prevent XSS and injection attacks
 * @param input - Input string to sanitize
 * @param options - Sanitization options
 * @returns Sanitized input string with all HTML tags removed
 * @example
 * sanitizeInput('<script>alert("xss")</script>Hello') // returns 'Hello'
 * sanitizeInput('Normal text') // returns 'Normal text'
 */
function sanitizeInput(input: string, options: SanitizeInputOptions = {}): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // LENGTH VALIDATION: Prevent DoS attacks via extremely long inputs
  const maxLength = options.maxLength || 10000; // Default 10KB limit
  if (input.length > maxLength) {
    input = input.substring(0, maxLength);
  }

  // ENCODING VALIDATION: Ensure input is properly encoded UTF-8
  // This helps prevent malformed character attacks
  try {
    // Test if string contains valid UTF-8 sequences
    const encoded = new TextEncoder().encode(input);
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(encoded);
    // Node.js doesn't reliably throw on all invalid UTF-8 with fatal:true
    // So we check if any replacement characters were introduced
    if (decoded.includes('�')) {
      // Input contained invalid UTF-8 sequences that were replaced
      return '';
    }
    // Additional check for common problematic patterns
    // Check for characters that could indicate escape sequences
    // Note: This is a heuristic - legitimate use cases should pass validation
    const hasControlChars = /[\x00-\x1F\x7F]/.test(input);
    const hasHighSurrogates = /[\uD800-\uDFFF]/.test(input);
    const hasLowSurrogates = /[\uDC00-\uDFFF]/.test(input);
    
    if ((hasControlChars || hasHighSurrogates || hasLowSurrogates) && 
        !input.includes('\t') && !input.includes('\n') && !input.includes('\r')) {
      // Suspicious character patterns detected
      return '';
    }
  } catch (encodingError) {
    // Return empty string for malformed input to prevent encoding attacks
    return '';
  }

  const defaultOptions: SanitizeInputOptions = {
    allowedTags: [], // disallow all HTML tags for maximum security
    allowedAttributes: {}, // disallow all attributes
    textFilter: (text: string): string => text.trim(), // preserve text content while trimming whitespace
    maxLength: maxLength, // Apply length limit
    allowedEncodings: ['utf-8'], // Default to UTF-8 only
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    return sanitizeHtml(input, finalOptions);
  } catch (error) {
    // Fallback to basic sanitization if sanitize-html fails
    return input.replace(/<[^>]*>/g, '').trim();
  }
}

export default sanitizeInput;
