/**
 * Determines whether a given value is a valid number or a numeric string that can be converted to a finite number.
 *
 * @param {unknown} value - The value to check.
 * @returns {value is number} `true` if the value is a number or a numeric string (e.g., "42", "3.14") that can be parsed into a finite number, otherwise `false`.
 *
 * @example
 * isNumber(42);           // true
 * isNumber('3.14');       // true
 * isNumber('abc');        // false
 * isNumber(NaN);          // false
 * isNumber(Infinity);     // false
 * isNumber('');           // false
 * isNumber(null);         // false
 */
export const isNumber = (value: unknown): value is number => {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) return true;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return !isNaN(parsed) && isFinite(parsed);
  }
  return false;
};
