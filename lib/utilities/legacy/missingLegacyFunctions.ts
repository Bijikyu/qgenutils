/**
 * Implement Missing Legacy Functions for Full Compatibility
 * Creates implementations for functions referenced in tests but not yet implemented
 */

import { qerrors } from 'qerrors';
import logger from '../../logger.js';

/**
 * Validate that required fields are present in data object
 * @param {Array} fields - Array of field names that must be present
 * @param {Object} data - Object to validate
 * @returns {Boolean} True if all required fields are present and not empty
 * @throws Never throws - returns false on validation failure
 */
function requireFields(fields: string[], data: any): boolean {
  logger.debug(`requireFields validation: ${fields.join(', ')}`, data);
  
  try {
    if (!Array.isArray(fields) || fields.length === 0) {
      logger.warn('requireFields: fields array is empty or invalid');
      return false;
    }
    
    if (!data || typeof data !== 'object') {
      logger.warn('requireFields: data object is invalid');
      return false;
    }
    
    const missingFields = fields.filter(field => {
      const value = data[field];
      return value === undefined || value === null || value === '';
    });
    
    if (missingFields.length > 0) {
      logger.warn(`requireFields: missing required fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    logger.debug('requireFields: all required fields present');
    return true;
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'requireFields');
    return false;
  }
}

/**
 * Check if request has Passport authentication
 * @param {Object} req - Express request object
 * @returns {Boolean} True if user is authenticated via Passport
 * @throws Never throws - returns false on errors
 */
function checkPassportAuth(req: any): boolean {
  logger.debug('checkPassportAuth: checking authentication status');
  
  try {
    // Check if user is authenticated via Passport
    if (!req || !req.isAuthenticated) {
      logger.warn('checkPassportAuth: request object is invalid or missing isAuthenticated');
      return false;
    }
    
    // Use Passport's isAuthenticated method if available
    if (typeof req.isAuthenticated === 'function') {
      const isAuth = req.isAuthenticated();
      logger.debug(`checkPassportAuth: authenticated status: ${isAuth}`);
      return isAuth;
    }
    
    // Fallback to checking for user property
    const hasUser = req.user !== undefined && req.user !== null;
    logger.debug(`checkPassportAuth: fallback authentication check: ${hasUser}`);
    return hasUser;
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'checkPassportAuth');
    return false;
  }
}

/**
 * Check if Passport has GitHub strategy configured
 * @returns {Boolean} True if GitHub strategy is available
 * @throws Never throws - returns false on errors
 */
function hasGithubStrategy(): boolean {
  logger.debug('hasGithubStrategy: checking for GitHub strategy');
  
  try {
    // This would typically check Passport configuration
    // For now, we'll implement a basic check that could be enhanced
    logger.warn('hasGithubStrategy: stub implementation - needs actual Passport configuration access');
    
    // Fallback: assume GitHub strategy exists if in environment
    const hasGithubInEnv = process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET;
    
    logger.debug(`hasGithubStrategy: GitHub strategy detected: ${!!hasGithubInEnv}`);
    return !!hasGithubInEnv;
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'hasGithubStrategy');
    return false;
  }
}

/**
 * Calculate content length for HTTP responses
 * @param {String|Buffer|Object} data - Data to calculate length for
 * @returns {Number} Content length in bytes
 * @throws Never throws - returns 0 on errors
 */
function calculateContentLength(data: any): number {
  logger.debug('calculateContentLength: calculating content length');
  
  try {
    if (data === null || data === undefined) {
      return 0;
    }
    
    if (typeof data === 'string') {
      // Use byte length instead of string length for UTF-8
      const length = Buffer.byteLength(data, 'utf8');
      logger.debug(`calculateContentLength: string length: ${length} bytes`);
      return length;
    }
    
    if (Buffer.isBuffer(data)) {
      const length = data.length;
      logger.debug(`calculateContentLength: buffer length: ${length} bytes`);
      return length;
    }
    
    if (typeof data === 'object') {
      // Convert object to JSON and calculate bytes
      const jsonString = JSON.stringify(data);
      const length = Buffer.byteLength(jsonString, 'utf8');
      logger.debug(`calculateContentLength: object JSON length: ${length} bytes`);
      return length;
    }
    
    logger.warn('calculateContentLength: unsupported data type, using fallback');
    return 0;
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'calculateContentLength');
    return 0;
  }
}

/**
 * Get required header from request headers
 * @param {String} name - Header name to retrieve
 * @param {Object} headers - Headers object from request
 * @returns {String|null} Header value or null if not found
 * @throws Never throws - returns null on errors
 */
function getRequiredHeader(name: string, headers: any): string | null {
  logger.debug(`getRequiredHeader: retrieving header: ${name}`);
  
  try {
    if (!name || typeof name !== 'string') {
      logger.warn('getRequiredHeader: invalid header name');
      return null;
    }
    
    if (!headers || typeof headers !== 'object') {
      logger.warn('getRequiredHeader: invalid headers object');
      return null;
    }
    
    // Headers are typically case-insensitive
    const headerName = name.toLowerCase();
    
    // Search through headers object
    for (const key in headers) {
      if (key.toLowerCase() === headerName) {
        const value = headers[key];
        logger.debug(`getRequiredHeader: found header ${name}: ${value}`);
        return value;
      }
    }
    
    logger.warn(`getRequiredHeader: header ${name} not found`);
    return null;
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'getRequiredHeader');
    return null;
  }
}

/**
 * Send JSON response with proper headers
 * @param {Object} res - Express response object
 * @param {Any} data - Data to send as JSON
 * @param {Number} [statusCode=200] - HTTP status code
 * @throws Never throws - logs errors but doesn't throw
 */
function sendJsonResponse(res: any, data: any, statusCode: number = 200): void {
  logger.debug(`sendJsonResponse: sending JSON response with status ${statusCode}`);
  
  try {
    if (!res || !res.status || !res.json) {
      logger.error('sendJsonResponse: invalid response object');
      return;
    }
    
    // Set content-type header
    if (res.setHeader && typeof res.setHeader === 'function') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Length', calculateContentLength(data));
    }
    
    // Set status and send response
    res.status(statusCode);
    res.json(data);
    
    logger.debug('sendJsonResponse: JSON response sent successfully');
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'sendJsonResponse');
    logger.error('sendJsonResponse: failed to send JSON response');
  }
}

/**
 * Build clean headers object by removing sensitive information
 * @param {Object} headers - Original headers object
 * @returns {Object} Cleaned headers object
 * @throws Never throws - returns original headers on errors
 */
function buildCleanHeaders(headers: any): any {
  logger.debug('buildCleanHeaders: cleaning headers object');
  
  try {
    if (!headers || typeof headers !== 'object') {
      logger.warn('buildCleanHeaders: invalid headers object');
      return headers || {};
    }
    
    const cleanHeaders: any = {};
    
    // Headers that should be removed for security/privacy
    const sensitiveHeaders = [
      'authorization',
      'cookie', 
      'set-cookie',
      'x-api-key',
      'x-auth-token',
      'password',
      'secret'
    ];
    
    for (const key in headers) {
      const lowerKey = key.toLowerCase();
      
      // Skip sensitive headers
      if (sensitiveHeaders.some(sensitive => lowerKey.includes(sensitive))) {
        logger.debug(`buildCleanHeaders: removing sensitive header: ${key}`);
        continue;
      }
      
      // Clean and normalize the header value
      let value = headers[key];
      
      if (typeof value === 'string') {
        // Trim whitespace and normalize line endings
        value = value.trim().replace(/\r?\n/g, '');
      }
      
      cleanHeaders[key] = value;
    }
    
    logger.debug(`buildCleanHeaders: cleaned ${Object.keys(cleanHeaders).length} headers`);
    return cleanHeaders;
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'buildCleanHeaders');
    return headers || {};
  }
}

/**
 * Simple template rendering stub (would integrate with EJS in production)
 * @param {String} template - Template name or content
 * @param {Object} data - Data to render in template
 * @returns {String} Rendered template or fallback string
 * @throws Never throws - returns error string on failures
 */
function renderView(template: string, data: any): string {
  logger.debug(`renderView: rendering template: ${template}`);
  
  try {
    if (!template || typeof template !== 'string') {
      logger.warn('renderView: invalid template parameter');
      return '[TEMPLATE ERROR: Invalid template]';
    }
    
    if (!data || typeof data !== 'object') {
      logger.warn('renderView: invalid data parameter');
      return '[TEMPLATE ERROR: Invalid data]';
    }
    
    // This is a stub implementation - in production would use EJS or similar
    logger.warn('renderView: stub implementation - integrate with actual templating engine');
    
    // Simple string replacement for basic templates
    let result = template;
    for (const key in data) {
      const value = data[key];
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    }
    
    return result;
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'renderView');
    return `[TEMPLATE ERROR: ${error instanceof Error ? error.message : String(error)}]`;
  }
}

/**
 * Register view route with Express app (stub implementation)
 * @param {Object} app - Express application instance
 * @param {String} route - Route path
 * @param {String} template - Template name for the route
 * @throws Never throws - logs errors but doesn't throw
 */
function registerViewRoute(app: any, route: string, template: string): void {
  logger.debug(`registerViewRoute: registering route ${route} with template ${template}`);
  
  try {
    if (!app || typeof app !== 'function') {
      logger.error('registerViewRoute: invalid Express app instance');
      return;
    }
    
    if (!route || typeof route !== 'string') {
      logger.error('registerViewRoute: invalid route parameter');
      return;
    }
    
    if (!template || typeof template !== 'string') {
      logger.error('registerViewRoute: invalid template parameter');
      return;
    }
    
    // This is a stub implementation - would set up proper route in production
    logger.warn('registerViewRoute: stub implementation - integrate with actual Express router');
    
    if (app.get && typeof app.get === 'function') {
      app.get(route, (req, res) => {
        const renderedContent = renderView(template, {
          ...req.query,
          ...req.params,
          req
        });
        
        if (res.send && typeof res.send === 'function') {
          res.send(renderedContent);
        }
      });
      
      logger.debug(`registerViewRoute: route ${route} registered successfully`);
    }
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'registerViewRoute');
    logger.error('registerViewRoute: failed to register route');
  }
}

export {
  requireFields,
  checkPassportAuth,
  hasGithubStrategy,
  calculateContentLength,
  getRequiredHeader,
  sendJsonResponse,
  buildCleanHeaders,
  renderView,
  registerViewRoute
};

export default {
  requireFields,
  checkPassportAuth,
  hasGithubStrategy,
  calculateContentLength,
  getRequiredHeader,
  sendJsonResponse,
  buildCleanHeaders,
  renderView,
  registerViewRoute
};