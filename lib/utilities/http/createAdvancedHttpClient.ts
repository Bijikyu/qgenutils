/**
 * Advanced HTTP Client using Axios
 * 
 * Provides enhanced HTTP client capabilities for complex operations including
 * request/response interceptors, automatic retries, timeout management,
 * and comprehensive error handling using the battle-tested axios library.
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
const localVars: any = require('../../../config/localVars');

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

  // Create axios instance with default configuration
  const httpClient = axios.create({
    timeout,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'qgenutils-http-client/1.0.0',
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
        console.debug(`HTTP Request: ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`, {
          headers: requestConfig.headers,
          data: requestConfig.data
        });
      }
      
      return requestConfig;
    },
    (error: any): any => {
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
          return Promise.reject(error);
        }
        
        originalRequest._retry = true;
        
        if (onRetry) {
          onRetry(originalRequest._retryCount, error);
        }
        
        // Exponential backoff with jitter and minimum delay
        const baseDelay: any = retryDelay * Math.pow(2, originalRequest._retryCount);
        const jitter: any = Math.random() * 1000; // Always positive (0-1000)
        const delay: any = Math.max(baseDelay + jitter, 100); // Minimum 100ms delay
        originalRequest._retryCount += 1;
        
        await sleep(delay);
        
        return httpClient(originalRequest);
      }
      
      // Enhance error information
      error.isNetworkError = isNetworkError(error);
      error.isTimeoutError = error.code === 'ECONNABORTED';
      error.isServerError = error.response?.status >= 500;
      error.isClientError = error.response?.status >= 400 && error.response?.status < 500;
      
      return Promise.reject(error);
    }
  );

  // Add convenience methods
  httpClient.getWithRetry = (url: any, config: any = {}): any => {
    return httpClient.get(url, { ...config, _retry: false, _retryCount: 0 });
  };

  httpClient.postWithRetry = (url: any, data: any, config: any = {}): any => {
    return httpClient.post(url, data, { ...config, _retry: false, _retryCount: 0 });
  };

  httpClient.putWithRetry = (url: any, data: any, config: any = {}): any => {
    return httpClient.put(url, data, { ...config, _retry: false, _retryCount: 0 });
  };

  httpClient.deleteWithRetry = (url: any, config: any = {}): any => {
    return httpClient.delete(url, { ...config, _retry: false, _retryCount: 0 });
  };

  // Health check method
  httpClient.healthCheck = async (url: any, config: any = {}): Promise<any> => {
    try {
      const response: any = await httpClient.head(url || '/', { ...config, timeout: 5000 });
      return { healthy: true, status: response.status, response };
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  };

  return httpClient;
}

// Helper function to generate request IDs
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// Helper function to determine if request should be retried
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

// Helper function to identify network errors
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