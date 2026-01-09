/**
 * Common API Client Utilities
 *
 * Centralized API client utilities to eliminate code duplication across
 * codebase. These utilities handle common API patterns including
 * HTTP client creation, request/response interceptors, and error handling.
 */

import { handleError } from '../error/commonErrorHandling.js';
import { validateType, validateAndTrimString } from '../validation/commonValidation.js';
import { withRetry } from '../error/commonErrorHandling.js';

/**
 * HTTP client configuration
 */
interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  auth?: {
    username?: string;
    password?: string;
    bearer?: string;
  };
  interceptors?: {
    request?: Array<(config: any) => any>;
    response?: Array<(response: any) => any>;
    error?: Array<(error: any) => any>;
  };
  validateStatus?: (status: number) => boolean;
}

/**
 * API request options
 */
interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url?: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  signal?: AbortSignal;
}

/**
 * API response interface
 */
interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: any;
  request?: any;
}

/**
 * Creates a configurable HTTP client with interceptors and retry logic
 * @param config - Client configuration
 * @returns HTTP client object
 */
export function createHttpClient(config: HttpClientConfig = {}) {
  const {
    baseURL = '',
    timeout = 30000,
    retries = 3,
    retryDelay = 1000,
    headers = {},
    auth,
    interceptors = {},
    validateStatus = (status) => status >= 200 && status < 300
  } = config;

  // Base configuration
  const baseConfig = {
    baseURL,
    timeout,
    headers: { ...headers },
    validateStatus
  };

  // Add authentication if provided
  if (auth) {
    if (auth.bearer) {
      baseConfig.headers.Authorization = `Bearer ${auth.bearer}`;
    } else if (auth.username && auth.password) {
      const credentials = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
      baseConfig.headers.Authorization = `Basic ${credentials}`;
    }
  }

  // Request interceptor chain
  const applyRequestInterceptors = (requestConfig: any): any => {
    let config = { ...requestConfig };

    for (const interceptor of interceptors.request || []) {
      config = interceptor(config) || config;
    }

    return config;
  };

  // Response interceptor chain
  const applyResponseInterceptors = (response: any): any => {
    let result = response;

    for (const interceptor of interceptors.response || []) {
      result = interceptor(result) || result;
    }

    return result;
  };

  // Error interceptor chain
  const applyErrorInterceptors = (error: any): any => {
    let result = error;

    for (const interceptor of interceptors.error || []) {
      result = interceptor(result) || result;
    }

    return result;
  };

  // Core request function
  const request = async (options: ApiRequestOptions = {}): Promise<ApiResponse> => {
    const {
      method = 'GET',
      url = '',
      data,
      params,
      headers: requestHeaders = {},
      timeout: requestTimeout,
      retries: requestRetries,
      signal
    } = options;

    // Merge with base configuration
    const requestConfig = applyRequestInterceptors({
      ...baseConfig,
      method,
      url: url.startsWith('http') ? url : `${baseURL}${url}`,
      data,
      params,
      headers: { ...baseConfig.headers, ...requestHeaders },
      timeout: requestTimeout || baseConfig.timeout,
      signal
    });

    // Create URL with query parameters
    let finalUrl = requestConfig.url;
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      finalUrl = `${finalUrl}${finalUrl.includes('?') ? '&' : '?'}${queryString}`;
    }

    // Execute request with retry logic
    const executeRequest = withRetry(
      async (): Promise<ApiResponse> => {
        try {
          // Create AbortController if not provided
          const controller = new AbortController();
          const finalSignal = signal || controller.signal;

          // Fetch request
          const response = await fetch(finalUrl, {
            method: requestConfig.method,
            headers: requestConfig.headers,
            body: data ? JSON.stringify(data) : undefined,
            signal: finalSignal
          });

          // Parse response
          const responseData = await getResponseData(response);
          const responseHeaders = getResponseHeaders(response);

          const apiResponse: ApiResponse = {
            data: responseData,
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
            config: requestConfig
          };

          // Check status validation
          if (!validateStatus(response.status)) {
            throw createApiError(response.status, response.statusText, apiResponse);
          }

          // Apply response interceptors
          return applyResponseInterceptors(apiResponse);
        } catch (error) {
          // Apply error interceptors
          throw applyErrorInterceptors(error);
        }
      },
      requestRetries || retries,
      retryDelay,
      'createHttpClient'
    );

    return executeRequest();
  };

  // Convenience methods
  return {
    request,
    get: (url: string, options: Omit<ApiRequestOptions, 'method' | 'url'> = {}) =>
      request({ ...options, method: 'GET', url }),

    post: (url: string, data?: any, options: Omit<ApiRequestOptions, 'method' | 'url' | 'data'> = {}) =>
      request({ ...options, method: 'POST', url, data }),

    put: (url: string, data?: any, options: Omit<ApiRequestOptions, 'method' | 'url' | 'data'> = {}) =>
      request({ ...options, method: 'PUT', url, data }),

    delete: (url: string, options: Omit<ApiRequestOptions, 'method' | 'url'> = {}) =>
      request({ ...options, method: 'DELETE', url }),

    patch: (url: string, data?: any, options: Omit<ApiRequestOptions, 'method' | 'url' | 'data'> = {}) =>
      request({ ...options, method: 'PATCH', url, data })
  };
}

/**
 * Gets response data based on content type
 * @param response - Fetch response object
 * @returns Parsed response data
 */
async function getResponseData(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  } else if (contentType.includes('text/')) {
    return response.text();
  } else if (contentType.includes('application/octet-stream') || contentType.includes('application/zip')) {
    return response.arrayBuffer();
  } else {
    return response.text();
  }
}

/**
 * Gets response headers as plain object
 * @param response - Fetch response object
 * @returns Response headers object
 */
function getResponseHeaders(response: Response): Record<string, string> {
  const headers: Record<string, string> = {};

  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return headers;
}

/**
 * Creates API error with standard format
 * @param status - HTTP status code
 * @param message - Error message
 * @param response - API response
 * @returns API error object
 */
function createApiError(status: number, message: string, response: ApiResponse): Error {
  const error = new Error(message) as any;
  error.status = status;
  error.response = response;
  error.isApiError = true;
  return error;
}

/**
 * Creates an API client with default error handling
 * @param config - Client configuration
 * @returns Enhanced API client
 */
export function createApiClient(config: HttpClientConfig = {}) {
  const client = createHttpClient(config);

  // Wrap all methods with consistent error handling
  const wrapMethod = (method: Function): Function => {
    return async (...args: any[]): Promise<any> => {
      try {
        const response = await method(...args);
        return response.data;
      } catch (error) {
        handleError(error, 'createApiClient', 'API request failed');
        throw error;
      }
    };
  };

  return {
    get: wrapMethod(client.get),
    post: wrapMethod(client.post),
    put: wrapMethod(client.put),
    delete: wrapMethod(client.delete),
    patch: wrapMethod(client.patch),
    request: wrapMethod(client.request),

    // Raw access if needed
    raw: client
  };
}

/**
 * Creates a batch request utility
 * @param client - HTTP client
 * @param options - Batch options
 * @returns Batch request function
 */
export function createBatchClient(
  client: ReturnType<typeof createHttpClient>,
  options: {
    maxConcurrent?: number;
    delayBetweenBatches?: number;
  } = {}
) {
  const {
    maxConcurrent = 10,
    delayBetweenBatches = 100
  } = options;

  return {
    /**
     * Executes multiple requests concurrently
     */
    async batch<T>(requests: Array<() => Promise<T>>): Promise<T[]> {
      const results: T[] = [];

      // Process in batches
      for (let i = 0; i < requests.length; i += maxConcurrent) {
        const batch = requests.slice(i, i + maxConcurrent);
        const batchResults = await Promise.allSettled(batch);

        // Extract successful results
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push((result as any).value);
          } else {
            handleError((result as any).reason, 'batchClient', `Batch request ${index} failed`);
          }
        });

        // Add delay between batches
        if (i + maxConcurrent < requests.length) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
      }

      return results;
    },

    /**
     * Executes requests with fallback on failure
     */
    async batchWithFallback<T>(
      requests: Array<{ request: () => Promise<T>; fallback?: () => Promise<T> }>
    ): Promise<T[]> {
      const results: T[] = [];

      for (let i = 0; i < requests.length; i += maxConcurrent) {
        const batch = requests.slice(i, i + maxConcurrent);
        const batchPromises = batch.map(async ({ request, fallback }, index) => {
          try {
            return await request();
          } catch (error) {
            if (fallback) {
              handleError(error, 'batchClient', `Request failed, using fallback for item ${i + index}`);
              return await fallback();
            }
            throw error;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        if (i + maxConcurrent < requests.length) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
      }

      return results;
    }
  };
}

/**
 * Creates a cached API client
 * @param client - Base API client
 * @param options - Cache options
 * @returns Cached API client
 */
export function createCachedClient(
  client: ReturnType<typeof createApiClient>,
  options: {
    ttl?: number; // Time to live in milliseconds
    maxSize?: number;
    keyGenerator?: (url: string, options: any) => string;
  } = {}
) {
  const {
    ttl = 300000, // 5 minutes
    maxSize = 100,
    keyGenerator = (url, options) => `${url}:${JSON.stringify(options)}`
  } = options;

  const cache = new Map<string, { data: any; timestamp: number }>();

  const cleanCache = (): void => {
    const cutoff = Date.now() - ttl;

    for (const [key, entry] of cache.entries()) {
      if (entry.timestamp < cutoff) {
        cache.delete(key);
      }
    }

    // Limit cache size
    if (cache.size > maxSize) {
      const entries = Array.from(cache.entries());
      const oldest = entries
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, cache.size - maxSize);

      oldest.forEach(([key]) => cache.delete(key));
    }
  };

  // Periodic cleanup
  setInterval(cleanCache, Math.min(ttl / 4, 60000)); // At least every minute

  return {
    /**
     * Cached GET request
     */
    async get<T>(url: string, options: any = {}): Promise<T> {
      const key = keyGenerator(url, options);

      // Check cache
      const cached = cache.get(key);
      if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.data;
      }

      // Make request
      const data = await client.get(url, options);

      // Cache result
      cache.set(key, { data, timestamp: Date.now() });
      cleanCache();

      return data;
    },

    /**
     * Invalidates cache entry
     */
    invalidate(url: string, options: any = {}): void {
      const key = keyGenerator(url, options);
      cache.delete(key);
    },

    /**
     * Clears all cache
     */
    clear(): void {
      cache.clear();
    },

    /**
     * Gets cache statistics
     */
    getStats(): { size: number; entries: Array<{ key: string; age: number }> } {
      const now = Date.now();
      const entries = Array.from(cache.entries()).map(([key, entry]) => ({
        key,
        age: now - entry.timestamp
      }));

      return {
        size: cache.size,
        entries
      };
    },

    // Pass through methods
    post: client.post,
    put: client.put,
    delete: client.delete,
    patch: client.patch
  };
}

/**
 * API client factory for common configurations
 */
export const ApiClientFactories = {
  /**
   * Creates a JSON API client
   */
  json: (baseURL: string, config: HttpClientConfig = {}) =>
    createApiClient({
      ...config,
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...config.headers
      }
    }),

  /**
   * Creates a form data API client
   */
  formData: (baseURL: string, config: HttpClientConfig = {}) =>
    createApiClient({
      ...config,
      baseURL,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...config.headers
      }
    }),

  /**
   * Creates an authenticated API client
   */
  authenticated: (baseURL: string, token: string, config: HttpClientConfig = {}) =>
    createApiClient({
      ...config,
      baseURL,
      auth: { bearer: token },
      headers: {
        'Authorization': `Bearer ${token}`,
        ...config.headers
      }
    }),

  /**
   * Creates a client with basic auth
   */
  basicAuth: (baseURL: string, username: string, password: string, config: HttpClientConfig = {}) =>
    createApiClient({
      ...config,
      baseURL,
      auth: { username, password },
      headers: {
        'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
        ...config.headers
      }
    })
};
