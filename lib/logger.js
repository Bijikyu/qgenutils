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
    ...(transports.Console.prototype ? [new transports.Console({ level: 'debug', format: format.printf(({ level, message }) => `${level}: ${message}`) })] : []), // console when constructor exists
    new DailyRotateFile({
      filename: path.join(logDir, 'qgenutils-%DATE%.log'), // daily file path
      datePattern: 'YYYY-MM-DD', // rotate by day
      maxFiles: '14d' // keep two weeks of logs
    })
  ]
});

module.exports = logger; // export configured logger
