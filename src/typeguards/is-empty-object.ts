/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Check if an object is empty
 * @param obj - Object to check
 * @returns True if object is empty, false otherwise
 */
export function isEmptyObject(obj: Record<string, any>): boolean {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return false; // Not an object or an array
  }
  return Object.keys(obj).length === 0;
}
