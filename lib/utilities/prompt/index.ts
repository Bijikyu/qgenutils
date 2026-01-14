/**
 * Prompt and Email Utilities Module
 *
 * PURPOSE: Provide utilities for generating structured prompts
 * and composing emails for LLM-based outreach workflows.
 *
 * @module prompt
 */
export { generatePrompt } from './generatePrompt.js';
export { composeEmail } from './composeEmail.js';
export type {
  GeneratePromptData,
  GeneratePromptResult,
  GeneratePromptDependencies
} from './generatePrompt.js';
export type {
  ComposeEmailData,
  ComposeEmailResult,
  ComposeEmailContext
} from './composeEmail.js';
export type { OutreachContext, SenderEnvelope } from './sharedTypes.js';

import { generatePrompt } from './generatePrompt.js';
export default generatePrompt;
