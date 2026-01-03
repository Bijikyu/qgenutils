import fs from 'fs';
import path from 'path';
import { createLogger, format, transports } from 'winston';
import { fileURLToPath } from 'url';
import { QGENUTILS_LOG_DIR } from '../config/localVars.js';
let qerrors: any = null;
try {
  const qerrorsModule = await import('qerrors');
  qerrors = qerrorsModule.qerrors;
} catch {}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = QGENUTILS_LOG_DIR || path.join(__dirname, '..', 'logs');
let logDirReady = false;
async function ensureLogDirectory(): Promise<void> {
  if (logDirReady) return;
  try {
    await fs.promises.mkdir(logDir, { recursive: true });
    logDirReady = true;
  } catch (error) {
    qerrors?.(error instanceof Error ? error : new Error(String(error)), 'logger', `Log directory creation failed for: ${logDir}`);
  }
}
ensureLogDirectory().catch(() => {});
const loggerTransports: any[] = [];
transports.Console.prototype && loggerTransports.push(new transports.Console({ 
  level: 'debug', 
  format: format.printf(({ level, message }) => `${level}: ${message}`) 
}));

async function addDailyRotateFileTransport(): Promise<void> {
  try {
    const winstonDailyRotateFile = await import('winston-daily-rotate-file');
    const DailyRotateFile = winstonDailyRotateFile.default;
    const transport = new DailyRotateFile({
      filename: path.join(logDir, 'qgenutils-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d'
    });
    loggerTransports.push(transport);
    logger.add(transport);
  } catch (err) {
    qerrors?.(err instanceof Error ? err : new Error(String(err)), 'logger', 'DailyRotateFile transport initialization failed');
  }
}
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: loggerTransports
});
addDailyRotateFileTransport().catch(() => {});
export default logger;