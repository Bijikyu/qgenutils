/**
 * SEO Outreach Prompt Generator
 *
 * PURPOSE: Generate sanitized GPT prompts for SEO outreach email composition.
 * Creates structured prompts that request backlink or guest post collaborations
 * while guarding against prompt injection.
 *
 * IMPLEMENTATION FEATURES:
 * - Content Truncation: Limits excerpt to prevent prompt injection
 * - Whitespace Normalization: Cleans up input for consistent formatting
 * - Audit Trail: Stores sanitized excerpt for logging/debugging
 * - Error Resilience: Returns empty prompt on failure with error details
 * - Dependency Injection: Accepts optional logger for decoupled logging
 *
 * @module prompt/generatePrompt
 */

import { qerrors } from 'qerrors';
import logger from '../../logger.js';
import type { OutreachContext } from './sharedTypes.js';

export interface GeneratePromptData extends OutreachContext {}

export interface GeneratePromptResult {
  prompt: string;
  sanitizedExcerpt: string;
  error?: string;
}

export interface GeneratePromptDependencies {
  logError?: (error: unknown, context: string, meta?: Record<string, unknown>) => void;
}

function safeErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return fallback;
}

/**
 * Generate a sanitized GPT prompt for SEO outreach emails.
 *
 * @param data - Outreach context including sender info and content
 * @param deps - Optional dependencies for logging
 * @returns Result with prompt, sanitized excerpt, and optional error
 *
 * @example
 * const result = generatePrompt({
 *   content: 'Our comprehensive guide to...',
 *   senderName: 'John Doe',
 *   senderRole: 'Content Manager',
 *   origin: 'example.com',
 *   linkedUrl: 'https://target-site.com/article',
 *   publicationUrl: 'https://example.com/our-guide'
 * });
 */
export function generatePrompt(
  data: GeneratePromptData,
  deps: GeneratePromptDependencies = {}
): GeneratePromptResult {
  const result: GeneratePromptResult = { prompt: '', sanitizedExcerpt: '' };

  try {
    const rawExcerpt = data.content.slice(0, 2000).replace(/\s+/g, ' ').trim();
    result.sanitizedExcerpt = rawExcerpt.substring(0, 500);

    result.prompt = `Compose an SEO outreach email on behalf of ${data.senderName}, ${data.senderRole} at ${data.origin}.
This email should be addressed to the author or webmaster of ${data.linkedUrl}.
Context:
- Our article (${data.publicationUrl}) referenced their content.
- Our content includes: "${result.sanitizedExcerpt}..."

Goals:
- Politely request a backlink or guest post collaboration.
- Mention the relevance of our content to theirs.
- Be specific, sincere, and professional.
- Use a neutral greeting if no name is known (e.g., "Hello").
- Include an opt-out note at the bottom.`;

    logger.debug('generatePrompt: prompt generated successfully', {
      excerptLength: result.sanitizedExcerpt.length
    });
  } catch (error) {
    const message = safeErrorMessage(error, 'Failed to generate prompt');
    result.prompt = '';
    result.sanitizedExcerpt = '';
    result.error = message;
    deps.logError?.(error, 'generatePrompt:failed', { linkedUrl: data.linkedUrl });
    qerrors(error instanceof Error ? error : new Error(message), 'generatePrompt');
    logger.error('generatePrompt: generation failed', { error: message });
  }

  return result;
}

export default generatePrompt;
