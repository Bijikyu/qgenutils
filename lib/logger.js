/*
 * Logger Utility Module
 *
 * This module wraps the Winston logging library with sensible defaults for
 * use inside lightweight utilities. We use DailyRotateFile so log files do not
 * grow indefinitely and remain easy to inspect on environments like Replit or
 * Render that have limited disk space. Console transport is enabled only when
 * Winston exposes the constructor which keeps tests that stub Winston from
 * failing.
 */
const fs = require('fs'); // ensure log directory exists
const path = require('path'); // path helper for file locations
const { createLogger, format, transports } = require('winston'); // winston core
const DailyRotateFile = require('winston-daily-rotate-file'); // rotation transport

const logDir = path.join(__dirname, '..', 'logs'); // directory for log files
fs.mkdirSync(logDir, { recursive: true }); // create directory if missing

const logger = createLogger({
  level: 'info', // default log level
  format: format.combine(
    format.timestamp(), // add ISO timestamp
    format.errors({ stack: true }), // capture error stacks
    format.splat(), // support sprintf style
    format.json() // output in JSON for log collectors
  ),
  transports: [
    // Console transport is optional so this module works when Winston's Console
    // constructor has been stubbed out in tests; we log debug level to aid
    // development but skip it entirely if the environment removes Console
    ...(transports.Console.prototype ? [new transports.Console({ level: 'debug', format: format.printf(({ level, message }) => `${level}: ${message}`) })] : []),
    // DailyRotateFile keeps logs compact and automatically removes old files;
    // this avoids manual cleanup while still providing recent history for
    // troubleshooting server issues
    new DailyRotateFile({
      filename: path.join(logDir, 'qgenutils-%DATE%.log'), // daily file path
      datePattern: 'YYYY-MM-DD', // rotate by day
      maxFiles: '14d' // keep two weeks of logs
    })
  ]
});

module.exports = logger; // export configured logger
