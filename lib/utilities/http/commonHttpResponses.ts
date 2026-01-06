/**
 * Common HTTP Response Utilities
 * 
 * Centralized HTTP response utilities to eliminate code duplication across
 * the codebase. These utilities handle common response patterns including
 * success responses, error responses, and standardized response formatting.
 */

import { Request, Response } from 'express';
import { createErrorResponse } from '../error/commonErrorHandling.js';

/**
 * Standard success response format
 * @param data - Response data
 * @param options - Response options
 * @returns Standardized success response object
 */
export interface SuccessResponseOptions {
  message?: string;
  status?: number;
  metadata?: Record<string, any>;
}

/**
 * Creates a standardized success response
 * @param data - Response data
 * @param options - Response options
 * @returns Standardized success response object
 */
export function createSuccessResponse(data: any, options: SuccessResponseOptions = {}): {
  success: true;
  data: any;
  message?: string;
  metadata?: Record<string, any>;
} {
  const { message, status = 200, metadata } = options;
  
  return {
    success: true,
    data,
    ...(message && { message }),
    ...(metadata && { metadata })
  };
}

/**
 * Sends a standardized success response
 * @param res - Express response object
 * @param data - Response data
 * @param options - Response options
 * @returns Express response object
 */
export function sendSuccessResponse(res: Response, data: any, options: SuccessResponseOptions = {}): Response {
  const { status = 200, ...responseOptions } = options;
  const response = createSuccessResponse(data, responseOptions);
  
  return res.status(status).json(response);
}

/**
 * Standard response types for common scenarios
 */
export const ResponseTypes = {
  /**
   * OK response (200)
   */
  ok: (res: Response, data: any, message?: string) => 
    sendSuccessResponse(res, data, { message, status: 200 }),

  /**
   * Created response (201)
   */
  created: (res: Response, data: any, message?: string) => 
    sendSuccessResponse(res, data, { message, status: 201 }),

  /**
   * Accepted response (202)
   */
  accepted: (res: Response, data?: any, message?: string) => 
    sendSuccessResponse(res, data || {}, { message, status: 202 }),

  /**
   * No Content response (204)
   */
  noContent: (res: Response, message?: string) => 
    sendSuccessResponse(res, null, { message, status: 204 }),

  /**
   * Partial Content response (206)
   */
  partialContent: (res: Response, data: any, message?: string) => 
    sendSuccessResponse(res, data, { message, status: 206 }),

  /**
   * Bad Request response (400)
   */
  badRequest: (res: Response, message = 'Bad request', field?: string) => {
    const response = createErrorResponse({ status: 400, type: 'BAD_REQUEST', message, field });
    return res.status(400).json(response);
  },

  /**
   * Unauthorized response (401)
   */
  unauthorized: (res: Response, message = 'Unauthorized') => {
    const response = createErrorResponse({ status: 401, type: 'UNAUTHORIZED', message });
    return res.status(401).json(response);
  },

  /**
   * Forbidden response (403)
   */
  forbidden: (res: Response, message = 'Forbidden') => {
    const response = createErrorResponse({ status: 403, type: 'FORBIDDEN', message });
    return res.status(403).json(response);
  },

  /**
   * Not Found response (404)
   */
  notFound: (res: Response, resource = 'Resource') => {
    const response = createErrorResponse({ 
      status: 404, 
      type: 'NOT_FOUND', 
      message: `${resource} not found` 
    });
    return res.status(404).json(response);
  },

  /**
   * Method Not Allowed response (405)
   */
  methodNotAllowed: (res: Response, allowedMethods?: string[]) => {
    const response = createErrorResponse({ 
      status: 405, 
      type: 'METHOD_NOT_ALLOWED', 
      message: 'Method not allowed',
      metadata: allowedMethods ? { allowedMethods } : undefined
    });
    if (allowedMethods) {
      res.set('Allow', allowedMethods.join(', '));
    }
    return res.status(405).json(response);
  },

  /**
   * Conflict response (409)
   */
  conflict: (res: Response, message = 'Conflict') => {
    const response = createErrorResponse({ status: 409, type: 'CONFLICT', message });
    return res.status(409).json(response);
  },

  /**
   * Unprocessable Entity response (422)
   */
  unprocessableEntity: (res: Response, message = 'Unprocessable entity', field?: string) => {
    const response = createErrorResponse({ status: 422, type: 'UNPROCESSABLE_ENTITY', message, field });
    return res.status(422).json(response);
  },

  /**
   * Too Many Requests response (429)
   */
  tooManyRequests: (res: Response, retryAfter?: number, message = 'Too many requests') => {
    const response = createErrorResponse({ 
      status: 429, 
      type: 'TOO_MANY_REQUESTS', 
      message,
      metadata: retryAfter ? { retryAfter } : undefined
    });
    if (retryAfter) {
      res.set('Retry-After', retryAfter.toString());
    }
    return res.status(429).json(response);
  },

  /**
   * Internal Server Error response (500)
   */
  internalServerError: (res: Response, message = 'Internal server error') => {
    const response = createErrorResponse({ status: 500, type: 'INTERNAL_SERVER_ERROR', message });
    return res.status(500).json(response);
  },

  /**
   * Service Unavailable response (503)
   */
  serviceUnavailable: (res: Response, message = 'Service unavailable') => {
    const response = createErrorResponse({ status: 503, type: 'SERVICE_UNAVAILABLE', message });
    return res.status(503).json(response);
  }
};

/**
 * Validates response data and sends appropriate response
 * @param res - Express response object
 * @param validation - Validation function
 * @param successHandler - Success handler function
 * @param options - Response options
 */
export function sendValidatedResponse<T>(
  res: Response,
  validation: (data: T) => { isValid: boolean; error?: string },
  successHandler: (data: T) => any,
  data: T,
  options: {
    successMessage?: string;
    successStatus?: number;
  } = {}
): Response {
  const { successMessage, successStatus = 200 } = options;
  
  const validationResult = validation(data);
  
  if (!validationResult.isValid) {
    return ResponseTypes.unprocessableEntity(res, validationResult.error);
  }
  
  const responseData = successHandler(data);
  return sendSuccessResponse(res, responseData, { 
    message: successMessage, 
    status: successStatus 
  });
}

/**
 * Sends paginated response with metadata
 * @param res - Express response object
 * @param data - Response data array
 * @param pagination - Pagination information
 * @param options - Response options
 */
export function sendPaginatedResponse(
  res: Response,
  data: any[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  },
  options: SuccessResponseOptions = {}
): Response {
  return sendSuccessResponse(res, data, {
    ...options,
    metadata: {
      pagination,
      ...options.metadata
    }
  });
}

/**
 * Sends file response with proper headers
 * @param res - Express response object
 * @param filePath - Path to file
 * @param options - File response options
 */
export function sendFileResponse(
  res: Response,
  filePath: string,
  options: {
    filename?: string;
    contentType?: string;
    cacheMaxAge?: number;
    download?: boolean;
  } = {}
): Response {
  const { filename, contentType, cacheMaxAge = 3600, download = false } = options;
  
  // Set cache headers
  if (cacheMaxAge > 0) {
    res.set('Cache-Control', `public, max-age=${cacheMaxAge}`);
  }
  
  // Set content type
  if (contentType) {
    res.set('Content-Type', contentType);
  }
  
  // Set download disposition
  if (download && filename) {
    res.set('Content-Disposition', `attachment; filename="${filename}"`);
  }
  
  return res.sendFile(filePath);
}

/**
 * Creates a response wrapper for API handlers
 * @param handler - API handler function
 * @param options - Wrapper options
 * @returns Wrapped handler with standardized error handling
 */
export function createApiResponseHandler<T = any>(
  handler: (req: Request, res: Response) => Promise<T> | T,
  options: {
    successMessage?: string;
    errorMessage?: string;
    statusCode?: number;
  } = {}
) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await handler(req, res);
      
      if (!res.headersSent) {
        const { successMessage, statusCode = 200 } = options;
        sendSuccessResponse(res, result, { message: successMessage, status: statusCode });
      }
    } catch (error) {
      if (!res.headersSent) {
        const { errorMessage = 'Request failed' } = options;
        const response = createErrorResponse({
          status: 500,
          type: 'HANDLER_ERROR',
          message: errorMessage,
          metadata: error instanceof Error ? { stack: error.stack } : undefined
        });
        res.status(500).json(response);
      }
    }
  };
}

/**
 * Sends response with conditional content based on request headers
 * @param res - Express response object
 * @param req - Express request object
 * @param content - Content options
 */
export function sendConditionalResponse(
  res: Response,
  req: Request,
  content: {
    json?: any;
    html?: string;
    text?: string;
    default: 'json' | 'html' | 'text';
  }
): Response {
  const acceptHeader = req.get('Accept') || '';
  const contentType = acceptHeader.includes('text/html') ? 'html' :
                     acceptHeader.includes('text/plain') ? 'text' : 'json';
  
  const selectedContent = content[contentType] || content[content.default];
  
  switch (contentType) {
    case 'html':
      return res.type('html').send(selectedContent as string);
    case 'text':
      return res.type('text').send(selectedContent as string);
    default:
      return sendSuccessResponse(res, selectedContent);
  }
}