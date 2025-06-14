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
const fs = require('fs'); // fs handles directory checks
const path = require('path'); // path helper for file locations
const { createLogger, format, transports } = require('winston'); // winston core
const DailyRotateFile = require('winston-daily-rotate-file'); // rotation transport

const logDir = path.join(__dirname, '..', 'logs'); // store logs outside lib for easy access
fs.mkdirSync(logDir, { recursive: true }); // create directory if missing to avoid write errors

const logger = createLogger({
  level: 'info', // 'info' keeps warnings/errors without verbose debug noise
  format: format.combine(
    format.timestamp(), // add ISO timestamp
    format.errors({ stack: true }), // capture error stacks
    format.splat(), // support sprintf style
    format.json() // output in JSON for log collectors
  ),
  transports: [
    ...(transports.Console.prototype ? [new transports.Console({ level: 'debug', format: format.printf(({ level, message }) => `${level}: ${message}`) })] : []), // output to console when available for dev visibility
    new DailyRotateFile({
      filename: path.join(logDir, 'qgenutils-%DATE%.log'), // daily file path for rotation
      datePattern: 'YYYY-MM-DD', // rotate by day for manageable file size
      maxFiles: '14d' // keep two weeks to balance disk usage and history
    })
  ]
});

module.exports = logger; // export configured logger
