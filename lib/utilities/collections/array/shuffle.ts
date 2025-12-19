/**
 * Randomly shuffles array using Fisher-Yates algorithm.
 *
 * PURPOSE: Randomizes order for sampling, games, A/B testing,
 * or displaying items in random order.
 *
 * @param {Array} array - Array to shuffle
 * @returns {Array} New shuffled array (does not mutate original)
 */
function shuffle(array) {
  if (!Array.isArray(array)) return [];
  
  const shuffled: any = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j: any = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default shuffle;
