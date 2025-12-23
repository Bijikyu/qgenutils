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
import fs from 'fs';
import path from 'path';
import { createLogger, format, transports } from 'winston';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use environment variable or fallback path for log directory
const logDir = process.env.QGENUTILS_LOG_DIR || path.join(__dirname, '..', 'logs');

// Ensure log directory exists synchronously before logger initialization
try {
  fs.mkdirSync(logDir, { recursive: true });
} catch (error) {
  // Directory creation failed, but don't block logger initialization
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

// Add DailyRotateFile if available - using dynamic import for optional dependency
async function addDailyRotateFileTransport(): Promise<void> {
  try {
    const winstonDailyRotateFile = await import('winston-daily-rotate-file');
    const DailyRotateFile = winstonDailyRotateFile.default;
    
    loggerTransports.push(new DailyRotateFile({
      filename: path.join(logDir, 'qgenutils-%DATE%.log'), // daily file path for rotation
      datePattern: 'YYYY-MM-DD', // rotate by day for manageable file size
      maxFiles: '14d' // keep two weeks to balance disk usage and history
    }));
  } catch (err) {
    // Optional package is not installed in lightweight test environments
  }
}

// Initialize logger with basic transports
const logger = createLogger({
  level: 'info', // 'info' keeps warnings/errors without verbose debug noise
  format: format.combine(
    format.timestamp(), // include timestamps for tracing events chronologically
    format.errors({ stack: true }), // attach stack traces when logging errors
    format.splat(), // allow util.format style placeholders in log messages
    format.json() // use JSON so log aggregation services can parse entries
  ),
  transports: loggerTransports
});

// Try to add DailyRotateFile transport asynchronously
addDailyRotateFileTransport().catch(() => {
  // Silently ignore if DailyRotateFile is not available
});

export default logger;