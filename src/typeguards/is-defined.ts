/**
 * Checks if a value is neither `null`, `undefined`, nor `NaN`.
 *
 * @template T - The type of the argument to check.
 * @param {T} arg - The value to check.
 * @returns {arg is Exclude<T, null | undefined>} `true` if the value is defined (not `null`, `undefined`, or `NaN`), otherwise `false`.
 *
 * @example
 * isDefined('Hello');     // true
 * isDefined('');          // true
 * isDefined(0);           // true
 * isDefined(42);          // true
 * isDefined(null);        // false
 * isDefined(undefined);   // false
 * isDefined(NaN);         // false
 */
export function isDefined<T>(arg: T): arg is Exclude<T, null | undefined> {
  return arg !== null && arg !== undefined && Number.isNaN(arg) === false;
}
