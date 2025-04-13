/**
 * Checks if a given value is an empty object (i.e., an object with no properties).
 *
 * @param {unknown} obj - The value to check.
 * @returns {boolean} `true` if the value is an object and has no properties, otherwise `false`.
 *                    Returns `false` for `null`, `undefined`, or non-object values, as well as arrays.
 *
 * @example
 * isEmptyObject({});               // true
 * isEmptyObject({ key: 'value' }); // false
 * isEmptyObject([]);               // false
 * isEmptyObject(null);             // false
 * isEmptyObject(undefined);        // false
 * isEmptyObject('string');         // false
 */
export function isEmptyObject(obj: unknown): boolean {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return false; // Not an object or an array
  }
  return Object.keys(obj).length === 0;
}
