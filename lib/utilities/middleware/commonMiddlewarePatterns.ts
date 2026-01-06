/**
 * Common Middleware Utilities
 * 
 * Centralized middleware utilities to eliminate code duplication across
 * the codebase. These utilities handle common middleware patterns including
 * composition, chaining, and factory patterns.
 */

import type { Request, Response, NextFunction } from 'express';
import { handleError } from '../error/commonErrorHandling.js';

/**
 * Middleware function type
 */
export type MiddlewareFunction = (req: Request, res: Response, next: NextFunction) => void;

/**
 * Middleware factory configuration
 */
interface MiddlewareConfig {
  name?: string;
  enabled?: boolean;
  priority?: number;
  skipPaths?: string[];
  skipMethods?: string[];
  skipCondition?: (req: Request) => boolean;
}

/**
 * Creates a middleware wrapper with common functionality
 * @param middleware - Base middleware function
 * @param config - Configuration options
 * @returns Enhanced middleware function
 */
export function createMiddleware(
  middleware: MiddlewareFunction,
  config: MiddlewareConfig = {}
): MiddlewareFunction {
  const {
    name = 'middleware',
    enabled = true,
    priority = 0,
    skipPaths = [],
    skipMethods = [],
    skipCondition
  } = config;
  
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Check if middleware is enabled
      if (!enabled) {
        return next();
      }
      
      // Check skip conditions
      if (skipPaths.some(path => req.path.startsWith(path))) {
        return next();
      }
      
      if (skipMethods.includes(req.method)) {
        return next();
      }
      
      if (skipCondition && skipCondition(req)) {
        return next();
      }
      
      // Execute middleware
      try {
        middleware(req, res, next);
      } catch (error: any) {
        handleError(error, name, 'Middleware execution failed');
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: {
              type: 'MIDDLEWARE_ERROR',
              message: 'Internal server error'
            }
          });
        }
      }
    } catch (error) {
      handleError(error, name, 'Middleware execution failed');
      
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: {
            type: 'MIDDLEWARE_ERROR',
            message: 'Internal server error'
          }
        });
      }
    }
  };
}

/**
 * Chains multiple middleware functions in order
 * @param middlewares - Array of middleware functions
 * @returns Composed middleware function
 */
export function chainMiddleware(middlewares: MiddlewareFunction[]): MiddlewareFunction {
  return (req: Request, res: Response, next: NextFunction): void => {
    let index = 0;
    
    const dispatch = (i: number): void => {
      if (i <= index) {
        throw new Error('next() called multiple times');
      }
      
      index = i;
      
      if (i >= middlewares.length) {
        return next();
      }
      
      const middleware = middlewares[i];
      try {
        middleware(req, res, dispatch.bind(null, i + 1));
      } catch (error) {
        handleError(error, 'chainMiddleware', `Middleware at index ${i} failed`);
        
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: {
              type: 'MIDDLEWARE_CHAIN_ERROR',
              message: 'Internal server error'
            }
          });
        }
      }
    };
    
    dispatch(0);
  };
}

/**
 * Creates conditional middleware that executes based on request properties
 * @param condition - Condition function
 * @param middleware - Middleware to execute if condition is true
 * @param elseMiddleware - Optional middleware to execute if condition is false
 * @returns Conditional middleware function
 */
export function createConditionalMiddleware(
  condition: (req: Request) => boolean,
  middleware: MiddlewareFunction,
  elseMiddleware?: MiddlewareFunction
): MiddlewareFunction {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (condition(req)) {
      return middleware(req, res, next);
    } else if (elseMiddleware) {
      return elseMiddleware(req, res, next);
    } else {
      return next();
    }
  };
}

/**
 * Creates middleware with rate limiting
 * @param options - Rate limiting options
 * @returns Rate limiting middleware
 */
export function createRateLimitMiddleware(options: {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}): MiddlewareFunction {
  const {
    windowMs,
    max,
    message = 'Too many requests',
    keyGenerator = (req) => req.ip || 'unknown',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;
  
  const requests = new Map<string, Array<{ timestamp: number; success?: boolean }>>();
  
  // Cleanup interval
  const cleanupInterval = setInterval(() => {
    const cutoff = Date.now() - windowMs;
    
    for (const [key, timestamps] of requests.entries()) {
      const filtered = timestamps.filter(t => t.timestamp > cutoff);
      if (filtered.length === 0) {
        requests.delete(key);
      } else {
        requests.set(key, filtered);
      }
    }
  }, Math.min(windowMs / 10, 60000)); // Cleanup at least every minute
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyGenerator(req);
    const now = Date.now();
    const cutoff = now - windowMs;
    
    // Get existing requests for this key
    let keyRequests = requests.get(key) || [];
    
    // Filter old requests
    keyRequests = keyRequests.filter(t => t.timestamp > cutoff);
    
    // Check rate limit
    if (keyRequests.length >= max) {
      return res.status(429).json({
        success: false,
        error: {
          type: 'RATE_LIMIT_EXCEEDED',
          message,
          metadata: {
            limit: max,
            windowMs,
            retryAfter: Math.ceil(windowMs / 1000)
          }
        }
      });
    }
    
    // Add current request
    keyRequests.push({ timestamp: now });
    requests.set(key, keyRequests);
    
    // Store rate limit info for response headers
    (req as any).rateLimit = {
      limit: max,
      current: keyRequests.length,
      remaining: Math.max(0, max - keyRequests.length),
      resetTime: new Date(now + windowMs)
    };
    
    // Track success/failure
    const originalSend = res.send;
    res.send = function(this: Response, ...args: any[]) {
      const statusCode = this.statusCode;
      const isSuccess = statusCode >= 200 && statusCode < 300;
      
      // Update request tracking based on result
      if (isSuccess && skipSuccessfulRequests) {
        const requests = (req as any).rateLimit.requests || [];
        const lastRequest = requests[requests.length - 1];
        if (lastRequest) {
          lastRequest.success = true;
        }
      }
      
      if (!isSuccess && skipFailedRequests) {
        const requests = (req as any).rateLimit.requests || [];
        const lastRequest = requests[requests.length - 1];
        if (lastRequest) {
          lastRequest.success = false;
        }
      }
      
      // Set rate limit headers
      this.set('X-RateLimit-Limit', max.toString());
      this.set('X-RateLimit-Current', keyRequests.length.toString());
      this.set('X-RateLimit-Remaining', Math.max(0, max - keyRequests.length).toString());
      this.set('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
      
      return originalSend.apply(this, args);
    };
    
    next();
  };
}

/**
 * Creates middleware for request timing
 * @param options - Timing options
 * @returns Timing middleware
 */
export function createTimingMiddleware(options: {
  headerName?: string;
  logSlowRequests?: boolean;
  slowRequestThreshold?: number;
  enableDetailedLogging?: boolean;
} = {}): MiddlewareFunction {
  const {
    headerName = 'X-Response-Time',
    logSlowRequests = true,
    slowRequestThreshold = 1000, // 1 second
    enableDetailedLogging = false
  } = options;
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    
    // Capture response end
    const originalEnd = res.end;
    res.end = function(this: Response, ...args: any[]): any {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Set timing header
      this.set(headerName, `${duration}ms`);
      
      // Log slow requests
      if (logSlowRequests && duration > slowRequestThreshold) {
        if (enableDetailedLogging) {
          console.warn(`Slow request detected: ${req.method} ${req.originalUrl} took ${duration}ms (IP: ${req.ip}, UA: ${req.get('User-Agent')})`);
        } else {
          console.warn(`Slow request: ${req.method} ${req.originalUrl} took ${duration}ms`);
        }
      }
      
      // Attach timing info to request
      (req as any).timing = {
        startTime,
        endTime,
        duration,
        isSlow: duration > slowRequestThreshold
      };
      
      return originalEnd.apply(this, args);
    };
    
    next();
  };
}

/**
 * Creates middleware for request/response body validation
 * @param validator - Validation function
 * @param options - Validation options
 * @returns Validation middleware
 */
export function createValidationMiddleware(
  validator: (req: Request) => { isValid: boolean; error?: string; field?: string },
  options: {
    validateBody?: boolean;
    validateQuery?: boolean;
    validateParams?: boolean;
    errorMessage?: string;
  } = {}
): MiddlewareFunction {
  const {
    validateBody = true,
    validateQuery = false,
    validateParams = false,
    errorMessage = 'Validation failed'
  } = options;
  
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validation = validator(req);
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            message: validation.error || errorMessage,
            ...(validation.field && { field: validation.field })
          }
        });
      }
      
      // Attach validation result to request
      (req as any).validation = validation;
      
      next();
    } catch (error) {
      handleError(error, 'createValidationMiddleware', 'Request validation failed');
      
      return res.status(500).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Request validation failed'
        }
      });
    }
  };
}

/**
 * Creates middleware for CORS handling
 * @param options - CORS options
 * @returns CORS middleware
 */
export function createCorsMiddleware(options: {
  origins?: string[];
  methods?: string[];
  headers?: string[];
  credentials?: boolean;
  maxAge?: number;
} = {}): MiddlewareFunction {
  const {
    origins = ['*'],
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    headers = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
    maxAge = 86400 // 24 hours
  } = options;
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const origin = req.get('Origin');
    
    // Set Access-Control-Allow-Origin
    if (origins.includes('*')) {
      res.set('Access-Control-Allow-Origin', '*');
    } else if (origin && origins.includes(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
    }
    
    // Set Access-Control-Allow-Methods
    res.set('Access-Control-Allow-Methods', methods.join(', '));
    
    // Set Access-Control-Allow-Headers
    res.set('Access-Control-Allow-Headers', headers.join(', '));
    
    // Set Access-Control-Allow-Credentials
    if (credentials) {
      res.set('Access-Control-Allow-Credentials', 'true');
    }
    
    // Set Access-Control-Max-Age
    res.set('Access-Control-Max-Age', maxAge.toString());
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    
    next();
  };
}

/**
 * Creates middleware for request ID generation and tracking
 * @param options - Request ID options
 * @returns Request ID middleware
 */
export function createRequestIdMiddleware(options: {
  headerName?: string;
  generator?: () => string;
  addToResponse?: boolean;
} = {}): MiddlewareFunction {
  const {
    headerName = 'X-Request-ID',
    generator = () => {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 8);
      return `req_${timestamp}_${random}`;
    },
    addToResponse = true
  } = options;
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const requestId = generator();
    
    // Add to request
    (req as any).requestId = requestId;
    
    // Add to response header
    if (addToResponse) {
      res.set(headerName, requestId);
    }
    
    next();
  };
}