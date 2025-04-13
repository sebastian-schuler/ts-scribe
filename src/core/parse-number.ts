/**
 * Parses a value and converts it to a number.
 * The function handles multiple input types (string, number, null, or undefined) and can convert
 * the input into either an integer or a float. If the input cannot be parsed, it returns a default value.
 *
 * @param {string | number | null | undefined} value - The value to be parsed into a number.
 * @param {number} defaultValue - The default value to return if the value cannot be parsed.
 * @param {'int' | 'float'} [type='float'] - The type of number to return, either 'int' or 'float'. Defaults to 'float'.
 * @param {boolean} [throwInvalid=false] - Whether to throw an error if parsing fails. If `true`, an error is thrown when invalid input is provided.
 * @returns {number} The parsed number, or the default value if parsing fails.
 *
 * @example
 * parseNumber('123'); // Returns 123
 * parseNumber('123.45', 0, 'float'); // Returns 123.45
 * parseNumber('123.45', 0, 'int'); // Returns 0 (because it's not an integer)
 * parseNumber('abc', 0); // Returns 0 (invalid string)
 * parseNumber(null, 42); // Returns 42
 * parseNumber(undefined, 42); // Returns 42
 * parseNumber('10', 0, 'int', true); // Returns 10 (valid integer)
 * parseNumber('12.34', 0, 'int', true); // Throws an error (invalid for 'int')
 */
export function parseNumber(
  value: string | number | null | undefined,
  defaultValue: number,
  type: 'int' | 'float' = 'float',
  throwInvalid: boolean = false,
): number {
  if (typeof value === 'number') {
    return handleNumber(value, defaultValue, type, throwInvalid);
  }

  if (value === null || value === undefined || (typeof value === 'string' && value.length === 0)) {
    return defaultValue;
  }

  const parsedValue = Number(value);
  return handleNumber(parsedValue, defaultValue, type, throwInvalid);
}

const handleNumber = (
  value: number,
  defaultValue: number,
  type: 'int' | 'float' = 'float',
  throwInvalid: boolean = false,
) => {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    if (throwInvalid) throw new TypeError(`parseNumber failed with: ${value}`);
    return defaultValue;
  }
  if (type === 'int') {
    if (Number.isInteger(value)) {
      return value;
    } else {
      if (throwInvalid) throw new TypeError(`parseNumber failed with: ${value}`);
      return defaultValue;
    }
  }
  return value;
};
