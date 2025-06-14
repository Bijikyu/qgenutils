/*
 * Logger Utility
 *
 * PURPOSE OF CONFIGURATION:
 * - Provide a Winston logger instance so all modules share structured logging
 *   rather than scattering console.log statements.
 * - DailyRotateFile is used to keep log files manageable by automatically
 *   rotating them each day, which also simplifies log archival.
 * - The logs directory is created at runtime because deployment targets such as
 *   serverless environments may not have it present by default.
 */

const fs = require('fs'); // ensure log directory exists
const path = require('path'); // path helper for file locations
const { createLogger, format, transports } = require('winston'); // winston core
const DailyRotateFile = require('winston-daily-rotate-file'); // rotation transport

const logDir = path.join(__dirname, '..', 'logs'); // directory for log files
fs.mkdirSync(logDir, { recursive: true }); // create directory if missing

const logger = createLogger({
  level: 'info', // log everything at info or above to reduce noise
  format: format.combine(
    format.timestamp(), // include timestamps for tracing events chronologically
    format.errors({ stack: true }), // attach stack traces when logging errors
    format.splat(), // allow util.format style placeholders in log messages
    format.json() // use JSON so log aggregation services can parse entries
  ),
  transports: [
    ...(transports.Console.prototype ? [new transports.Console({ level: 'debug', format: format.printf(({ level, message }) => `${level}: ${message}`) })] : []), // console when constructor exists
    new DailyRotateFile({
      filename: path.join(logDir, 'qgenutils-%DATE%.log'), // daily file path
      datePattern: 'YYYY-MM-DD', // rotate by day
      maxFiles: '14d' // keep two weeks of logs
    })
  ]
});

module.exports = logger; // export configured logger
