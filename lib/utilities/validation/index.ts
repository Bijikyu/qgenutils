/**
 * Validation Utilities Module Export
 * 
 * PURPOSE: Provides centralized access to all validation utilities
 * with comprehensive input validation, security checks, and error handling.
 * This barrel export makes it easier to import multiple validation
 * utilities while maintaining tree-shaking support.
 * 
 * SECURITY-VALIDATION UTILITIES:
 * - validateEmailFormat: RFC 5322 compliant email validation
 * - validatePasswordStrength: OWASP-compliant password validation
 * - validateMonetaryAmount: Financial amount validation with precision
 * - validateApiKeyFormat: API key format validation
 * - validateCurrencyCode: ISO 4217 currency code validation
 * - sanitizeInput: XSS-safe input sanitization
 * - extractValidationErrors: Extract validation error details
 * - validateRequired: Required field validation
 * - validateArray: Array validation with type checking
 * - validateBoolean: Boolean validation with type safety
 * - validateDate: Date validation with range checking
 * - validateObjectId: MongoDB ObjectId validation
 * - validatePagination: Pagination parameter validation
 * - validatePattern: Regex pattern validation
 * - validateStringLength: String length validation
 * - validateEnum: Enum value validation
 * 
 * ZOD-BASED VALIDATION:
 * - zodStringValidators: String-specific Zod schemas
 * - zodNumberValidators: Number-specific Zod schemas
 * - zodValidationUtils: Common Zod validation utilities
 * - zodSchemaBuilders: Dynamic schema builders
 * 
 * VALIDATION BUILDERS:
 * - createValidator: Generic validator factory
 * - createResourceValidator: Resource-specific validation
 * - createFieldValidator: Individual field validation
 * - createValidationMiddleware: Express middleware builder
 * - createValidationErrorHandler: Error handling for validation
 * - createUnifiedValidator: Multi-type validator
 * - createApiKeyAuth: API key authentication validation
 * - createCredentialSchema: Credential schema builder
 * - createServiceMeta: Service metadata validation
 */

// Core validation utilities
import validateEmailFormat from './validateEmailSimple';
import validatePasswordStrength from './validatePassword';
import validateMonetaryAmount from './validateAmount';
import validateApiKeyFormat from './validateApiKey';
import validateCurrencyCode from './validateCurrency';
import sanitizeInput from './sanitizeInput';
import extractValidationErrors from './extractValidationErrors';

// Type validators
import validateRequired from './validateRequired';
import validateArray from './validateArray';
import validateBoolean from './validateBoolean';
import validateDate from './validateDate';
import validateObjectId from './validateObjectId';
import validatePagination from './validatePagination';
import validatePattern from './validatePattern';
import validateStringLength from './validateStringLength';
import validateEnum from './validateEnum';

// Specialized validators
import validatePaymentMethodNonce from './validatePaymentMethodNonce';
import validateDateRange from './validateDateRange';
import validateSubscriptionPlan from './validateSubscriptionPlan';
import validateNumberRange from './validateNumberRange';
import validateNumberInRange from './validateNumberInRange';
import validateNumberUnified from './validateNumberUnified';
import validateBooleanUnified from './validateBooleanUnified';
import validateBooleanField from './validateBooleanField';
import validateRequiredString from './validateRequiredString';

// Zod-based validation
import zodStringValidators from './zodStringValidators';
import zodNumberValidators from './zodNumberValidators';
import zodValidationUtils from './zodValidationUtils';
import zodSchemaBuilders from './zodSchemaBuilders';

// Validation builders
import createValidator from './createValidator';
import createResourceValidator from './createResourceValidator';
import createFieldValidator from './createFieldValidator';
import createValidationMiddleware from './createValidationMiddleware';
import createValidationErrorHandler from './createValidationErrorHandler';
import createUnifiedValidator from './createUnifiedValidator';
import createApiKeyAuth from './createApiKeyAuth';
import createCredentialSchema from './createCredentialSchema';
import createServiceMeta from './createServiceMeta';

// Test helpers
import testHelpers from './testHelpers';

// Type validators
import typeValidatorFactory from './typeValidatorFactory';

// Result utilities
import resultAnalyzers from './resultAnalyzers';
import resultCreators from './resultCreators';
import validationResultBuilder from './validationResultBuilder';
import validationConstants from './validationConstants';
import handleValidationFailure from './handleValidationFailure';

// Named exports for better tree-shaking support
export {
  // Core validation
  validateEmailFormat,
  validatePasswordStrength,
  validateMonetaryAmount,
  validateApiKeyFormat,
  validateCurrencyCode,
  sanitizeInput,
  extractValidationErrors,
  
  // Type validators
  validateRequired,
  validateArray,
  validateBoolean,
  validateDate,
  validateObjectId,
  validatePagination,
  validatePattern,
  validateStringLength,
  validateEnum,
  
  // Specialized validators
  validatePaymentMethodNonce,
  validateDateRange,
  validateSubscriptionPlan,
  validateNumberRange,
  validateNumberInRange,
  validateNumberUnified,
  validateBooleanUnified,
  validateBooleanField,
  validateRequiredString,
  
  // Zod validation
  zodStringValidators,
  zodNumberValidators,
  zodValidationUtils,
  zodSchemaBuilders,
  
  // Validation builders
  createValidator,
  createResourceValidator,
  createFieldValidator,
  createValidationMiddleware,
  createValidationErrorHandler,
  createUnifiedValidator,
  createApiKeyAuth,
  createCredentialSchema,
  createServiceMeta,
  
  // Test helpers
  testHelpers,
  
  // Type validators
  typeValidatorFactory,
  
  // Result utilities
  resultAnalyzers,
  resultCreators,
  validationResultBuilder,
  validationConstants,
  handleValidationFailure
};

// Default export for convenience (backward compatibility)
export default {
  validateEmailFormat,
  validatePasswordStrength,
  validateMonetaryAmount,
  validateApiKeyFormat,
  validateCurrencyCode,
  sanitizeInput,
  extractValidationErrors,
  validateRequired,
  validateArray,
  validateBoolean,
  validateDate,
  validateObjectId,
  validatePagination,
  validatePattern,
  validateStringLength,
  validateEnum,
  validatePaymentMethodNonce,
  validateDateRange,
  validateSubscriptionPlan,
  validateNumberRange,
  validateNumberInRange,
  validateNumberUnified,
  validateBooleanUnified,
  validateBooleanField,
  validateRequiredString,
  zodStringValidators,
  zodNumberValidators,
  zodValidationUtils,
  zodSchemaBuilders,
  createValidator,
  createResourceValidator,
  createFieldValidator,
  createValidationMiddleware,
  createValidationErrorHandler,
  createUnifiedValidator,
  createApiKeyAuth,
  createCredentialSchema,
  createServiceMeta,
  testHelpers,
  typeValidatorFactory,
  resultAnalyzers,
  resultCreators,
  validationResultBuilder,
  validationConstants,
  handleValidationFailure
};