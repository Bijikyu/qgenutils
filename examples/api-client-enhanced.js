/**
 * Enhanced API Client for Demo Frontend
 * 
 * Provides robust error handling, retries, and consistent interface
 * for all API calls in the demo application.
 */

class APIClient {
  constructor(baseURL = '', options = {}) {
    this.baseURL = baseURL;
    this.defaultOptions = {
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      ...options
    };
  }

  /**
   * Enhanced fetch with error handling and retries
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const requestOptions = {
      ...this.defaultOptions,
      ...options,
      headers: {
        ...this.defaultOptions.headers,
        ...options.headers
      }
    };

    let lastError;
    
    for (let attempt = 1; attempt <= requestOptions.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), requestOptions.timeout);
        
        const response = await fetch(url, {
          ...requestOptions,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        // Handle HTTP errors
        if (!response.ok) {
          throw new APIError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            endpoint,
            response
          );
        }

        // Handle JSON parsing errors
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          throw new APIError(
            'Invalid JSON response from server',
            500,
            endpoint
          );
        }

        // Handle API error responses
        if (data.error) {
          throw new APIError(
            data.error,
            response.status,
            endpoint,
            null,
            data
          );
        }

        return data;
        
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain errors
        if (error.name === 'AbortError') {
          throw new APIError('Request timeout', 408, endpoint);
        }
        
        if (error.status >= 400 && error.status < 500) {
          // Client errors shouldn't be retried
          throw error;
        }
        
        if (attempt < requestOptions.retries) {
          await this.delay(requestOptions.retryDelay * attempt);
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Convenience method for POST requests
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    });
  }

  /**
   * Convenience method for GET requests
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'GET',
      ...options
    });
  }

  /**
   * Delay helper for retries
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate email with enhanced error handling
   */
  async validateEmail(email) {
    if (!email) {
      throw new ValidationError('Email is required');
    }

    if (typeof email !== 'string') {
      throw new ValidationError('Email must be a string');
    }

    try {
      const result = await this.post('/api/validate/email', { email });
      return {
        success: true,
        data: result.result,
        message: 'Email validation successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.status,
        message: this.formatErrorMessage(error, 'email validation')
      };
    }
  }

  /**
   * Validate password with enhanced error handling
   */
  async validatePassword(password) {
    if (!password) {
      throw new ValidationError('Password is required');
    }

    if (typeof password !== 'string') {
      throw new ValidationError('Password must be a string');
    }

    try {
      const result = await this.post('/api/validate/password', { password });
      return {
        success: true,
        data: result.result,
        message: 'Password validation successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.status,
        message: this.formatErrorMessage(error, 'password validation')
      };
    }
  }

  /**
   * Mask API key with enhanced error handling
   */
  async maskApiKey(apiKey) {
    if (!apiKey) {
      throw new ValidationError('API key is required');
    }

    if (typeof apiKey !== 'string') {
      throw new ValidationError('API key must be a string');
    }

    try {
      const result = await this.post('/api/security/mask-api-key', { apiKey });
      return {
        success: true,
        data: result.result,
        message: 'API key masked successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.status,
        message: this.formatErrorMessage(error, 'API key masking')
      };
    }
  }

  /**
   * Group array with enhanced error handling
   */
  async groupBy(array, key) {
    if (!Array.isArray(array)) {
      throw new ValidationError('Array is required');
    }

    if (!key || typeof key !== 'string') {
      throw new ValidationError('Group key is required and must be a string');
    }

    try {
      const result = await this.post('/api/collections/group-by', { array, key });
      return {
        success: true,
        data: result.result,
        message: 'Array grouping successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.status,
        message: this.formatErrorMessage(error, 'array grouping')
      };
    }
  }

  /**
   * Format error messages for user display
   */
  formatErrorMessage(error, operation) {
    if (error.code === 408) {
      return `${operation} timed out. Please check your connection and try again.`;
    }
    
    if (error.code === 404) {
      return `${operation} endpoint not found. The server may be unavailable.`;
    }
    
    if (error.code === 500) {
      return `${operation} failed due to server error. Please try again later.`;
    }
    
    if (error.code === 400) {
      return `${operation} failed due to invalid input: ${error.message}`;
    }
    
    return `${operation} failed: ${error.message}`;
  }

  /**
   * Batch multiple API calls
   */
  async batch(calls) {
    const results = await Promise.allSettled(calls);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return { index, success: true, data: result.value };
      } else {
        return { 
          index, 
          success: false, 
          error: result.reason.message,
          code: result.reason.status
        };
      }
    });
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await this.get('/health');
      return {
        healthy: true,
        data: response
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }
}

/**
 * Custom API Error class
 */
class APIError extends Error {
  constructor(message, status = 500, endpoint = '', response = null, data = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.endpoint = endpoint;
    this.response = response;
    this.data = data;
  }
}

/**
 * Validation Error class
 */
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }
}

// Export for global use
window.APIClient = APIClient;
window.APIError = APIError;
window.ValidationError = ValidationError;