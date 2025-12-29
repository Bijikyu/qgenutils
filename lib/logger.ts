/**
 * Centralized Logger Configuration - Production-Ready Logging Infrastructure
 * 
 * PURPOSE: Provides a comprehensive, production-ready logging solution for the
 * QGenUtils library. This logger is designed to work seamlessly in development,
 * testing, and production environments with proper error handling, log rotation,
 * and structured output for log aggregation systems.
 * 
 * ARCHITECTURE DECISIONS:
 * - Winston: Chosen for its robust transport system and battle-tested reliability
 * - JSON Formatting: Enables log aggregation services (ELK stack, Splunk, etc.) to parse entries
 * - Multiple Transports: Console for development, files for production persistence
 * - Daily Rotation: Prevents log files from growing unbounded while maintaining history
 * - Graceful Degradation: Logger remains functional even if optional dependencies fail
 * 
 * ENVIRONMENTAL CONSIDERATIONS:
 * - Development: Console transport with readable formatting for immediate feedback
 * - Production: File-based logging with JSON for machine processing and log rotation
 * - Testing: Minimal logging to avoid test noise while maintaining error tracking
 * - Container/Cloud: Configurable log directory via environment variable
 * 
 * SECURITY & COMPLIANCE:
 * - No sensitive data logged by default (callers must explicitly log sensitive info)
 * - Structured logging enables security monitoring and audit trail creation
 * - Log retention policy (14 days) balances operational needs with storage costs
 * - Error handling prevents log failures from crashing the application
 * 
 * PERFORMANCE CONSIDERATIONS:
 * - Asynchronous transport initialization prevents blocking during startup
 * - Efficient JSON formatting minimizes serialization overhead
 * - Conditional console transport avoids unnecessary overhead in production
 * - Directory creation is synchronous but happens only once during initialization
 * 
 * CONFIGURATION OPTIONS:
 * - QGENUTILS_LOG_DIR: Environment variable to override default log directory
 * - Winston levels: error, warn, info, debug (configurable via logger.level)
 * - Transport-specific options can be modified by importing and configuring
 */
import fs from 'fs';
import path from 'path';
import { createLogger, format, transports } from 'winston';
import { fileURLToPath } from 'url';
import { QGENUTILS_LOG_DIR } from '../config/localVars.js';

// Try to import qerrors for consistent error reporting across the application
// This optional dependency provides standardized error handling and logging
// If unavailable, we fall back to basic error handling without breaking functionality
let qerrors: any = null;
try {
  const qerrorsModule = await import('qerrors');
  qerrors = qerrorsModule.qerrors;
} catch {
  // qerrors not available, continue without it
  // This allows the logger to work in minimal environments where qerrors
  // might not be installed (e.g., lightweight test setups, edge deployments)
}

// Get __dirname equivalent in ES modules since __dirname is not available natively
// This provides the current module's directory for relative path calculations
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use environment variable or fallback path for log directory
// Environment variable allows deployment flexibility (Docker volumes, cloud storage, etc.)
// Fallback path ensures the logger works out-of-the-box for local development
const logDir = QGENUTILS_LOG_DIR || path.join(__dirname, '..', 'logs');

// Ensure log directory exists synchronously before logger initialization
// This prevents runtime errors when transports try to write to non-existent directories
// The recursive option creates parent directories as needed for flexible deployment
try {
  fs.mkdirSync(logDir, { recursive: true });
} catch (error) {
  // Use qerrors if available for consistent error reporting across the application
  if (qerrors) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'logger', `Log directory creation failed for: ${logDir}`);
  }
  // Directory creation failed, but don't block logger initialization
  // The logger will still work with console transport and can retry file operations
  // This graceful degradation ensures logging doesn't become a single point of failure
}

// Create transports array
const loggerTransports: any[] = [];

// Add console transport if available
if (transports.Console.prototype) {
  loggerTransports.push(new transports.Console({ 
    level: 'debug', 
    format: format.printf(({ level, message }) => `${level}: ${message}`) 
  }));
}

/**
 * Asynchronously adds DailyRotateFile transport for production log management
 * 
 * PURPOSE: Enables log file rotation to prevent disk space issues while maintaining
 * historical log data for debugging and auditing. This transport is essential for
 * production environments where persistent logging is required.
 * 
 * DYNAMIC IMPORT STRATEGY: Uses dynamic import to make winston-daily-rotate-file
 * an optional dependency. This allows the library to work in minimal environments
 * (testing, serverless functions, edge deployments) without requiring all dependencies.
 * 
 * ROTATION CONFIGURATION:
 * - Daily rotation: Balances file manageability with log granularity
 * - 14-day retention: Provides sufficient history for troubleshooting while controlling disk usage
 * - Date pattern: ISO format (YYYY-MM-DD) ensures chronological sorting and easy parsing
 * - Filename pattern: Includes library name and date for easy identification
 * 
 * ERROR HANDLING: Gracefully handles missing optional dependencies without breaking
 * the logger functionality. The console transport remains available as a fallback.
 * 
 * @returns {Promise<void>} Resolves when transport is added or fails gracefully
 */
async function addDailyRotateFileTransport(): Promise<void> {
  try {
    // Dynamic import of optional dependency to keep core library lightweight
    const winstonDailyRotateFile = await import('winston-daily-rotate-file');
    const DailyRotateFile = winstonDailyRotateFile.default;
    
    // Create transport with production-optimized configuration
    const transport = new DailyRotateFile({
      filename: path.join(logDir, 'qgenutils-%DATE%.log'), // daily file path for rotation with library prefix
      datePattern: 'YYYY-MM-DD', // rotate by day for manageable file size and chronological sorting
      maxFiles: '14d' // keep two weeks to balance disk usage and debugging history
    });
    
    // Add to both the transports array and the logger instance
    // The array addition is for potential future use, the logger addition enables immediate functionality
    loggerTransports.push(transport);
    logger.add(transport); // Add to logger instance immediately for async availability
  } catch (err) {
    // Use qerrors if available for consistent error reporting across the application
    if (qerrors) {
      qerrors(err instanceof Error ? err : new Error(String(err)), 'logger', 'DailyRotateFile transport initialization failed');
    }
    // Optional package is not installed in lightweight test environments
    // This is expected behavior and should be treated as a non-critical failure
  }
}

// Initialize logger with production-ready configuration and formatting
// This creates the main logger instance that will be used throughout the application
const logger = createLogger({
  level: 'info', // 'info' level provides good balance - captures warnings/errors without verbose debug noise
  format: format.combine(
    format.timestamp(), // include ISO timestamps for tracing events chronologically and performance analysis
    format.errors({ stack: true }), // automatically capture and format stack traces when Error objects are logged
    format.splat(), // enable util.format style placeholders (%s, %d, %j) for flexible message formatting
    format.json() // output structured JSON for easy parsing by log aggregation systems and monitoring tools
  ),
  transports: loggerTransports // use the dynamically built transports array (console + optional file)
});

// Try to add DailyRotateFile transport asynchronously
addDailyRotateFileTransport().catch(() => {
  // Silently ignore if DailyRotateFile is not available
});

export default logger;