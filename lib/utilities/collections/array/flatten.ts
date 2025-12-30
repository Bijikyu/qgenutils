/**
 * SCALABILITY FIX: Optimized array flatten with iterative approach
 * 
 * PURPOSE: Normalizes deeply nested data structures for processing,
 * useful after mapping operations that produce nested results.
 * 
 * SCALABILITY IMPROVEMENTS:
 * - Iterative approach instead of recursive to prevent stack overflow
 * - Pre-allocated array for better performance
 * - Reduced array concatenations
 * - Depth limiting for safety
 */

// Maximum depth to prevent infinite loops
const MAX_DEPTH = 100;

function flatten(array: any[]): any[] {
  if (!Array.isArray(array)) return [];
  
  const result: any[] = [];
  const stack: { item: any; depth: number }[] = [];
  
  // Initialize stack with array items
  for (let i = array.length - 1; i >= 0; i--) {
    stack.push({ item: array[i], depth: 0 });
  }
  
  while (stack.length > 0) {
    const { item, depth } = stack.pop()!;
    
    if (depth > MAX_DEPTH) {
      throw new Error('Maximum flatten depth exceeded');
    }
    
    if (Array.isArray(item)) {
      // Add array items to stack in reverse order to maintain original order
      for (let i = item.length - 1; i >= 0; i--) {
        stack.push({ item: item[i], depth: depth + 1 });
      }
    } else {
      result.push(item);
    }
  }
  
  return result;
}

export default flatten;