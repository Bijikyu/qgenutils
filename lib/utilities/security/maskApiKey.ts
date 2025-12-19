/**
 * Mask API Key for Logging
 * 
 * Masks an API key to show only the first few characters,
 * making it safe for logging while still allowing identification.
 * 
 * @param {string} apiKey - The API key to mask
 * @param {number} [visibleChars=4] - Number of characters to show at the start
 * @returns {string} Masked API key (e.g., "sk_l***")
 */
function maskApiKey(apiKey, visibleChars = 4) {
  if (typeof apiKey !== 'string' || apiKey.length === 0) { // validate input
    return '***';
  }
  
  if (apiKey.length <= visibleChars) { // if key is shorter than visible chars, mask entirely
    return '***';
  }
  
  const visible: any = apiKey.substring(0, visibleChars); // extract visible portion
  return `${visible}***`; // append mask
}

export default maskApiKey;
