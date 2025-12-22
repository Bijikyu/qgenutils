/**
 * TypeScript interfaces for configuration builders
 */

export interface ValidationConfigOptions {
  strictMode?: boolean;
  sanitizeHtml?: boolean;
  sanitizeXss?: boolean;
  maxFieldLength?: number;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  customValidators?: Record<string, Function>;
  errorMessages?: Record<string, string>;
  localization?: string;
  sanitizeSqlInjection?: boolean;
  sanitizeNoSqlInjection?: boolean;
  maxFileSize?: number;
  maxArrayLength?: number;
  maxObjectDepth?: number;
  allowedFileTypes?: string[];
  allowedMimeTypes?: string[];
  dateFormat?: string;
  timezone?: string;
}

export interface ValidationConfig {
  strictMode: boolean;
  sanitization: {
    html: boolean;
    xss: boolean;
    sqlInjection: boolean;
    nosqlInjection: boolean;
  };
  limits: {
    maxFieldLength: number;
    maxFileSize: number;
    maxArrayLength: number;
    maxObjectDepth: number;
  };
  allowedContent: {
    htmlTags: string[];
    htmlAttributes: Record<string, string[]>;
    fileTypes: string[];
    mimeTypes: string[];
  };
  customValidators: Record<string, Function>;
  errorMessages: Record<string, string>;
  localization: string;
  dateFormat: string;
  timezone: string;
}

export interface PerformanceMetricsOptions {
  enabled?: boolean;
  interval?: number;
  retentionPeriod?: number;
  metrics?: string[];
  alerts?: Record<string, any>;
  aggregation?: Record<string, any>;
  samplingRate?: number;
  aggregationWindowSize?: number;
  storageType?: string;
  storageLocation?: string;
  compressionEnabled?: boolean;
  reportingEnabled?: boolean;
  reportingInterval?: number;
  reportDestinations?: string[];
}

export interface PerformanceMetricsConfig {
  enabled: boolean;
  collection: {
    interval: number;
    retentionPeriod: number;
    metrics: string[];
    samplingRate: number;
  };
  aggregation: {
    method: string;
    windowSize: number;
  };
  alerts: Record<string, any>;
  storage: {
    type: string;
    location: string;
    compression: boolean;
  };
  reporting: {
    enabled: boolean;
    interval: number;
    destinations: string[];
  };
}

export interface ProcessingCapabilitiesOptions {
  maxConcurrentTasks?: number;
  taskTimeout?: number;
  queueSize?: number;
  retryAttempts?: number;
  retryDelay?: number;
  deadLetterQueue?: boolean;
  priorityLevels?: number;
  loadBalancing?: boolean;
  retryBackoffMultiplier?: number;
  retryMaxDelay?: number;
  maxRetriesBeforeDLQ?: number;
  dlqSize?: number;
  defaultPriority?: number;
  priorityWeightings?: Record<string, number>;
  loadBalancingHealthCheck?: boolean;
  healthCheckInterval?: number;
}

export interface ProcessingCapabilitiesConfig {
  concurrency: {
    maxTasks: number;
    taskTimeout: number;
    queueSize: number;
  };
  retry: {
    attempts: number;
    delay: number;
    backoffMultiplier: number;
    maxDelay: number;
  };
  deadLetterQueue: {
    enabled: boolean;
    maxRetriesBeforeDLQ: number;
    size: number;
  };
  priority: {
    levels: number;
    default: number;
    weightings: Record<string, number>;
  };
  loadBalancing: {
    enabled: boolean;
    healthCheck: boolean;
    healthCheckInterval: number;
  };
}

export interface FieldConfig {
  required?: boolean;
  allowNull?: boolean;
  allowEmpty?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  values?: any[];
  type?: string;
  validate?: Function;
  transform?: Function;
  sanitize?: boolean;
  fieldName?: string;
}

export interface TestRunnerConfigOptions {
  timeout?: number;
  retries?: number;
  parallel?: boolean;
  verbose?: boolean;
  coverage?: boolean;
  reporter?: string;
  grep?: string;
  cache?: boolean;
}

export interface TestRunnerConfig {
  timeout: number;
  retries: number;
  parallel: boolean;
  verbose: boolean;
  coverage: boolean;
  reporter: string;
  grep: string;
  cache: boolean;
}