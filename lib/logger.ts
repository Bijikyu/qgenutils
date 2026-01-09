/**
 * Winston logger configuration with async error handling and race condition prevention
 *
 * This logger setup demonstrates several important patterns:
 * 1. Async module loading with graceful fallback for optional dependencies
 * 2. Race condition prevention between async directory creation and transport initialization
 * 3. Dual transport strategy (console + rotating file) with independent error handling
 *
 * The async qerrors loading allows the logger to work even when the qerrors module
 * is not available, while the race condition handling ensures file transports
 * don't fail due to missing directories during initialization.
 */

import fs from 'fs';
import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { QGENUTILS_LOG_DIR } from '../config/localVars.js';
const winstonAny: any = winston as any;

// Async loading pattern for optional qerrors dependency
// This allows the logger to function even when qerrors is not installed
let qerrors: any = null;
(async () => {
  try {
    const qerrorsModule: any = await import('qerrors');
    qerrors = qerrorsModule?.qerrors ?? null;
  } catch {
    // Silently fail - qerrors is optional for logging functionality
  }
})();

const logDir = QGENUTILS_LOG_DIR || path.join(process.cwd(), 'logs');
let logDirReady = false;

/**
 * Async directory creation with idempotent protection
 *
 * This function ensures the log directory exists while preventing race conditions:
 * - Uses a flag to prevent multiple concurrent directory creation attempts
 * - Handles errors gracefully using the async-loaded qerrors module
 * - Is called immediately but not awaited to avoid blocking logger initialization
 */
const ensureLogDirectory = async (): Promise<void> => {
  if (logDirReady) {
    return;
  }
  try {
    await fs.promises.mkdir(logDir, { recursive: true });
    logDirReady = true;
  } catch (error) {
    qerrors?.(
      error instanceof Error ? error : new Error(String(error)),
      'logger',
      `Log directory creation failed for: ${logDir}`
    );
  }
};

// Fire-and-forget async directory creation
// This ensures the directory exists without blocking logger setup
ensureLogDirectory().catch(() => {});

// Transport configuration with independent error handling
// Each transport is configured separately to ensure console logging works
// even if file logging fails due to permission or directory issues
const loggerTransports: any[] = [];
if (winstonAny.transports?.Console) {
  loggerTransports.push(
    new winstonAny.transports.Console({
      level: 'debug',
      format: winstonAny.format.printf(({ level, message }) => `${level}: ${message}`)
    })
  );
}

/**
 * Race condition prevention for file transport initialization
 *
 * Critical pattern: Since ensureLogDirectory() is async and not awaited,
 * we must synchronously ensure the directory exists before creating
 * the file transport. Without this, consumers can hit a race condition
 * where the transport initializes before the directory exists.
 */
try {
  // Synchronous directory creation to prevent race conditions
  // This complements the async ensureLogDirectory() call above
  fs.mkdirSync(logDir, { recursive: true });
  logDirReady = true;

  loggerTransports.push(
    new DailyRotateFile({
      filename: path.join(logDir, 'qgenutils-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d' // Keep logs for 14 days
    })
  );
} catch (err) {
  // File transport failure should not break console logging
  qerrors?.(
    err instanceof Error ? err : new Error(String(err)),
    'logger',
    'DailyRotateFile transport initialization failed'
  );
}

/**
 * Main logger instance with comprehensive formatting
 *
 * Format chain explanation:
 * - timestamp: Adds ISO timestamp to all log entries
 * - errors({ stack: true }): Ensures Error objects are serialized with stack traces
 * - splat(): Enables string interpolation (e.g., logger.info('Hello %s', 'world'))
 * - json(): Outputs structured JSON for log parsing and analysis
 */
const logger = winstonAny.createLogger({
  level: 'info',
  format: winstonAny.format.combine(
    winstonAny.format.timestamp(),
    winstonAny.format.errors({ stack: true }),
    winstonAny.format.splat(),
    winstonAny.format.json()
  ),
  transports: loggerTransports
});

export default logger;
