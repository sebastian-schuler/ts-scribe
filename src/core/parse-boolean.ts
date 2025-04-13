import { isString } from '../typeguards/is-string.js';

/**
 * Parses a value and converts it to a boolean.
 * It supports different types of input, including strings, numbers, booleans, null, and undefined.
 *
 * - If the value is a boolean, it is returned as-is.
 * - If the value is a number, it is interpreted as `0` for `false` and `1` for `true`.
 * - If the value is a string, it is converted to lowercase and compared against the values `'true'`, `'1'`, `'false'`, and `'0'`.
 * - If the value is `null` or `undefined`, the provided `defaultValue` is returned or `false` if no `defaultValue` is provided.
 *
 * @param {string | boolean | number | null | undefined} value - The value to be parsed as a boolean.
 * @param {boolean} [defaultValue=false] - The default value to return if the input is `null`, `undefined`, or cannot be parsed. Defaults to `false`.
 * @returns {boolean} The parsed boolean value.
 *
 * @example
 * parseBoolean('true'); // Returns true
 * parseBoolean(1); // Returns true
 * parseBoolean('false'); // Returns false
 * parseBoolean(0); // Returns false
 * parseBoolean(null, true); // Returns true
 * parseBoolean(undefined, true); // Returns true
 * parseBoolean('some string', false); // Returns false
 */
export function parseBoolean(
  value: string | boolean | number | null | undefined,
  defaultValue: boolean = false,
): boolean {
  if (typeof value === 'boolean') return value;

  if (typeof value === 'number') {
    if (value === 0) return false;
    if (value === 1) return true;
  }

  if (value === null || value === undefined) return defaultValue || false;

  if (isString(value)) {
    const formattedValue = value.trim().toLowerCase();
    if (formattedValue === 'true' || formattedValue === '1') return true;
    if (formattedValue === 'false' || formattedValue === '0') return false;
  }

  return defaultValue || false;
}
