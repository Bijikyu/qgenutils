/**
 * Streaming JSON Parser for Large Payloads
 * 
 * Replaces blocking JSON.parse with non-blocking streaming approach
 * to prevent event loop blocking on large JSON payloads (>1MB).
 */

import { Transform } from 'stream';
import { JSONParser } from 'stream-json';

export interface StreamingParseOptions {
  reviver?: (key: string, value: any) => any;
  replacer?: (key: string, value: any) => any;
  maxChunkSize?: number;
}

export interface StreamingParseResult<T = any> {
  data?: T;
  error?: Error;
  bytesProcessed: number;
  duration: number;
}

/**
 * Parse JSON string without blocking the event loop
 * Uses streaming approach for large payloads, fallback to JSON.parse for small ones
 */
export class StreamingJSONParser extends Transform {
  private parser: any;
  private result: any;
  private inProgress: boolean = false;
  private bytesProcessed: number = 0;
  private startTime: number = 0;

  constructor(private options: StreamingParseOptions = {}) {
    super({ objectMode: true });
    
    // Initialize stream-json parser
    this.parser = new JSONParser({
      streamValues: false,
      packKeys: true,
      ...options
    });
    
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.parser.onValue = (value: any) => {
      if (!this.inProgress) {
        this.result = value;
        this.inProgress = true;
      }
    };

    this.parser.onError = (error: Error) => {
      this.emit('error', error);
    };

    this.parser.onEnd = () => {
      this.emit('end', this.result);
    };
  }

  _transform(chunk: any, encoding: string, callback: Function): void {
    if (!this.startTime) {
      this.startTime = performance.now();
    }

    try {
      // Track bytes processed
      if (typeof chunk === 'string') {
        this.bytesProcessed += Buffer.byteLength(chunk, 'utf8');
      } else {
        this.bytesProcessed += chunk.length;
      }

      // Feed chunk to parser
      if (typeof chunk === 'string') {
        this.parser.write(chunk);
      } else {
        this.parser.write(chunk.toString('utf8'));
      }
      
      callback();
    } catch (error) {
      callback(error);
    }
  }

  _flush(callback: Function): void {
    try {
      this.parser.end();
      callback();
    } catch (error) {
      callback(error);
    }
  }

  getStats(): { bytesProcessed: number; duration: number } {
    return {
      bytesProcessed: this.bytesProcessed,
      duration: this.startTime ? performance.now() - this.startTime : 0
    };
  }
}

/**
 * Parse JSON string using appropriate method based on size
 * @param jsonString - JSON string to parse
 * @param options - Parsing options
 * @returns Promise with parse result and stats
 */
export async function parseJSONAsync<T = any>(
  jsonString: string,
  options: StreamingParseOptions = {}
): Promise<StreamingParseResult<T>> {
  const { maxChunkSize = 64 * 1024 } = options; // 64KB chunks
  const threshold = 1024 * 1024; // 1MB threshold

  return new Promise((resolve) => {
    const startTime = performance.now();
    
    try {
      // For small payloads, use fast JSON.parse
      if (jsonString.length < threshold) {
        const result = JSON.parse(jsonString, options.reviver);
        resolve({
          data: result,
          bytesProcessed: Buffer.byteLength(jsonString, 'utf8'),
          duration: performance.now() - startTime
        });
        return;
      }

      // For large payloads, use streaming parser
      const parser = new StreamingJSONParser(options);
      let result: T;

      parser.on('data', (data: T) => {
        result = data;
      });

      parser.on('error', (error: Error) => {
        resolve({
          error,
          bytesProcessed: Buffer.byteLength(jsonString, 'utf8'),
          duration: performance.now() - startTime
        });
      });

      parser.on('end', () => {
        resolve({
          data: result,
          bytesProcessed: Buffer.byteLength(jsonString, 'utf8'),
          duration: performance.now() - startTime
        });
      });

      // Create readable stream from string
      const { Readable } = require('stream');
      const stream = Readable.from([jsonString]);

      // Pipe through streaming parser
      stream
        .pipe(parser)
        .on('error', (error: Error) => {
          // Fallback to regular parse if streaming fails
          try {
            const fallbackResult = JSON.parse(jsonString, options.reviver);
            resolve({
              data: fallbackResult,
              bytesProcessed: Buffer.byteLength(jsonString, 'utf8'),
              duration: performance.now() - startTime
            });
          } catch (fallbackError) {
            resolve({
              error: fallbackError as Error,
              bytesProcessed: Buffer.byteLength(jsonString, 'utf8'),
              duration: performance.now() - startTime
            });
          }
        });

    } catch (error) {
      resolve({
        error: error as Error,
        bytesProcessed: Buffer.byteLength(jsonString, 'utf8'),
        duration: performance.now() - startTime
      });
    }
  });
}

/**
 * Synchronous JSON parsing with size limit for security
 * Prevents ReDoS attacks by limiting input size
 */
export function safeJSONParse<T = any>(
  jsonString: string,
  options: { max_size?: number; reviver?: (key: string, value: any) => any } = {}
): T | null {
  const { max_size = 10 * 1024 * 1024 } = options; // 10MB default limit

  // Prevent ReDoS by limiting input size
  if (jsonString.length > max_size) {
    throw new Error(`JSON input too large: ${jsonString.length} bytes (max: ${max_size})`);
  }

  try {
    return JSON.parse(jsonString, options.reviver);
  } catch (error) {
    // Log error but don't expose potentially sensitive data
    console.warn('[security] JSON parse error:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * JSON.stringify with circular reference handling
 */
export function safeJSONStringify(
  obj: any,
  options: { replacer?: (key: string, value: any) => any; space?: string | number } = {}
): string | null {
  try {
    const seen = new WeakSet();
    const replacer = options.replacer || ((key: string, value: any) => {
      // Prevent circular references
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    });

    return JSON.stringify(obj, replacer, options.space);
  } catch (error) {
    console.warn('[security] JSON stringify error:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

export default {
  StreamingJSONParser,
  parseJSONAsync,
  safeJSONParse,
  safeJSONStringify
};