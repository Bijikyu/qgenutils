/**
 * User ID Extraction Utilities
 *
 * PURPOSE: Extract user IDs from various user object formats,
 * handling both MongoDB-style `_id` and standard `id` patterns.
 *
 * @module helpers/userIdHelpers
 */

/**
 * Extract user ID from user object with flexible field detection.
 *
 * @param user - User object that may contain _id or id
 * @returns User ID string or undefined if not found
 *
 * @example
 * extractUserId({ _id: 'mongo123' }); // 'mongo123'
 * extractUserId({ id: 'user456' }); // 'user456'
 * extractUserId({ _id: 'abc', id: 'xyz' }); // 'abc' (_id takes priority)
 * extractUserId(null); // undefined
 */
export function extractUserId(user: unknown): string | undefined {
  if (!user || typeof user !== 'object') {
    return undefined;
  }

  const userObj = user as Record<string, unknown>;

  if (typeof userObj._id === 'string') {
    return userObj._id;
  }

  if (typeof userObj.id === 'string') {
    return userObj.id;
  }

  if (userObj._id && typeof userObj._id === 'object' && 'toString' in userObj._id) {
    return String(userObj._id);
  }

  if (userObj.id && typeof userObj.id === 'object' && 'toString' in userObj.id) {
    return String(userObj.id);
  }

  return undefined;
}

/**
 * Extract user ID with a required fallback.
 *
 * @param user - User object that may contain _id or id
 * @param fallback - Fallback value if user ID not found
 * @returns User ID string or fallback
 *
 * @example
 * extractUserIdOrDefault({ id: 'user123' }, 'anonymous'); // 'user123'
 * extractUserIdOrDefault(null, 'anonymous'); // 'anonymous'
 */
export function extractUserIdOrDefault(user: unknown, fallback: string): string {
  return extractUserId(user) ?? fallback;
}

export default extractUserId;
