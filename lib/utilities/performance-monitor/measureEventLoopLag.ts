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

  const start: any = process.hrtime.bigint(); // capture high-resolution start time

  setImmediate((): any => { // schedule check for next event loop tick
    const end: any = process.hrtime.bigint(); // capture end time
    const lagNs: any = Number(end - start); // calculate difference in nanoseconds
    const lagMs: any = lagNs / 1000000; // convert to milliseconds

    callback(Math.round(lagMs * 100) / 100); // round to 2 decimals and call back
  });
}

export default measureEventLoopLag;
