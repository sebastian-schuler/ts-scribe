/**
 * Typeguard: Check if a value is defined (not null, undefined, or NaN )
 * @param arg - Value to check
 * @returns True if value is defined, false otherwise
 */
export function isDefined<T>(arg: T): arg is Exclude<T, null | undefined> {
  return arg !== null && arg !== undefined && Number.isNaN(arg) === false;
}
