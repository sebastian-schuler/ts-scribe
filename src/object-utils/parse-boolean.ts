import { isString } from '../string-utils/is-string';

/**
 * Parse a value into a boolean
 * @param value - The value to parse
 * @param defaultValue - The default value to return if the value is not a boolean
 * @param throwInvalid - Throw an error if the value is not a boolean
 * @returns The parsed boolean value
 */
export function parseBoolean(
  value: string | boolean | number | null | undefined,
  defaultValue: boolean = false,
  throwInvalid: boolean = false,
): boolean {
  if (typeof value === 'boolean') return value;

  if (typeof value === 'number') {
    if (value === 0) return false;
    if (value === 1) return true;
  }

  if (value === null || value === undefined) return defaultValue;

  if (isString(value)) {
    const formattedValue = value.trim().toLowerCase();
    if (formattedValue === 'true' || formattedValue === '1') return true;
    if (formattedValue === 'false' || formattedValue === '0') return false;
  }

  if (throwInvalid) throw new TypeError(`parseBoolean failed with: ${value}`);

  return defaultValue;
}
