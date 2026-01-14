/**
 * Shared Types for Prompt Generation
 *
 * PURPOSE: Define common interfaces for outreach and prompt context
 * used across prompt generation utilities.
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
