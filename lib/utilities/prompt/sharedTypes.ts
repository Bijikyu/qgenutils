/**
 * Shared Types for Prompt and Email Generation
 *
 * PURPOSE: Define common interfaces for outreach, prompt context,
 * and email composition used across utilities. Pure type declarations
 * with no runtime code to keep imports tree-shakeable and prevent
 * cyclic runtime dependencies.
 *
 * @module prompt/sharedTypes
 */

/**
 * Outreach context describing the content and parties involved in an email.
 * Used by both workflow inputs and prompt generation.
 */
export interface OutreachContext {
  publicationUrl: string;
  linkedUrl: string;
  content: string;
  origin: string;
  senderName: string;
  senderRole: string;
}

/**
 * Common sender envelope used wherever an email sender is specified.
 * Supports both detailed sender info and simple 'from' field patterns.
 */
export interface SenderEnvelope {
  from?: string;
  senderName?: string;
  senderEmail?: string;
  dryRun?: boolean;
}
