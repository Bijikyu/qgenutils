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
const sanitizeInput = (input: string, options: SanitizeInputOptions = {}): string => {
  if (!input || typeof input !== 'string') return '';
  const maxLength = options.maxLength ?? 10000;
  input = input.length > maxLength ? input.substring(0, maxLength) : input;

  try {
    const encoded = new TextEncoder().encode(input);
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(encoded);
    if (decoded.includes('�')) return '';
    const hasControlChars = /[\x00-\x1F\x7F]/.test(input);
    const hasHighSurrogates = /[\uD800-\uDFFF]/.test(input);
    const hasLowSurrogates = /[\uDC00-\uDFFF]/.test(input);
    if ((hasControlChars || hasHighSurrogates || hasLowSurrogates) && !input.includes('\t') && !input.includes('\n') && !input.includes('\r')) return '';
  } catch (encodingError) {
    return '';
  }

  const defaultOptions: SanitizeInputOptions = { allowedTags: [], allowedAttributes: {}, textFilter: (text: string): string => text.trim(), maxLength, allowedEncodings: ['utf-8'] };
  const finalOptions = { ...defaultOptions, ...options };

  try {
    return sanitizeHtml(input, finalOptions);
  } catch (error) {
    return input.replace(/<[^>]*>/g, '').trim();
  }
};

export default sanitizeInput;
