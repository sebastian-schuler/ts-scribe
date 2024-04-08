/**
 * Parses a string or number into a number. If the value is not a number, it will return the default value.
 * @param value - The value to parse
 * @param defaultValue - The default value to return if the value is not a number
 * @param type - The type of number to parse. 'int' will only return integers, 'float' will return any number (default: 'float')
 * @param throwInvalid - If true, will throw an error if the value is not a number (default: false)
 * @returns The parsed number or the default value
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
