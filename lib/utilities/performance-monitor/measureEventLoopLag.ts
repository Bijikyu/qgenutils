'use strict';

/**
 * Measures event loop lag asynchronously
 * @param {Function} callback - Callback function receiving the lag in milliseconds
 * @returns {void}
 * @example
 * measureEventLoopLag((lag: any): any => {
 *   console.log(`Event loop lag: ${lag}ms`);
 * });
 */
function measureEventLoopLag(callback: any) { // measure event loop delay using hrtime
  if (typeof callback !== 'function') { // validate callback
    throw new Error('Callback must be a function');
  }

  const start: bigint = process.hrtime.bigint(); // capture high-resolution start time

setImmediate((): any => { // schedule check for next event loop tick
    const end: bigint = process.hrtime.bigint(); // capture end time
    const lagNs: bigint = end - start; // keep as BigInt
    
    // Convert to milliseconds with bounds checking - prevent overflow
    const maxSafeBigInt = BigInt(Number.MAX_SAFE_INTEGER);
    const clampedLagNs = lagNs > maxSafeBigInt ? maxSafeBigInt : lagNs < BigInt(0) ? BigInt(0) : lagNs;
    
    const lagMs: number = Number(clampedLagNs) / 1000000; // convert to milliseconds
    
    // Sanity check - if lag is unreasonably high, cap it
    const safeLagMs = Math.min(Math.max(lagMs, 0), 60000); // cap at 60 seconds max
    callback(Math.round(safeLagMs * 100) / 100); // round to 2 decimals and call back
});
}

export default measureEventLoopLag;
