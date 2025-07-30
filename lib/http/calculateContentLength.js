/**
 * Calculate Content-Length for HTTP Request/Response Bodies
 * 
 * RATIONALE: HTTP/1.1 requires accurate Content-Length headers for proper request
 * handling. Incorrect lengths can cause connection issues, request truncation,
 * or hanging connections. This utility provides reliable byte-length calculation.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Handle multiple input types (string, Buffer, object, array)
 * - Use Buffer.byteLength for accurate UTF-8 byte counting
 * - Convert objects/arrays to JSON strings before measurement
 * - Handle edge cases like null, undefined, and circular references
 * - Return 0 for invalid inputs rather than throwing errors
 * 
 * BYTE COUNTING CONSIDERATIONS:
 * - String.length counts characters, not bytes
 * - UTF-8 characters can be 1-4 bytes each
 * - Buffer.byteLength provides accurate byte counts for strings
 * - JSON serialization may add quotes, brackets, commas
 * - Circular references in objects cause JSON.stringify to fail
 * 
 * HTTP COMPLIANCE:
 * - Content-Length must match exact byte count of body
 * - Mismatched lengths cause client/server parsing errors
 * - Zero length is valid for empty bodies
 * - Length calculation should include all encoding overhead
 * 
 * @param {any} body - Request/response body to measure (string, Buffer, object, array, etc.)
 * @returns {number} Byte length of content or 0 if measurement fails
 * @throws Never throws - returns 0 for any error condition
 */

const { qerrors } = require('qerrors');
const logger = require('../logger');

function calculateContentLength(body) {
  console.log(`calculateContentLength measuring body type: ${typeof body}`);
  logger.debug('calculateContentLength measuring content', { 
    bodyType: typeof body,
    isBuffer: Buffer.isBuffer(body),
    isNull: body === null,
    isUndefined: body === undefined
  });

  try {
    // Handle null and undefined inputs
    if (body === null || body === undefined) {
      console.log('calculateContentLength: null/undefined body, returning 0');
      logger.debug('calculateContentLength: null or undefined body');
      return 0;
    }

    // Handle Buffer objects directly
    if (Buffer.isBuffer(body)) {
      const length = body.length;
      console.log(`calculateContentLength: Buffer body, length = ${length}`);
      logger.debug('calculateContentLength: Buffer measured', { length });
      return length;
    }

    // Handle string inputs with proper UTF-8 byte counting
    if (typeof body === 'string') {
      const byteLength = Buffer.byteLength(body, 'utf8');
      console.log(`calculateContentLength: string body, byteLength = ${byteLength}`);
      logger.debug('calculateContentLength: string measured', { 
        byteLength,
        charLength: body.length
      });
      return byteLength;
    }

    // Handle numbers by converting to string
    if (typeof body === 'number') {
      const stringBody = body.toString();
      const byteLength = Buffer.byteLength(stringBody, 'utf8');
      console.log(`calculateContentLength: number body converted to string, byteLength = ${byteLength}`);
      logger.debug('calculateContentLength: number converted to string', { 
        originalNumber: body,
        stringValue: stringBody,
        byteLength
      });
      return byteLength;
    }

    // Handle boolean by converting to string
    if (typeof body === 'boolean') {
      const stringBody = body.toString();
      const byteLength = Buffer.byteLength(stringBody, 'utf8');
      console.log(`calculateContentLength: boolean body converted to string, byteLength = ${byteLength}`);
      logger.debug('calculateContentLength: boolean converted to string', { 
        originalBoolean: body,
        stringValue: stringBody,
        byteLength
      });
      return byteLength;
    }

    // Handle objects and arrays by JSON serialization
    if (typeof body === 'object') {
      try {
        const jsonString = JSON.stringify(body);
        const byteLength = Buffer.byteLength(jsonString, 'utf8');
        console.log(`calculateContentLength: object body serialized to JSON, byteLength = ${byteLength}`);
        logger.debug('calculateContentLength: object serialized to JSON', { 
          byteLength,
          jsonLength: jsonString.length
        });
        return byteLength;
      } catch (jsonError) {
        console.error('calculateContentLength: JSON serialization failed:', jsonError.message);
        qerrors(jsonError, 'calculateContentLength-json', { 
          bodyType: typeof body,
          isArray: Array.isArray(body)
        });
        logger.error('calculateContentLength: JSON serialization failed', { 
          error: jsonError.message,
          bodyType: typeof body
        });
        return 0; // Return 0 for unserializable objects
      }
    }

    // Handle any other types by converting to string
    try {
      const stringBody = String(body);
      const byteLength = Buffer.byteLength(stringBody, 'utf8');
      console.log(`calculateContentLength: unknown type converted to string, byteLength = ${byteLength}`);
      logger.debug('calculateContentLength: unknown type converted to string', { 
        originalType: typeof body,
        stringValue: stringBody,
        byteLength
      });
      return byteLength;
    } catch (stringError) {
      console.error('calculateContentLength: string conversion failed:', stringError.message);
      qerrors(stringError, 'calculateContentLength-string', { bodyType: typeof body });
      logger.error('calculateContentLength: string conversion failed', { 
        error: stringError.message,
        bodyType: typeof body
      });
      return 0; // Return 0 if all conversion attempts fail
    }

  } catch (error) {
    // Handle any unexpected errors during length calculation
    console.error('calculateContentLength encountered unexpected error:', error.message);
    qerrors(error, 'calculateContentLength', { 
      bodyType: typeof body,
      errorMessage: error.message
    });
    logger.error('calculateContentLength failed with error', { 
      error: error.message,
      bodyType: typeof body,
      stack: error.stack
    });

    // Return 0 as safe fallback for any error
    return 0;
  }
}

module.exports = calculateContentLength;