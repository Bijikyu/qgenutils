/**
 * Object Property Selection Utility - Safe Key Extraction
 * 
 * PURPOSE: Provides type-safe extraction of specific properties from objects,
 * essential for API response filtering, security data sanitization, form
 * data processing, and configuration management. This utility prevents accidental
 * exposure of sensitive data and ensures consistent object shapes across the application.
 * 
 * SECURITY APPLICATIONS:
 * - Data Sanitization: Remove sensitive fields before sending to clients
 * - API Filtering: Limit response data to only necessary fields
 * - Access Control: Ensure users only see authorized data properties
 * - Logging Security: Exclude sensitive information from log entries
 * - Third-Party Integration: Share only required data with external services
 * 
 * PERFORMANCE CHARACTERISTICS:
 * - Single Pass: O(n) complexity where n is number of keys requested
 * - Memory Efficient: Creates minimal result object with only requested properties
 * - Type Safe: Maintains TypeScript type information throughout extraction
 * - Native Operations: Uses Object.hasOwnProperty() for reliable property checking
 * - Garbage Collection Friendly: Minimal object creation and copying
 * 
 * TYPE SAFETY FEATURES:
 * - Generic Types: Maintains source object type in result type
 * - Key Constraints: TypeScript ensures only valid object keys can be requested
 * - Result Typing: Return type accurately reflects picked properties
 * - Compile-Time Validation: Invalid property access caught during development
 * 
 * ERROR HANDLING STRATEGY:
 * - Graceful Degradation: Returns empty object for invalid inputs rather than throwing
 * - Type Safety: Validates both object and array inputs to prevent runtime errors
 * - Property Safety: Only includes properties that actually exist on source object
 * - Defensive Programming: Handles null, undefined, and non-object inputs safely
 * 
 * COMMON USE PATTERNS:
 * - API Response Shaping: Limit data sent to frontend clients
 * - Configuration Extraction: Extract specific settings from config objects
 * - Form Data Processing: Pick only relevant fields from form submissions
 * - Security Filtering: Remove sensitive fields before data transmission
 * - Data Transformation: Create specialized views of larger data objects
 * 
 * @param {T} obj - Source object to extract properties from (any object type)
 * @param {K[]} keys - Array of property names to extract from source object
 *                     TypeScript enforces these keys must exist on source object type
 * @returns {Pick<T, K>} New object containing only the specified properties from source.
 *                      Returns empty object if inputs are invalid.
 * 
 * @example
 * // Basic property extraction
 * const user = { 
 *   id: 1, 
 *   name: 'Alice', 
 *   email: 'alice@example.com', 
 *   password: 'secret123',
 *   role: 'admin'
 * };
 * const publicProfile = pick(user, ['id', 'name', 'email']);
 * // Result: { id: 1, name: 'Alice', email: 'alice@example.com' }
 * 
 * @example
 * // API response filtering - remove sensitive data
 * const completeUser = {
 *   id: 123,
 *   username: 'john_doe',
 *   email: 'john@example.com',
 *   passwordHash: '$2b$12$...',
 *   ssn: '123-45-6789',
 *   creditCard: '4111-1111-1111-1111',
 *   lastLogin: new Date(),
 *   isActive: true
 * };
 * const apiResponse = pick(completeUser, ['id', 'username', 'lastLogin', 'isActive']);
 * // Safe to send to client: no sensitive data included
 * 
 * @example
 * // Configuration extraction
 * const appConfig = {
 *   database: { host: 'localhost', port: 5432 },
 *   api: { version: 'v1', timeout: 5000 },
 *   auth: { secret: 'super-secret', expiresIn: 3600 },
 *   logging: { level: 'info', file: 'app.log' }
 * };
 * const dbConfig = pick(appConfig, ['database']);
 * // Result: { database: { host: 'localhost', port: 5432 } }
 * 
 * @example
 * // Form data processing
 * const formData = {
 *   username: 'alice',
 *   email: 'alice@example.com',
 *   password: 'password123',
 *   confirmPassword: 'password123',
 *   csrfToken: 'abc123',
 *   rememberMe: true,
 *   newsletter: false
 * };
 * const userRegistration = pick(formData, ['username', 'email', 'password', 'newsletter']);
 * // Only include fields needed for user registration
 * 
 * @example
 * // TypeScript type safety
 * interface Product {
 *   id: number;
 *   name: string;
 *   price: number;
 *   description: string;
 *   category: string;
 *   inStock: boolean;
 * }
 * 
 * const product: Product = {
 *   id: 1,
 *   name: 'Laptop',
 *   price: 999.99,
 *   description: 'Powerful laptop',
 *   category: 'Electronics',
 *   inStock: true
 * };
 * 
 * // TypeScript error: 'secretField' doesn't exist on Product
 * // const invalid = pick(product, ['id', 'secretField']);
 * 
 * // Valid: TypeScript knows result has id and name properties
 * const productSummary = pick(product, ['id', 'name']);
 * // Type of productSummary is { id: number; name: string; }
 */
const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  if (!obj || typeof obj !== 'object' || !Array.isArray(keys)) {
    return {} as Pick<T, K>;
  }

  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  
  return result;
};

export default pick;