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
import validateEmailFormat from './validateEmailSimple.js';
import validatePasswordStrength from './validatePassword.js';
import validateMonetaryAmount from './validateAmount.js';
import validateApiKeyFormat from './validateApiKey.js';
import validateCurrencyCode from './validateCurrency.js';
import sanitizeInput from './sanitizeInput.js';
import extractValidationErrors from './extractValidationErrors.js';

// Type validators
import validateRequired from './validateRequired.js';
import validateArray from './validateArray.js';
import validateBoolean from './validateBoolean.js';
import validateDate from './validateDate.js';
import validateObjectId from './validateObjectId.js';
import validatePagination from './validatePagination.js';
import validatePattern from './validatePattern.js';
import validateStringLength from './validateStringLength.js';
import validateEnum from './validateEnum.js';

// Specialized validators
import validatePaymentMethodNonce from './validatePaymentMethodNonce.js';
import validateDateRange from './validateDateRange.js';
import validateSubscriptionPlan from './validateSubscriptionPlan.js';
import validateNumberRange from './validateNumberRange.js';
import validateNumberInRange from './validateNumberInRange.js';
import validateNumberUnified from './validateNumberUnified.js';
import validateBooleanUnified from './validateBooleanUnified.js';
import validateBooleanField from './validateBooleanField.js';
import validateRequiredString from './validateRequiredString.js';

// Zod-based validation
import zodStringValidators from './zodStringValidators.js';
import zodNumberValidators from './zodNumberValidators.js';
import zodValidationUtils from './zodValidationUtils.js';
import zodSchemaBuilders from './zodSchemaBuilders.js';

// Validation builders
import createValidator from './createValidator.js';
import createResourceValidator from './createResourceValidator.js';
import createFieldValidator from './createFieldValidator.js';
import createValidationMiddleware from './createValidationMiddleware.js';
import createValidationErrorHandler from './createValidationErrorHandler.js';
import createUnifiedValidator from './createUnifiedValidator.js';
import createApiKeyAuth from './createApiKeyAuth.js';
import createCredentialSchema from './createCredentialSchema.js';
import createServiceMeta from './createServiceMeta.js';

// Test helpers
import testHelpers from './testHelpers.js';

// Type validators
import typeValidatorFactory from './typeValidatorFactory.js';

// Result utilities
import resultAnalyzers from './resultAnalyzers.js';
import resultCreators from './resultCreators.js';
import validationResultBuilder from './validationResultBuilder.js';
import validationConstants from './validationConstants.js';
import handleValidationFailure from './handleValidationFailure.js';

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