/**
 * Randomly shuffles array using Fisher-Yates algorithm with cryptographically secure random numbers.
 *
 * PURPOSE: Randomizes order for sampling, games, A/B testing,
 * or displaying items in random order.
 *
 * @param {Array} array - Array to shuffle
 * @returns {Array} New shuffled array (does not mutate original)
 */
import { randomBytes } from 'crypto';

function shuffle(array: any[]): any[] {
  if (!Array.isArray(array)) return [];
  
  const shuffled: any[] = [...array];
  // Handle empty array case to prevent infinite loop
  if (shuffled.length <= 1) return shuffled;
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Use cryptographically secure random number generation
    const max = i + 1;
    const randomBytesBuffer = randomBytes(4);
    const randomValue = randomBytesBuffer.readUInt32BE(0) / 0xFFFFFFFF;
    const j: number = Math.floor(randomValue * max);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default shuffle;
