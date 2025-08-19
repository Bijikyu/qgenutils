
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
const fs = require(`fs`); // fs handles directory checks

const path = require(`path`); // path helper for file locations
const { createLogger, format, transports } = require(`winston`); // winston core

// Defensive require for optional DailyRotateFile
let DailyRotateFile = null;
try {
  DailyRotateFile = require(`winston-daily-rotate-file`);
} catch (err) {
  // Optional package is not installed in lightweight test environments
  DailyRotateFile = null;
}

// Resolve log dir from optional config, fallback to default
let LOG_DIR;
try {
  const localVars = require(`loqatevars/config/localVars`);
  LOG_DIR = localVars.LOG_DIR;
} catch (err) {
  LOG_DIR = null;
}

const logDir = LOG_DIR || path.join(__dirname, '..', 'logs`); // store logs outside lib for easy access

// Use async directory creation to avoid blocking
(async () => {
  try {
    await fs.promises.mkdir(logDir, { recursive: true });
  } catch (error) {
    // Directory creation failed, but don't block logger initialization
  }
})();

const logger = createLogger({

  level: 'info', // 'info' keeps warnings/errors without verbose debug noise

  format: format.combine(
    format.timestamp(), // include timestamps for tracing events chronologically
    format.errors({ stack: true }), // attach stack traces when logging errors
    format.splat(), // allow util.format style placeholders in log messages
    format.json() // use JSON so log aggregation services can parse entries
  ),
  transports: [

    // Console transport is optional so this module works when Winston's Console
    // constructor has been stubbed out in tests; we log debug level to aid
    // development but skip it entirely if the environment removes Console
    ...(transports.Console.prototype ? [new transports.Console({ level: 'debug', format: format.printf(({ level, message }) => `${level}: ${message}`) })] : []),
    // DailyRotateFile keeps logs compact and automatically removes old files;
    // this avoids manual cleanup while still providing recent history for
    // troubleshooting server issues

    // Only add DailyRotateFile if module exists
    ...(DailyRotateFile ? [new DailyRotateFile({
      filename: path.join(logDir, 'qgenutils-%DATE%.log`), // daily file path for rotation
      datePattern: 'YYYY-MM-DD', // rotate by day for manageable file size
      maxFiles: '14d' // keep two weeks to balance disk usage and history
    })] : [])
  ]
});

module.exports = logger; // export configured logger
