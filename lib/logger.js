/**
 * Centralized logger configuration for QGenUtils.
 *
 * Winston is used because it supports multiple transports and JSON formatting
 * which lets external log collectors process entries easily. The
 * DailyRotateFile transport rotates logs every day so files stay small while
 * keeping history. We retain logs for 14 days by default which balances
 * disk usage against debugging needs. If the Console transport exists we
 * also log there at debug level for developer visibility; this fallback is
 * skipped when tests stub the console transport. The logs directory is created
 * at runtime so deployment doesn't fail if the folder is missing.
 */
import fs from 'fs'; // fs handles directory checks
import path from 'path'; // path helper for file locations
import { createLogger, format, transports } from 'winston'; // winston core
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use dynamic requires for optional dependencies to avoid top-level await
const logDir = (() => {
  let LOG_DIR = null;
  try {
    // Try to get LOG_DIR from optional config
    if (typeof require !== 'undefined') {
      const localVars = require('loqatevars/config/localVars');
      LOG_DIR = localVars.LOG_DIR;
    }
  } catch (err) {
    LOG_DIR = null;
  }
  return LOG_DIR || path.join(__dirname, `..`, `logs`);
})();

// Ensure log directory exists synchronously before logger initialization
try {
  fs.mkdirSync(logDir, { recursive: true });
} catch (error) {
  // Directory creation failed, but don't block logger initialization
}

// Create transports array
const loggerTransports = [];

// Add console transport if available
if (transports.Console.prototype) {
  loggerTransports.push(new transports.Console({ 
    level: `debug`, 
    format: format.printf(({ level, message }) => `${level}: ${message}`) 
  }));
}

// Add DailyRotateFile if available
try {
  if (typeof require !== 'undefined') {
    const DailyRotateFile = require('winston-daily-rotate-file');
    loggerTransports.push(new DailyRotateFile({
      filename: path.join(logDir, `qgenutils-%DATE%.log`), // daily file path for rotation
      datePattern: `YYYY-MM-DD`, // rotate by day for manageable file size
      maxFiles: `14d` // keep two weeks to balance disk usage and history
    }));
  }
} catch (err) {
  // Optional package is not installed in lightweight test environments
}

const logger = createLogger({
  level: `info`, // `info` keeps warnings/errors without verbose debug noise
  format: format.combine(
    format.timestamp(), // include timestamps for tracing events chronologically
    format.errors({ stack: true }), // attach stack traces when logging errors
    format.splat(), // allow util.format style placeholders in log messages
    format.json() // use JSON so log aggregation services can parse entries
  ),
  transports: loggerTransports
});

export default logger; // export configured logger