/**
 * Check if a value is defined
 * @param arg - The value to check
 * @returns True if the value is defined, false otherwise
 */
export function isDefined<T>(arg: T): arg is Exclude<T, null | undefined> {
  return arg !== null && arg !== undefined && Number.isNaN(arg) === false;
}
