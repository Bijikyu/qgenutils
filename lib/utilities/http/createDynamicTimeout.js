/**
 * Creates dynamic timeout based on payload size.
 *
 * PURPOSE: Automatically scales timeout based on data size. Adds 10 seconds
 * per MB of data to the base timeout, with a maximum additional time of
 * 2 minutes to prevent excessive waits.
 *
 * USE CASE: File uploads, large JSON payloads, or any operation where
 * transfer time depends on data size.
 *
 * EDGE CASES: Returns baseTimeout unchanged for undefined, NaN, negative,
 * or non-numeric payload sizes to ensure graceful degradation.
 *
 * @param {number} baseTimeout - Base timeout in milliseconds
 * @param {number} payloadSize - Size of payload in bytes
 * @returns {number} Adjusted timeout based on payload size
 */
function createDynamicTimeout(baseTimeout, payloadSize) {
  if (typeof payloadSize !== 'number' || !Number.isFinite(payloadSize) || payloadSize <= 0) {
    return baseTimeout;
  }
  
  const sizeMB = payloadSize / (1024 * 1024);
  const additionalTime = Math.min(sizeMB * 10000, 120000);
  return baseTimeout + additionalTime;
}

module.exports = createDynamicTimeout;
