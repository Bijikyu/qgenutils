/**
 * CSS Class Name Merger Utility
 *
 * PURPOSE: Intelligently merge CSS class names with Tailwind CSS conflict
 * resolution. Combines clsx's conditional class handling with tailwind-merge's
 * smart deduplication of conflicting Tailwind utilities.
 *
 * IMPLEMENTATION FEATURES:
 * - Conditional Classes: Supports objects, arrays, and conditional expressions
 * - Tailwind Conflict Resolution: Later classes override earlier conflicting ones
 * - Type-Safe: Full TypeScript support with ClassValue types
 *
 * @module css/cn
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge CSS class names with Tailwind conflict resolution.
 *
 * @param inputs - Class values (strings, objects, arrays, conditionals)
 * @returns Merged class string with conflicts resolved
 *
 * @example
 * cn('px-2 py-1', 'px-4'); // 'py-1 px-4' (px-4 wins)
 * cn('text-red-500', { 'text-blue-500': true }); // 'text-blue-500'
 * cn(['flex', 'items-center'], 'justify-between'); // 'flex items-center justify-between'
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

export default cn;
export type { ClassValue };
