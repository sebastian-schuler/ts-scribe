/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Coerce a given value to an array.
 *
 * The function checks if the input value is an array-like or iterable object (like a string, Set, or Map).
 * If so, it returns the value as an array. If the value is not iterable, it returns an array containing the value.
 *
 * @param {TValue} value - The value to convert into an array.
 * @returns {(TValue extends ArrayLike<infer TElement> | Iterable<infer TElement> ? TElement : TValue)[]}
 *  An array containing the elements of the iterable if the value is iterable, or the value itself if it's not iterable.
 *
 * @example
 * const arr1 = toArray([1, 2, 3]);
 * console.log(arr1); // [1, 2, 3]
 *
 * const arr2 = toArray('hello');
 * console.log(arr2); // ['h', 'e', 'l', 'l', 'o']
 *
 * const arr3 = toArray(42);
 * console.log(arr3); // [42]
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
