/**
 * Global Constants and Environment Variables
 * Single source of truth for all hardcoded values and environment variable access
 * 
 * USAGE RULES:
 * - Import entire object: const localVars = require('../config/localVars')
 * - Use as: localVars.variableName (not destructured imports)
 * - Never edit constants once they reside here
 * - Flag unused with "REMOVE?" comment but don't delete
 * - Group by category, don't move or re-categorize existing values
 */

// ========================================
// ENVIRONMENT VARIABLE TYPE DEFINITIONS
// ========================================
export const ENV_VALID_TYPES = [`string`, `number`, `boolean`];
export const ENV_TRUTHY_VALUES = [`true`, `1`, `yes`, `on`, `enabled`];
export const ENV_FALSY_VALUES = [`false`, `0`, `no`, `off`, `disabled`, ``];

// ========================================
// LOGGING CONFIGURATION
// ========================================
export const LOG_LEVELS = [`error`, `warn`, `info`, `debug`];
export const LOG_MAX_SIZE = `20m`;
export const LOG_MAX_FILES = `14d`;
export const LOG_DATE_PATTERN = `YYYY-MM-DD-HH`;

// ========================================
// VALIDATION CONSTANTS  
// ========================================
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const GITHUB_URL_REGEX = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+(?:\.git)?(?:\/)?$/;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_STRING_LENGTH = 10000;

// ========================================
// SECURITY CONSTANTS
// ========================================
export const XSS_DANGEROUS_TAGS = [`script`, `style`, `iframe`, `object`, `embed`];
export const XSS_DANGEROUS_PROTOCOLS = [`javascript:`, `data:`, `vbscript:`, `blob:`, `filesystem:`];
export const XSS_EVENT_HANDLERS = /on\w+\s*=/gi;
export const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds
export const RATE_LIMIT_MAX_REQUESTS = 100;

// ========================================
// HTTP CONSTANTS
// ========================================
export const DEFAULT_TIMEOUT = 30000; // 30 seconds
export const MAX_REDIRECTS = 5;
export const DEFAULT_USER_AGENT = `QGenUtils/1.0`;

// ========================================
// FILE PROCESSING CONSTANTS
// ========================================
export const FILE_SIZE_UNITS = [`B`, `KB`, `MB`, `GB`, `TB`];
export const FILE_SIZE_THRESHOLD = 1024;

// ========================================
// DATETIME CONSTANTS
// ========================================
export const DEFAULT_DATETIME_FORMAT = `YYYY-MM-DD HH:mm:ss`;
export const DEFAULT_DATE_FORMAT = `MM/DD/YYYY`;
export const DURATION_UNITS = [`ms`, `s`, `m`, `h`, `d`];

// ========================================
// WORKER POOL CONSTANTS
// ========================================
export const DEFAULT_POOL_SIZE = 4;
export const WORKER_TIMEOUT = 30000;
export const MAX_QUEUE_SIZE = 1000;

// ========================================
// ENVIRONMENT VARIABLES
// ========================================
export const NODE_ENV = process.env.NODE_ENV || `development`;
export const LOG_LEVEL = process.env.LOG_LEVEL || `info`;
export const PORT = process.env.PORT || `3000`;
export const HOST = process.env.HOST || `localhost`;
export const DATABASE_URL = process.env.DATABASE_URL;
export const REDIS_URL = process.env.REDIS_URL;
export const SESSION_SECRET = process.env.SESSION_SECRET;
export const JWT_SECRET = process.env.JWT_SECRET;
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
export const RATE_LIMIT_REDIS_URL = process.env.RATE_LIMIT_REDIS_URL;
export const QGENUTILS_LOG_DIR = process.env.QGENUTILS_LOG_DIR;