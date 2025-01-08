/**
 * Check if a value is empty (null, undefined, empty string, empty array, or empty object).
 * @param value - Value to check
 * @returns True if the value is empty, false otherwise
 */
export const isEmptyValue = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
};
