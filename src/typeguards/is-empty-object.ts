/**
 * Check if an object is empty (has no keys or empty array).
 * @param obj - Object to check
 * @returns True if object is empty, false otherwise
 */
export function isEmptyObject(obj: unknown): boolean {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return false; // Not an object or an array
  }
  return Object.keys(obj).length === 0;
}
