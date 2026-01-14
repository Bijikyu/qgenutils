/**
 * Email Composition Workflow Utility
 *
 * PURPOSE: Deterministically map compose-email inputs and delivery context
 * into a result object. Handles dry-run mode, validation, and delivery
 * status tracking for outreach email workflows.
 *
 * IMPLEMENTATION FEATURES:
 * - Dry Run Support: Preview mode without actual delivery
 * - Input Validation: Validates prompt and composed message presence
 * - Delivery Tracking: Maps delivery context to result status
 * - Audit Snippets: Stores message preview for logging/QA
 * - Error Propagation: Preserves upstream error messages
 *
 * @module prompt/composeEmail
 */

import type { SenderEnvelope } from './sharedTypes.js';

export interface ComposeEmailData extends SenderEnvelope {
  prompt: string;
  to: string;
}

export interface ComposeEmailResult {
  email: string;
  sent: boolean;
  dryRun: boolean;
  error?: string;
  messageSnippet?: string;
}

export interface ComposeEmailContext {
  composedMessage?: string;
  deliveryAttempted: boolean;
  deliverySucceeded: boolean;
  deliveryError?: string;
}

/**
 * Map compose-email inputs and context into a delivery result.
 *
 * @param data - Payload with prompt, recipient, sender, and dry-run flag
 * @param context - Precomputed message content and delivery outcome
 * @returns Result object with delivery status, errors, and audit snippet
 *
 * @example
 * // Dry run mode
 * const result = composeEmail(
 *   { prompt: 'Write an email...', to: 'user@example.com', senderName: 'John', senderEmail: 'john@co.com', dryRun: true },
 *   { composedMessage: 'Hello...', deliveryAttempted: false, deliverySucceeded: false }
 * );
 * // { email: 'user@example.com', sent: false, dryRun: true, messageSnippet: '[DRY RUN - Preview]...' }
 */
export function composeEmail(
  data: ComposeEmailData,
  context?: ComposeEmailContext
): ComposeEmailResult {
  const result: ComposeEmailResult = {
    email: data.to,
    sent: false,
    dryRun: Boolean(data.dryRun)
  };

  const trimmedPrompt = data.prompt?.trim() ?? '';
  if (!trimmedPrompt) {
    result.error = 'Missing prompt for composeEmail';
    return result;
  }

  const composedMessage = context?.composedMessage?.trim() ?? '';

  if (result.dryRun) {
    if (composedMessage) {
      result.messageSnippet = `[DRY RUN - Preview]\n\n${composedMessage}`;
    } else {
      result.messageSnippet = `[DRY RUN] ${trimmedPrompt.slice(0, 120)}`;
    }
    return result;
  }

  if (!composedMessage) {
    result.error = context?.deliveryError || 'Missing composed email content';
    return result;
  }

  result.messageSnippet = composedMessage.slice(0, 120);

  if (!context?.deliveryAttempted) {
    result.error = context?.deliveryError || 'Email delivery was not attempted';
    return result;
  }

  if (context.deliverySucceeded) {
    result.sent = true;
    return result;
  }

  result.error = context.deliveryError || 'Email delivery failed';
  return result;
}

export default composeEmail;
