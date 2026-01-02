/**
 * Global Constants and Environment Variables
 * Single source of truth for all hardcoded values and environment variable access
 */

export const ENV_VALID_TYPES: string[];
export const ENV_TRUTHY_VALUES: string[];
export const ENV_FALSY_VALUES: string[];
export const LOG_LEVELS: string[];
export const LOG_MAX_SIZE: string;
export const LOG_MAX_FILES: string;
export const LOG_DATE_PATTERN: string;
export const EMAIL_REGEX: RegExp;
export const GITHUB_URL_REGEX: RegExp;
export const MIN_PASSWORD_LENGTH: number;
export const MAX_STRING_LENGTH: number;
export const XSS_DANGEROUS_TAGS: string[];
export const XSS_DANGEROUS_PROTOCOLS: string[];
export const XSS_EVENT_HANDLERS: RegExp;
export const RATE_LIMIT_WINDOW: number;
export const RATE_LIMIT_MAX_REQUESTS: number;
export const DEFAULT_TIMEOUT: number;
export const MAX_REDIRECTS: number;
export const DEFAULT_USER_AGENT: string;
export const FILE_SIZE_UNITS: string[];
export const FILE_SIZE_THRESHOLD: number;
export const DEFAULT_DATETIME_FORMAT: string;
export const DEFAULT_DATE_FORMAT: string;
export const DURATION_UNITS: string[];
export const DEFAULT_POOL_SIZE: number;
export const WORKER_TIMEOUT: number;
export const MAX_QUEUE_SIZE: number;
export const NODE_ENV: string;
export const LOG_LEVEL: string;
export const PORT: string | number;
export const HOST: string;
export const DATABASE_URL: string | undefined;
export const REDIS_URL: string | undefined;
export const SESSION_SECRET: string | undefined;
export const JWT_SECRET: string | undefined;
export const GITHUB_CLIENT_ID: string | undefined;
export const GITHUB_CLIENT_SECRET: string | undefined;
export const RATE_LIMIT_REDIS_URL: string | undefined;
export const QGENUTILS_LOG_DIR: string | undefined;