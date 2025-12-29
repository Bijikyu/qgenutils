import sanitizeHtml from 'sanitize-html'; // XSS prevention library

interface SanitizeInputOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  textFilter?: (text: string) => string;
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

  const defaultOptions: SanitizeInputOptions = {
    allowedTags: [], // disallow all HTML tags for maximum security
    allowedAttributes: {}, // disallow all attributes
    textFilter: (text: string): string => text.trim() // preserve text content while trimming whitespace
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
