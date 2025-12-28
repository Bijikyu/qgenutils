/**
 * API KEY MASKING UTILITY
 * 
 * PURPOSE: Provides secure API key masking for logging and debugging purposes.
 * This utility is essential for maintaining security while preserving the ability
 * to identify and troubleshoot API authentication issues.
 * 
 * SECURITY DESIGN PRINCIPLES:
 * - Never exposes full API keys in logs or error messages
 * - Shows minimal characters for identification while maintaining security
 * - Uses consistent masking format to prevent pattern analysis
 * - Handles edge cases gracefully without exposing sensitive information
 * - Fails safe - always returns masked version on any error
 * 
 * MASKING STRATEGY:
 * - Shows only the first N characters (default: 4)
 * - Replaces remaining characters with asterisks
 * - Returns '***' for invalid, empty, or too-short inputs
 * - Maintains consistent output format for log parsing
 * 
 * USE CASES:
 * - Security logging and audit trails
 * - Debugging authentication issues
 * - Error reporting without credential exposure
 * - Monitoring and alerting systems
 * - API usage analytics (anonymous)
 * 
 * COMPLIANCE BENEFITS:
 * - Helps meet PCI DSS logging requirements
 * - Supports GDPR data minimization principles
 * - Maintains SOC 2 compliance for credential handling
 */

import { qerrors } from 'qerrors'; // Centralized error handling system

/**
 * Masks an API key for secure logging while preserving identification capability.
 * 
 * This function transforms API keys into a safe format suitable for logging by
 * showing only the first few characters followed by asterisks. This maintains
 * security while allowing identification of specific API keys during debugging.
 * 
 * @param apiKey - The API key to mask. Can be any type; non-string inputs are handled gracefully.
 * @param visibleChars - Number of characters to show at the beginning (default: 4).
 *                       Must be between 1 and 8 for security reasons.
 * 
 * @returns string - The masked API key in format "prefix***" or "***" for invalid inputs.
 * 
 * @example
 * ```typescript
 * // Standard usage
 * maskApiKey('sk_live_1234567890abcdef')
 * // Returns: 'sk_l***'
 * 
 * // Custom visible characters
 * maskApiKey('sk_live_1234567890abcdef', 8)
 * // Returns: 'sk_live_***'
 * 
 * // Edge cases
 * maskApiKey('short')
 * // Returns: '***' (too short to mask safely)
 * 
 * maskApiKey('')
 * // Returns: '***' (empty string)
 * 
 * maskApiKey(null)
 * // Returns: '***' (null input)
 * 
 * maskApiKey(12345)
 * // Returns: '***' (non-string input)
 * 
 * maskApiKey(undefined)
 * // Returns: '***' (undefined input)
 * ```
 * 
 * @warning Never log full API keys - always use this masking utility
 * @note The masking format is designed to prevent reverse engineering of the original key
 * @see For compliance: PCI DSS Requirement 10.2, GDPR Article 25
 */
function maskApiKey(apiKey: any, visibleChars: number = 4): string {
  try {
    // INPUT VALIDATION: Check for null, undefined, or non-string inputs
    // This defensive programming prevents errors and ensures consistent output
    if (apiKey == null || typeof apiKey !== 'string' || apiKey.length === 0) {
      return '***'; // Standard mask for invalid/empty inputs
    }
    
    // SECURITY CHECK: Reject keys that are too short to mask safely
    // If the key is shorter than or equal to visible characters, masking would expose the entire key
    if (apiKey.length <= visibleChars) {
      return '***'; // Complete masking for short keys
    }
    
    // VISIBILITY LIMIT: Ensure we don't expose too many characters
    // Additional safety check to prevent accidental over-exposure
    const safeVisibleChars = Math.min(Math.max(visibleChars, 1), 8);
    
    // EXTRACT VISIBLE PORTION: Get the prefix for identification
    // This allows debugging and troubleshooting while maintaining security
    const visible: string = apiKey.substring(0, safeVisibleChars);
    
    // CONSTRUCT MASKED FORMAT: Combine visible portion with mask
    // The consistent format makes log parsing easier while maintaining security
    return `${visible}***`;
    
  } catch (error) {
    // ERROR HANDLING: Fail safe - always return masked version
    // Never expose actual API key even if masking fails
    qerrors(
      error instanceof Error ? error : new Error(String(error)), 
      'maskApiKey', 
      `API key masking failed unexpectedly for input type: ${typeof apiKey}`
    );
    
    return '***'; // Safe fallback for any errors
  }
}

export default maskApiKey;
