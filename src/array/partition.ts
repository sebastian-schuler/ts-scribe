/**
 * Partitions an array into two arrays based on a predicate function.
 *
 * Elements for which the predicate returns `true` go into the first array,
 * and elements for which it returns `false` go into the second array.
 * The relative order of elements is preserved in both output arrays.
 *
 * @category Array
 * @template T - The type of the array elements
 * @template S - The narrowed type when a type predicate is provided
 * @param {readonly T[]} array - The array to partition
 * @param {(value: T, index: number) => value is S} predicate - A type predicate that narrows `T` to `S`
 * @returns {[S[], Exclude<T, S>[]]} A tuple where the first array contains elements matching `S`, and the second contains the rest
 *
 * @example
 * // Partition mixed types using a type predicate for type narrowing
 * const mixed: Array<string | number> = [1, 'a', 2, 'b'];
 * const [strings, numbers] = partitionArray(mixed, (x): x is string => typeof x === 'string');
 * // strings: string[] => ['a', 'b']
 * // numbers: number[] => [1, 2]
 */
export function partitionArray<T, S extends T>(
	array: readonly T[],
	predicate: (value: T, index: number) => value is S,
): [S[], Array<Exclude<T, S>>];

/**
 * Partitions an array into two arrays based on a predicate function.
 *
 * @category Array
 * @template T - The type of the array elements
 * @param {readonly T[]} array - The array to partition
 * @param {(value: T, index: number) => boolean} predicate - A function called with each element and its index
 * @returns {[T[], T[]]} A tuple where the first array contains matching elements and the second contains the rest
 *
 * @example
 * // Partition numbers into even and odd
 * partitionArray([1, 2, 3, 4, 5], x => x % 2 === 0)
 * // => [[2, 4], [1, 3, 5]]
 *
 * @example
 * // Use the index in the predicate
 * partitionArray(['a', 'b', 'c', 'd'], (_, i) => i % 2 === 0)
 * // => [['a', 'c'], ['b', 'd']]
 */
export function partitionArray<T>(array: readonly T[], predicate: (value: T, index: number) => boolean): [T[], T[]];

export function partitionArray<T>(array: readonly T[], predicate: (value: T, index: number) => boolean): [T[], T[]] {
	const truthy: T[] = [];
	const falsy: T[] = [];

	for (const [i, element] of array.entries()) {
		if (predicate(element, i)) {
			truthy.push(element);
		} else {
			falsy.push(element);
		}
	}

	return [truthy, falsy];
}
