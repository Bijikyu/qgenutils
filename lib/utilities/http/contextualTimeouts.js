/**
 * Context-aware timeout configurations for different operation types.
 *
 * PURPOSE: Different operations have different optimal timeout requirements.
 * LLM inference needs longer timeouts than cache lookups. This module provides
 * appropriate timeouts while preventing hanging operations.
 *
 * RATIONALE:
 * - llm-inference: 2 minutes for AI/LLM processing
 * - mjml-rendering: 30 seconds for email template compilation
 * - mailchimp-api: 1 minute for marketing platform operations
 * - http-api: 30 seconds for general HTTP APIs
 * - file-upload: 2 minutes for large file uploads
 * - websocket: 5 minutes for persistent connections
 * - database-query: 45 seconds for database operations
 * - cache-lookup: 5 seconds for fast cache operations
 * - default: 15 seconds fallback
 */
const contextualTimeouts = {
  'llm-inference': 120000,
  'mjml-rendering': 30000,
  'mailchimp-api': 60000,
  'http-api': 30000,
  'file-upload': 120000,
  'websocket': 300000,
  'database-query': 45000,
  'cache-lookup': 5000,
  'default': 15000
};

module.exports = contextualTimeouts;
