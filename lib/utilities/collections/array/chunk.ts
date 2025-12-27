import { qerrors } from 'qerrors';

/**
 * Chunks array into smaller arrays of specified size.
 *
 * PURPOSE: Splits data for pagination, batch processing, or
 * parallel execution with controlled concurrency.
 *
 * @param {Array} array - Array to chunk
 * @param {number} size - Size of each chunk
 * @returns {Array} Array of chunk arrays
 * @throws {Error} If size is not positive
 */
function chunk(array: any[], size: number): any[][] {
  try {
  if (!Array.isArray(array)) return [];
  if (size <= 0) {
    throw new Error('Chunk size must be greater than 0');
  }
  
  const chunks: any[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'chunk', `Array chunking failed for array length: ${array?.length}, chunk size: ${size}`);
    return [];
  }
}

export default chunk;
