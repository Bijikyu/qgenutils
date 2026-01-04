import logger from './lib/logger.js';
import createMinHeap from './lib/utilities/data-structures/MinHeap.js';
import hashPassword from './lib/utilities/password/hashPassword.js';
import verifyPassword from './lib/utilities/password/verifyPassword.js';
import generateSecurePassword from './lib/utilities/password/generateSecurePassword.js';
import maskSensitiveValue from './lib/utilities/secure-config/maskSensitiveValue.js';
import validateConfigValue from './lib/utilities/secure-config/validateConfigValue.js';
import buildSecureConfig from './lib/utilities/secure-config/buildSecureConfig.js';
import loadAndFlattenModule from './lib/utilities/module-loader/loadAndFlattenModule.js';
import createCachedLoader from './lib/utilities/module-loader/createCachedLoader.js';
import createSimpleLoader from './lib/utilities/module-loader/createSimpleLoader.js';
import createDirectLoader from './lib/utilities/module-loader/createDirectLoader.js';
import validateEmailSimple from './lib/utilities/validation/validateEmailSimple.js';
import validatePassword from './lib/utilities/validation/validatePassword.js';
import validateAmount from './lib/utilities/validation/validateAmount.js';
import validateApiKey from './lib/utilities/validation/validateApiKey.js';
import validateCurrency from './lib/utilities/validation/validateCurrency.js';
import validatePaymentMethodNonce from './lib/utilities/validation/validatePaymentMethodNonce.js';
import validateDateRange from './lib/utilities/validation/validateDateRange.js';
import validateSubscriptionPlan from './lib/utilities/validation/validateSubscriptionPlan.js';
import sanitizeInput from './lib/utilities/validation/sanitizeInput.js';
import extractValidationErrors from './lib/utilities/validation/extractValidationErrors.js';
import validateEnum from './lib/utilities/validation/validateEnum.js';
import validateNumberRange from './lib/utilities/validation/validateNumberRange.js';
import validateStringLength from './lib/utilities/validation/validateStringLength.js';
import validateArray from './lib/utilities/validation/validateArray.js';
import validatePattern from './lib/utilities/validation/validatePattern.js';
import validateBoolean from './lib/utilities/validation/validateBoolean.js';
import validateDate from './lib/utilities/validation/validateDate.js';
import validateObjectId from './lib/utilities/validation/validateObjectId.js';
import validatePagination from './lib/utilities/validation/validatePagination.js';
import createValidator from './lib/utilities/validation/createValidator.js';
import createResourceValidator from './lib/utilities/validation/createResourceValidator.js';
import createValidationErrorHandler from './lib/utilities/validation/createValidationErrorHandler.js';
import validateRequiredString from './lib/utilities/validation/validateRequiredString.js';
import validateNumberInRange from './lib/utilities/validation/validateNumberInRange.js';
import zodStringValidators from './lib/utilities/validation/zodStringValidators.js';
import zodNumberValidators from './lib/utilities/validation/zodNumberValidators.js';
import zodValidationUtils from './lib/utilities/validation/zodValidationUtils.js';
import zodSchemaBuilders from './lib/utilities/validation/zodSchemaBuilders.js';
import createApiKeyAuth from './lib/utilities/validation/createApiKeyAuth.js';
import createCredentialSchema from './lib/utilities/validation/createCredentialSchema.js';
import createServiceMeta from './lib/utilities/validation/createServiceMeta.js';
import buildFeatureConfig from './lib/utilities/config/buildFeatureConfig.js';
import buildSecurityConfig from './lib/utilities/config/buildSecurityConfig.js';
import buildValidationConfig from './lib/utilities/config/buildValidationConfig.js';
import buildTestRunnerConfig from './lib/utilities/config/buildTestRunnerConfig.js';
import createPerformanceMetrics from './lib/utilities/config/createPerformanceMetrics.js';
import createProcessingCapabilities from './lib/utilities/config/createProcessingCapabilities.js';
import msToCron from './lib/utilities/scheduling/msToCron.js';
import scheduleInterval from './lib/utilities/scheduling/scheduleInterval.js';
import scheduleOnce from './lib/utilities/scheduling/scheduleOnce.js';
import cleanupJobs from './lib/utilities/scheduling/cleanupJobs.js';
import createApiKeyValidator from './lib/utilities/middleware/createApiKeyValidator.js';
import createRateLimiter from './lib/utilities/middleware/createRateLimiter.js';
import formatDateTime from './lib/utilities/datetime/formatDateTime.js';
import formatDuration from './lib/utilities/datetime/formatDuration.js';
import addDays from './lib/utilities/datetime/addDays.js';
import ensureProtocol from './lib/utilities/url/ensureProtocol.js';
import normalizeUrlOrigin from './lib/utilities/url/normalizeUrlOrigin.js';
import stripProtocol from './lib/utilities/url/stripProtocol.js';
import parseUrlParts from './lib/utilities/url/parseUrlParts.js';
import {
  requireFields,checkPassportAuth,hasGithubStrategy,calculateContentLength,getRequiredHeader,
  sendJsonResponse,buildCleanHeaders,renderView,registerViewRoute
} from './lib/utilities/legacy/missingLegacyFunctions.js';
const validateEmail=validateEmailSimple;

export{
  logger,createMinHeap,hashPassword,verifyPassword,generateSecurePassword,maskSensitiveValue,
  validateConfigValue,buildSecureConfig,loadAndFlattenModule,createCachedLoader,createSimpleLoader,
  createDirectLoader,validateEmailSimple,validatePassword,validateAmount,validateApiKey,
  validateCurrency,validatePaymentMethodNonce,validateDateRange,validateSubscriptionPlan,
  sanitizeInput,extractValidationErrors,validateEnum,validateNumberRange,validateStringLength,
  validateArray,validatePattern,validateBoolean,validateDate,validateObjectId,validatePagination,
  createValidator,createResourceValidator,createValidationErrorHandler,validateRequiredString,
  validateNumberInRange,zodStringValidators,zodNumberValidators,zodValidationUtils,
  zodSchemaBuilders,createApiKeyAuth,createCredentialSchema,createServiceMeta,
  buildFeatureConfig,buildSecurityConfig,buildValidationConfig,buildTestRunnerConfig,
  createPerformanceMetrics,createProcessingCapabilities,msToCron,scheduleInterval,
  scheduleOnce,cleanupJobs,createApiKeyValidator,createRateLimiter,formatDateTime,
  formatDuration,addDays,ensureProtocol,normalizeUrlOrigin,stripProtocol,parseUrlParts,
  requireFields,checkPassportAuth,hasGithubStrategy,calculateContentLength,getRequiredHeader,
  sendJsonResponse,buildCleanHeaders,renderView,registerViewRoute,validateEmail
};

export default{
  logger,createMinHeap,hashPassword,verifyPassword,generateSecurePassword,maskSensitiveValue,
  validateConfigValue,buildSecureConfig,loadAndFlattenModule,createCachedLoader,createSimpleLoader,
  createDirectLoader,validateEmailSimple,validatePassword,validateAmount,validateApiKey,
  validateCurrency,validatePaymentMethodNonce,validateDateRange,validateSubscriptionPlan,
  sanitizeInput,extractValidationErrors,validateEnum,validateNumberRange,validateStringLength,
  validateArray,validatePattern,validateBoolean,validateDate,validateObjectId,validatePagination,
  createValidator,createResourceValidator,createValidationErrorHandler,validateRequiredString,
  validateNumberInRange,zodStringValidators,zodNumberValidators,zodValidationUtils,
  zodSchemaBuilders,createApiKeyAuth,createCredentialSchema,createServiceMeta,
  buildFeatureConfig,buildSecurityConfig,buildValidationConfig,buildTestRunnerConfig,
  createPerformanceMetrics,createProcessingCapabilities,msToCron,scheduleInterval,
  scheduleOnce,cleanupJobs,createApiKeyValidator,createRateLimiter,formatDateTime,
  formatDuration,addDays,ensureProtocol,normalizeUrlOrigin,stripProtocol,parseUrlParts,
  requireFields,checkPassportAuth,hasGithubStrategy,calculateContentLength,getRequiredHeader,
  sendJsonResponse,buildCleanHeaders,renderView,registerViewRoute,validateEmail
};