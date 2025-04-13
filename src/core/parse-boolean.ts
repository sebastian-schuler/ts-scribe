import { isString } from '../typeguards/is-string.js';

/**
 * Parse a value into a boolean
 * @param value - The value to parse
 * @param defaultValue - The default value to return if the value is not a boolean (default: false)
 * @returns The parsed boolean value
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
