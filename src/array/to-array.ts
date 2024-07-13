/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Coerce a value to an array. Single values will become a single value array.
 * All entries in an array-like or iterable will be copied to a new array (except for strings and functions).
 * Null or undefined will return an empty array.
 * @param value - The value to coerce to an array.
 * @returns An array containing the value.
 */
export const toArray = <TValue>(
  value: TValue,
): (TValue extends ArrayLike<infer TElement> | Iterable<infer TElement> ? TElement : TValue)[] => {
  if (value === null || value === undefined) return [];
  return typeof value === 'object' &&
    value != null &&
    (Symbol.iterator in value || typeof (value as any).length === 'number')
    ? Array.from(value as any)
    : [value as any];
};
