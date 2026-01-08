import fs from 'fs';
import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { QGENUTILS_LOG_DIR } from '../config/localVars.js';
const winstonAny: any = winston as any;

let qerrors: any = null;
(async () => {
  try {
    const qerrorsModule: any = await import('qerrors');
    qerrors = qerrorsModule?.qerrors ?? null;
  } catch {
  }
})();

const logDir = QGENUTILS_LOG_DIR || path.join(process.cwd(), 'logs');
let logDirReady = false;

const ensureLogDirectory = async (): Promise<void> => {
  if (logDirReady) return;
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

ensureLogDirectory().catch(() => {});

const loggerTransports: any[] = [];
if (winstonAny.transports?.Console) {
  loggerTransports.push(
    new winstonAny.transports.Console({
      level: 'debug',
      format: winstonAny.format.printf(({ level, message }) => `${level}: ${message}`)
    })
  );
}

try {
  // Ensure the directory exists before creating the rotating file transport.
  // `ensureLogDirectory()` is async and not awaited, so without this a consumer
  // can hit a race where the transport initializes before the directory exists.
  fs.mkdirSync(logDir, { recursive: true });
  logDirReady = true;

  loggerTransports.push(
    new DailyRotateFile({
      filename: path.join(logDir, 'qgenutils-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d'
    })
  );
} catch (err) {
  qerrors?.(
    err instanceof Error ? err : new Error(String(err)),
    'logger',
    'DailyRotateFile transport initialization failed'
  );
}

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
