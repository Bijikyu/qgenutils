declare module '../../logger.js' {
  interface Logger {
    debug(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
  }
  
  const logger: Logger;
  export default logger;
}