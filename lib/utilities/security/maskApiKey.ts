/**
 * API Key Masking Utility
 *
 * PURPOSE: Safely masks API keys for logging and display purposes while
 * preserving enough characters for identification. This prevents sensitive
 * API keys from being exposed in logs, error messages, or debugging output.
 *
 * SECURITY CONSIDERATIONS:
 * - Never exposes full API keys in any output
 * - Uses consistent masking pattern for predictability
 * - Handles edge cases gracefully without throwing exceptions
 * - Preserves minimal characters for debugging identification
 * - Works with various API key formats and lengths
 *
 * MASKING STRATEGY:
 * - Shows first few characters (configurable, max 8 for security)
 * - Replaces remaining characters with asterisks (***)
 * - Returns '***' for invalid or empty inputs
 * - Maintains consistent format across all key types
 *
 * @param apiKey - API key to mask (any type, will be converted to string)
 * @param visibleChars - Number of characters to keep visible (default: 4, max: 8)
 * @returns Masked API key string safe for logging and display
 */

import { qerrors } from '@bijikyu/qerrors';

/**
 * Masks an API key for safe logging and display
 *
 * @param apiKey - API key to mask (any type)
 * @param visibleChars - Number of characters to keep visible (default: 4)
 * @returns Masked API key string
 */
const maskApiKey = (apiKey: any, visibleChars: number = 4): string => {
  try {
    // Convert to string and handle null/undefined cases
    const apiKeyStr = String(apiKey || '');
    if (apiKeyStr.length === 0) {
      return '***';
    }

    // If key is too short to mask properly, return full mask
    if (apiKeyStr.length <= visibleChars) {
      return '***';
    }

    // Limit visible characters for security (max 8)
    const safeVisibleChars = Math.min(Math.max(visibleChars, 1), 8);

    // Extract visible portion and create masked result
    const visible: string = apiKeyStr.substring(0, safeVisibleChars);
    return `${visible}***`;

  } catch (error) {
    // Log error but return safe fallback
    qerrors(
      error instanceof Error ? error : new Error(String(error)),
      'maskApiKey',
      `API key masking failed unexpectedly for input type: ${typeof apiKey}`
    );
    return '***';
  }
};

export default maskApiKey;
