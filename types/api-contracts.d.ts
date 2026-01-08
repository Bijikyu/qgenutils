/**
 * QGenUtils API Contracts & Types
 * 
 * Centralized type definitions and interfaces for all utilities
 * This provides consistent typing across the library and for consumers
 */

// ============================================================================
// COMMON TYPES
// ============================================================================

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  message?: string;
  data?: any;
}

/**
 * Validation error details
 */
export interface ValidationError {
  field?: string;
  message: string;
  value?: any;
  code: string;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Email validation result
 */
export interface EmailValidationResult extends ValidationResult {
  isValid: boolean;
  message: string;
  data: {
    email: string;
    localPart?: string;
    domain?: string;
    isValidFormat: boolean;
  };
}

/**
 * Password validation result
 */
export interface PasswordValidationResult extends ValidationResult {
  data: {
    password: string;
    strength: number;
    score: number;
    checks: {
      length: boolean;
      uppercase: boolean;
      lowercase: boolean;
      numbers: boolean;
      special: boolean;
    };
    suggestions: string[];
  };
}

/**
 * Validation options base interface
 */
export interface ValidationOptions {
  required?: boolean;
  errorMessage?: string;
}

/**
 * String validation options
 */
export interface StringValidationOptions extends ValidationOptions {
  minLength?: number;
  maxLength?: number;
  allowEmpty?: boolean;
  trim?: boolean;
  pattern?: RegExp;
}

/**
 * Number validation options
 */
export interface NumberValidationOptions extends ValidationOptions {
  min?: number;
  max?: number;
  allowZero?: boolean;
  allowNegative?: boolean;
  integer?: boolean;
}

/**
 * Array validation options
 */
export interface ArrayValidationOptions extends ValidationOptions {
  minLength?: number;
  maxLength?: number;
  itemValidator?: (item: any) => boolean;
  uniqueItems?: boolean;
}

// ============================================================================
// SECURITY TYPES
// ============================================================================

/**
 * API key masking result
 */
export interface ApiKeyMaskResult {
  original: string;
  masked: string;
  error?: string;
}

/**
 * String sanitization result
 */
export interface SanitizationResult {
  original: string;
  sanitized: string;
  changed: boolean;
  removed?: string[];
  warnings?: string[];
}

/**
 * Security configuration
 */
export interface SecurityConfig {
  encryption: {
    enabled: boolean;
    algorithm: string;
    keySize: number;
  };
  authentication: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecial: boolean;
    };
  };
  rateLimit: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
  };
}

// ============================================================================
// DATETIME TYPES
// ============================================================================

/**
 * Date/time formatting options
 */
export interface DateTimeFormatOptions {
  format?: 'default' | 'date' | 'time' | 'iso' | 'relative' | 'custom';
  locale?: string;
  timezone?: string;
  customFormat?: string;
}

/**
 * Date/time formatting result
 */
export interface DateTimeFormatResult {
  original: string | Date;
  formatted: string;
  timestamp: number;
  timezone?: string;
  formats?: Record<string, string>;
  error?: string;
}

/**
 * Duration formatting options
 */
export interface DurationFormatOptions {
  unit?: 'ms' | 's' | 'm' | 'h' | 'd';
  precision?: number;
  includeZeros?: boolean;
}

/**
 * Duration formatting result
 */
export interface DurationFormatResult {
  original: number;
  formatted: string;
  units: {
    milliseconds: number;
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
  };
  selectedUnit: string;
}

// ============================================================================
// URL TYPES
// ============================================================================

/**
 * URL parsing result
 */
export interface UrlParseResult {
  original: string;
  protocol?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
  isValid: boolean;
  error?: string;
}

/**
 * Protocol handling result
 */
export interface ProtocolResult {
  original: string;
  processed: string;
  added: boolean;
  protocol?: string;
  isValid: boolean;
}

/**
 * URL normalization options
 */
export interface UrlNormalizationOptions {
  defaultProtocol?: string;
  removeTrailingSlash?: boolean;
  removeWWW?: boolean;
  lowercase?: boolean;
}

// ============================================================================
// FILE TYPES
// ============================================================================

/**
 * File size formatting result
 */
export interface FileSizeFormatResult {
  bytes: number;
  formatted: string;
  unit: string;
  size: number;
  unitIndex: number;
}

/**
 * File validation options
 */
export interface FileValidationOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
  requireImage?: boolean;
}

// ============================================================================
// PERFORMANCE TYPES
// ============================================================================

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  timestamp: number;
  duration: number;
  memoryUsage?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  cpuUsage?: {
    user: number;
    system: number;
  };
}

/**
 * Memoization result
 */
export interface MemoizationResult<T = any> {
  result: T;
  fromCache: boolean;
  cacheHits: number;
  cacheSize?: number;
}

/**
 * Performance monitoring options
 */
export interface PerformanceMonitorOptions {
  enabled: boolean;
  samplingRate: number;
  maxSamples: number;
  reportInterval: number;
}

// ============================================================================
// MIDDLEWARE TYPES
// ============================================================================

/**
 * API key validator options
 */
export interface ApiKeyValidatorOptions {
  apiKey: string | ((req: any) => string);
  headerName?: string;
  queryParam?: string;
  onInvalid?: (req: any, res: any) => void;
  onMissing?: (req: any, res: any) => void;
}

/**
 * Rate limiter options
 */
export interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: any) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

/**
 * Authentication context
 */
export interface AuthContext {
  userId?: string;
  username?: string;
  roles?: string[];
  permissions?: string[];
  sessionId?: string;
  tokenExpiry?: number;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * Feature flag configuration
 */
export interface FeatureConfig {
  name: string;
  enabled: boolean;
  version: string;
  environment: string;
  dependencies: string[];
  metadata: Record<string, any>;
  rolloutPercentage: number;
  conditions: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

/**
 * Processing capabilities configuration
 */
export interface ProcessingCapabilitiesConfig {
  concurrency: {
    maxTasks: number;
    taskTimeout: number;
    queueSize: number;
  };
  retry: {
    maxAttempts: number;
    delay: number;
    backoffMultiplier: number;
    maxDelay: number;
  };
  errorHandling: {
    deadLetterQueue: boolean;
    maxRetriesBeforeDLQ: number;
    dlqSize: number;
  };
  priorities: {
    levels: string[];
    defaultLevel: string;
  };
  loadBalancing: {
    strategy: string;
    healthCheck: boolean;
  };
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Standardized error interface
 */
export interface StandardError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
  timestamp: number;
  context?: Record<string, any>;
}

/**
 * Error codes
 */
export enum ErrorCodes {
  // Validation errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  INVALID_URL = 'INVALID_URL',
  
  // Security errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  RATE_LIMITED = 'RATE_LIMITED',
  INVALID_API_KEY = 'INVALID_API_KEY',
  
  // System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  TIMEOUT = 'TIMEOUT',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  
  // Business logic errors
  INVALID_INPUT = 'INVALID_INPUT',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS'
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Deep partial type - makes all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Required fields type - makes specified fields required
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Omit multiple keys type
 */
export type OmitKeys<T, K extends string | number | symbol> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

/**
 * Async function type
 */
export type AsyncFunction<T = any> = (...args: any[]) => Promise<T>;

/**
 * Event emitter interface
 */
export interface EventEmitter {
  on(event: string, listener: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
  off(event: string, listener: (...args: any[]) => void): void;
}

/**
 * Cache interface
 */
export interface Cache<K = string, V = any> {
  get(key: K): V | null | undefined;
  set(key: K, value: V, ttl?: number): void;
  delete(key: K): boolean;
  clear(): void;
  has(key: K): boolean;
  size(): number;
}