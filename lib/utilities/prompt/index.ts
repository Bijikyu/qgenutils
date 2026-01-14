/**
 * Prompt Utilities Module
 *
 * PURPOSE: Provide utilities for generating structured prompts
 * for LLM-based tasks like SEO outreach email composition.
 *
 * @module prompt
 */
export { generatePrompt } from './generatePrompt.js';
export type {
  GeneratePromptData,
  GeneratePromptResult,
  GeneratePromptDependencies
} from './generatePrompt.js';
export type { OutreachContext } from './sharedTypes.js';

import { generatePrompt } from './generatePrompt.js';
export default generatePrompt;
