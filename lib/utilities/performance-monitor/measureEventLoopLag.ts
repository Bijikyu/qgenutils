import { qerrors } from '@bijikyu/qerrors';

/**
 * Measures event loop lag asynchronously
 * @param {Function} callback - Callback function receiving lag in milliseconds
 * @returns {void}
 * @example
 * measureEventLoopLag((lag: any): any => {
 *   console.log(`Event loop lag: ${lag}ms`);
 * });
 */
const measureEventLoopLag = (callback: any) => {
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }
  const start: bigint = process.hrtime.bigint();
  setImmediate((): any => {
    try {
      const end: bigint = process.hrtime.bigint();
      const lagNs: bigint = end - start;
      const maxSafeBigInt = BigInt(Number.MAX_SAFE_INTEGER);
      const clampedLagNs = lagNs > maxSafeBigInt ? maxSafeBigInt : lagNs < BigInt(0) ? BigInt(0) : lagNs;
      const lagMs: number = Number(clampedLagNs) / 1000000;
      const safeLagMs = Math.min(Math.max(lagMs, 0), 60000);
      callback(Math.round(safeLagMs * 100) / 100);
    } catch (error) {
      qerrors(error instanceof Error ? error : new Error(String(error)), 'measureEventLoopLag', 'Event loop lag measurement failed');
      callback(0.00);
    }
  });
};

export default measureEventLoopLag;
