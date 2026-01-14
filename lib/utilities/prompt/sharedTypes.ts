/**
 * Shared Types for Prompt and Email Generation
 *
 * PURPOSE: Define common interfaces for outreach, prompt context,
 * and email composition used across utilities.
 *
 * @module prompt/sharedTypes
 */

export interface OutreachContext {
  content: string;
  senderName: string;
  senderRole: string;
  origin: string;
  linkedUrl: string;
  publicationUrl: string;
}

export interface SenderEnvelope {
  senderName: string;
  senderEmail: string;
  dryRun?: boolean;
}
