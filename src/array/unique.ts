import { type Primitive } from '../types/common-types.js';

/**
 * Returns a new array with all duplicate values removed, preserving only unique values.
 *
 * This function only works with primitive types (string, number, boolean, null, undefined, symbol, bigint).
 * For deduplicating objects or arrays, use `uniqueBy` instead.
 *
 * @category Array
 * @template T - The primitive type of the array elements
 * @param {T[]} array - The array to remove duplicates from
 * @returns {T[]} A new array containing only unique values from the input array
 *
 * @example
 * uniqueArray([1, 2, 2, 3, 3, 3, 4])
 * // => [1, 2, 3, 4]
 *
 * @example
 * uniqueArray(['a', 'b', 'a', 'c'])
 * // => ['a', 'b', 'c']
 */
export function uniqueArray<T extends Primitive>(array: T[]): T[] {
	return [...new Set(array)];
}
