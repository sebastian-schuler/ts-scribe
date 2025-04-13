/**
 * Checks if a given value is considered "empty". A value is considered empty if:
 * - It is `null` or `undefined`.
 * - It is an empty string or a string with only whitespace.
 * - It is an empty array.
 * - It is an empty object (no enumerable properties).
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} `true` if the value is considered empty based on the criteria above, otherwise `false`.
 *
 * @example
 * isEmptyValue(null);             // true
 * isEmptyValue(undefined);        // true
 * isEmptyValue('');               // true
 * isEmptyValue('   ');            // true
 * isEmptyValue([]);               // true
 * isEmptyValue({});               // true
 * isEmptyValue({ key: 'value' }); // false
 * isEmptyValue([1, 2, 3]);        // false
 * isEmptyValue('Hello');          // false
 */
export const isEmptyValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
};
