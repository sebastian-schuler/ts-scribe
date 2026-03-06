/**
 * Coerce a given value to an array.
 *
 * The function checks if the input value is an array-like or iterable object (like a string, Set, or Map).
 * If so, it returns the value as an array. If the value is not iterable, it returns an array containing the value.
 *
 * @category Array
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
export const toArray = <T>(
	value: T,
): Array<T extends ArrayLike<infer TElement> | Iterable<infer TElement> ? TElement : T> => {
	if (value === null || value === undefined) return [];
	if (
		typeof value === 'object' &&
		value !== null && // Use Array.from for array-like objects or iterables
		(Symbol.iterator in value || typeof (value as any).length === 'number')
	) {
		// eslint-disable-next-line unicorn/prefer-spread, @typescript-eslint/no-unsafe-argument
		return Array.from(value as any);
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return [value as any];
};
