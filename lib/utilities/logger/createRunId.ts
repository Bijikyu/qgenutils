/**
 * Generate structured execution identifier for log correlation.
 *
 * PURPOSE: Creates stable run identifiers useful for log correlation
 * across async boundaries. Combines prefix with unique identifier.
 *
 * @param {string} prefix - Human-readable prefix describing the operation
 * @returns {string} Stable run identifier (e.g., "checkout_abc123")
 */

import { nanoid } from 'nanoid';

const createRunId = (prefix: any): any => {
  const safePrefix = typeof prefix === 'string' && prefix.trim() 
    ? prefix.trim().replace(/\s+/g, '_') 
    : 'run';
  const id: any = nanoid(8);
  return `${safePrefix}_${id}`;
};

export default createRunId;
