/**
 * Determines whether a given value is a string.
 *
 * @param {unknown} value - The value to check.
 * @returns {value is string} `true` if the value is of type string, otherwise `false`.
 *
 * @example
 * isString('hello');      // true
 * isString(123);          // false
 * isString(null);         // false
 * isString(['a', 'b']);   // false
 */
export function isString(value: unknown): value is string {
  return (
    typeof value === 'string' ||
    (typeof value === 'object' && value !== null && Object.prototype.toString.call(value) === '[object String]')
  );
}
