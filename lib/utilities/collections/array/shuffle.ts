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
import { qerrors } from 'qerrors';

function shuffle(array: any[]): any[] {
  if (!Array.isArray(array)) return [];
  
  const shuffled: any[] = [...array];
  // Handle empty array case to prevent infinite loop
  if (shuffled.length <= 1) return shuffled;
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Use cryptographically secure random number generation with fallback
    const max = i + 1;
    let randomValue: number;
    
    try {
      const randomBytesBuffer = randomBytes(4);
      randomValue = randomBytesBuffer.readUInt32BE(0) / 0xFFFFFFFF;
    } catch (error) {
      qerrors(error instanceof Error ? error : new Error(String(error)), 'shuffle', 'Crypto random bytes generation failed, using fallback');
      // Fallback to Math.random() if crypto.randomBytes fails
      randomValue = Math.random();
    }
    
    const j: number = Math.floor(randomValue * max);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default shuffle;
