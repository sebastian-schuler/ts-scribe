import { isDefined } from './is-defined.js';

/**
 * Checks if a value is not defined (i.e., it is either `null` or `undefined`).
 *
 * This function is the inverse of `isDefined`. It returns `true` if the value is either `null` or `undefined`,
 * and `false` otherwise.
 *
 * @param {T} arg - The value to check.
 * @returns {arg is Exclude<T, null | undefined>} A type guard that narrows the type to exclude `null` and `undefined`
 * if the value is defined.
 *
 * @example
 * const value = null;
 *
 * if (isNotDefined(value)) {
 *   console.log("Value is either null or undefined.");
 * }
 *
 * const definedValue = "Hello, world!";
 * if (!isNotDefined(definedValue)) {
 *   console.log("Value is defined!");
 * }
 */
export function isNotDefined<T>(arg: T): arg is Exclude<T, null | undefined> {
  return !isDefined(arg);
}
