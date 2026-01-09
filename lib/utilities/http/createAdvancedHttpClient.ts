import { qerrors } from 'qerrors';

/**
 * Advanced HTTP Client using Axios
 *
 * Provides enhanced HTTP client capabilities for complex operations including
 * request/response interceptors, automatic retries, timeout management,
 * and comprehensive error handling using to battle-tested axios library.
 *
 * This is intended for complex HTTP operations. For simple requests,
 * consider using Node.js built-in fetch API or existing HTTP utilities.
 *
 * @param {object} [config] - Axios configuration options
 * @param {number} [config.timeout=10000] - Request timeout in milliseconds
 * @param {number} [config.maxRetries=3] - Maximum number of retry attempts
 * @param {number} [config.retryDelay=1000] - Base delay between retries in ms
 * @param {boolean} [config.validateStatus=true] - Validate response status codes
 * @param {object} [config.headers] - Default headers for all requests
 * @param {Function} [config.onRetry] - Callback when retry occurs
 * @param {Function} [config.onTimeout] - Callback when timeout occurs
 * @returns {object} Enhanced axios instance with additional methods
 */
import axios from 'axios';
import { setTimeout as sleep } from 'timers/promises';
import { setSecurityHeaders } from '../security/index.js';
import * as localVars from '../../../config/localVars.js';
import { randomUUID } from 'crypto';

interface ExtendedAxiosInstance {
  getWithRetry(url: any, config?: any): any;
  postWithRetry(url: any, data?: any, config?: any): any;
  putWithRetry(url: any, data?: any, config?: any): any;
  deleteWithRetry(url: any, config?: any): any;
  healthCheck(config?: any): any;
}

interface Config {
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  validateStatus?: (status: number) => boolean;
  headers?: Record<string, string>;
  onRetry?: (attempt: number, error: any) => void;
  onTimeout?: (error: any) => void;
}

function createAdvancedHttpClient(config: Config = {}) {
  const {
    timeout = 10000,
    maxRetries = 3,
    retryDelay = 1000,
    validateStatus = (status) => status >= 200 && status < 300,
    headers = {},
    onRetry = null,
    onTimeout = null
  } = config;

  // Create axios instance with default configuration and security headers
  const httpClient = axios.create({
    timeout,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'qgenutils-http-client/1.0.0',
      ...setSecurityHeaders(),
      ...headers
    }
  });

  // Request interceptor for logging and preparation
  httpClient.interceptors.request.use(
    (requestConfig: any): any => {
      // Add request ID for tracing
      requestConfig.headers['X-Request-ID'] = generateRequestId();

      // Log request details (if logger is available)
      if (localVars.NODE_ENV !== 'production') {
        // Use proper logger in production - this is for debugging only
        if (process.env?.NODE_ENV !== 'production') {
          console.debug(`HTTP Request: ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`, {
            headers: requestConfig.headers,
            data: requestConfig.data
          });
        }
      }

      return requestConfig;
    },
    (error: any): any => {
      qerrors(error instanceof Error ? error : new Error(String(error)), 'createAdvancedHttpClient', 'HTTP request interceptor error');
      console.error('HTTP Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling and retries
  httpClient.interceptors.response.use(
    (response: any): any => {
      // Log successful response (if logger is available)
      if (localVars.NODE_ENV !== 'production') {
        console.debug(`HTTP Response: ${response.status} ${response.config.url}`, {
          status: response.status,
          headers: response.headers,
          data: response.data
        });
      }

      return response;
    },
    async (error: any): Promise<any> => {
      try {
        const originalRequest: any = error.config;

        // Handle timeout errors
        if (error.code === 'ECONNABORTED' && onTimeout) {
          onTimeout(error);
        }

        // Implement retry logic for specific errors
        if (shouldRetry(error) && !originalRequest._retry && maxRetries > 0) {
          // Initialize retry count if not set
          if (!originalRequest._retryCount) {
            originalRequest._retryCount = 0;
          }

          // Check if we've exceeded max retries before retrying
          if (originalRequest._retryCount >= maxRetries) {
            qerrors(error instanceof Error ? error : new Error(String(error)), 'createAdvancedHttpClient', `HTTP request max retries exceeded for: ${originalRequest.url}`);
            return Promise.reject(error);
          }

          originalRequest._retry = true;

          if (onRetry) {
            onRetry(originalRequest._retryCount, error);
          }

          // Exponential backoff with jitter and minimum delay
          originalRequest._retryCount += 1;
          const baseDelay: any = retryDelay * Math.pow(2, originalRequest._retryCount);
          const jitter: any = Math.random() * 1000; // Always positive (0-1000)
          const delay: any = Math.max(baseDelay + jitter, 100); // Minimum 100ms delay

          await sleep(delay);

          return httpClient(originalRequest);
        }

        // Enhance error information
        error.isNetworkError = isNetworkError(error);
        error.isTimeoutError = error.code === 'ECONNABORTED';
        error.isServerError = error.response?.status >= 500;
        error.isClientError = error.response?.status >= 400 && error.response?.status < 500;

        qerrors(error instanceof Error ? error : new Error(String(error)), 'createAdvancedHttpClient', `HTTP response error for: ${originalRequest.url}`);

        return Promise.reject(error);
      } catch (handlerError) {
        qerrors(handlerError instanceof Error ? handlerError : new Error(String(handlerError)), 'createAdvancedHttpClient', 'HTTP response interceptor error');
        return Promise.reject(error);
      }
    }
  );

  // Add convenience methods
  const extendedClient = httpClient as unknown as ExtendedAxiosInstance;
  extendedClient.getWithRetry = (url: any, config: any = {}): any => {
    return httpClient.get(url, { ...config, _retry: false, _retryCount: 0 });
  };

  extendedClient.postWithRetry = (url: any, data: any, config: any = {}): any => {
    return httpClient.post(url, data, { ...config, _retry: false, _retryCount: 0 });
  };

  extendedClient.putWithRetry = (url: any, data: any, config: any = {}): any => {
    return httpClient.put(url, data, { ...config, _retry: false, _retryCount: 0 });
  };

  extendedClient.deleteWithRetry = (url: any, config: any = {}): any => {
    return httpClient.delete(url, { ...config, _retry: false, _retryCount: 0 });
  };

  // Health check method
  extendedClient.healthCheck = async (url: any, config: any = {}): Promise<any> => {
    try {
      const response: any = await httpClient.head(url || '/', { ...config, timeout: 5000 });
      return { healthy: true, status: response.status, response };
    } catch (error) {
      qerrors(error instanceof Error ? error : new Error(String(error)), 'healthCheck', `HTTP health check failed for: ${url || '/'}`);
      return { healthy: false, error: error.message };
    }
  };

  return extendedClient;
}

/**
 * Generate cryptographically secure request IDs for tracing
 *
 * This function creates unique request identifiers that combine timestamp
 * with UUID fragments to ensure both uniqueness and chronological ordering.
 * The IDs are suitable for distributed tracing and request correlation.
 *
 * ID Format: `req_{timestamp}_{uuid_fragment}`
 * - `req_`: Prefix identifying HTTP requests
 * - `{timestamp}`: Unix timestamp for chronological ordering
 * - `{uuid_fragment}`: 16-character UUID fragment for uniqueness
 *
 * @returns {string} Unique request identifier
 *
 * @example
 * // Generated ID: req_1703123456789_a1b2c3d4e5f6g7h8
 * const requestId = generateRequestId();
 * console.log(requestId); // req_1703123456789_a1b2c3d4e5f6g7h8
 *
 * @security Uses cryptographically secure random UUID generation
 * @performance Generates IDs in ~0.1ms, suitable for high-throughput scenarios
 */
function generateRequestId() {
  const timestamp = Date.now();
  const uuid = randomUUID().replace(/-/g, '').substring(0, 16); // Remove hyphens and truncate for shorter IDs
  return `req_${timestamp}_${uuid}`;
}

/**
 * Determine if an HTTP request should be retried based on error type
 *
 * This function implements intelligent retry logic by analyzing error
 * characteristics and determining if the request is likely to succeed
 * on retry. It follows HTTP best practices for retryable conditions.
 *
 * ## Retry Logic Algorithm
 *
 * 1. **Network Errors**: Retry on connection issues (no response received)
 * 2. **Server Errors**: Retry on 5xx status codes (temporary server issues)
 * 3. **Specific Client Errors**: Retry on recoverable 4xx status codes
 * 4. **Non-Retryable Errors**: Don't retry on permanent client errors (4xx except specific cases)
 *
 * ## Retryable Status Codes
 *
 * - **5xx Server Errors**: Internal server issues, temporary failures
 * - **429 Too Many Requests**: Rate limiting, retry after delay
 * - **408 Request Timeout**: Server took too long, may succeed on retry
 * - **409 Conflict**: Resource conflicts, may resolve on retry
 *
 * ## Non-Retryable Status Codes
 *
 * - **4xx Client Errors** (except above): Permanent issues, retry won't help
 * - **3xx Redirection**: Should be handled by HTTP client, not retried
 * - **1xx Informational**: Should not occur in normal flow
 *
 * @param {any} error - Axios error object or network error
 * @returns {boolean} True if request should be retried
 *
 * @example
 * // Network error - should retry
 * const networkError = { code: 'ECONNRESET' };
 * console.log(shouldRetry(networkError)); // true
 *
 * // Server error - should retry
 * const serverError = { response: { status: 500 } };
 * console.log(shouldRetry(serverError)); // true
 *
 * // Client error - should not retry
 * const clientError = { response: { status: 400 } };
 * console.log(shouldRetry(clientError)); // false
 *
 * // Rate limit - should retry
 * const rateLimitError = { response: { status: 429 } };
 * console.log(shouldRetry(rateLimitError)); // true
 */
function shouldRetry(error) {
  if (!error.response) {
    // Network errors or no response
    return isNetworkError(error);
  }

  const status: any = error.response.status;

  // Retry on server errors (5xx) and specific client errors
  return (
    status >= 500 || // Server errors
    status === 429 || // Rate limit exceeded
    status === 408 || // Request timeout
    status === 409    // Conflict
  );
}

/**
 * Identify network-level connection errors
 *
 * This function detects low-level network connectivity issues that
 * are typically transient and may resolve on retry. These errors
 * occur at the TCP/IP layer rather than the HTTP layer.
 *
 * ## Network Error Types
 *
 * ### Connection Errors
 * - **ECONNRESET**: Connection reset by peer (server closed connection)
 * - **ECONNREFUSED**: Connection actively refused (server not listening)
 *
 * ### Timeout Errors
 * - **ETIMEDOUT**: Connection timeout (no response within time limit)
 * - **EAI_AGAIN**: DNS lookup timeout (temporary DNS resolution failure)
 *
 * ### Resolution Errors
 * - **ENOTFOUND**: Hostname not found (DNS resolution failed)
 *
 * ## Error Classification Logic
 *
 * Network errors are characterized by:
 * 1. **No HTTP Response**: Error occurs before HTTP response is received
 * 2. **System-Level Codes**: Error codes from operating system/network stack
 * 3. **Transient Nature**: Errors that may resolve with retry
 * 4. **Infrastructure Issues**: Problems with network connectivity or DNS
 *
 * @param {any} error - Error object from HTTP request
 * @returns {boolean} True if error is a network-level error
 *
 * @example
 * // Connection reset by server
 * const resetError = { code: 'ECONNRESET' };
 * console.log(isNetworkError(resetError)); // true
 *
 * // Server not available
 * const refusedError = { code: 'ECONNREFUSED' };
 * console.log(isNetworkError(refusedError)); // true
 *
 * // DNS resolution failed
 * const dnsError = { code: 'ENOTFOUND' };
 * console.log(isNetworkError(dnsError)); // true
 *
 * // HTTP error (not network)
 * const httpError = { response: { status: 404 } };
 * console.log(isNetworkError(httpError)); // false
 *
 * @note These error codes are specific to Node.js HTTP client
 * @see https://nodejs.org/api/errors.html#errors_common_system_errors
 */
function isNetworkError(error) {
  return (
    error.code === 'ECONNRESET' ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ETIMEDOUT' ||
    error.code === 'ENOTFOUND' ||
    error.code === 'EAI_AGAIN'
  );
}

// Export factory function and utility helpers
export default {
  createAdvancedHttpClient,
  generateRequestId,
  shouldRetry,
  isNetworkError
};
