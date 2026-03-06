/**
 * Generates the powerset (all subsets) of a given array.
 *
 * The powerset includes all subsets of the array, including the empty set.
 * By default, the empty set is excluded, but you can control this behavior with the `ignoreEmpty` parameter.
 *
 * @category Array
 * @param array - The input array for which the powerset is to be generated.
 * @param ignoreEmpty - A flag that controls whether the empty subset is included in the result. Default is `true` (exclude empty set).
 * @returns An array of arrays representing all subsets of the input array.
 *
 * @example
 * const result = arrayPowerset([1, 2, 3]);
 * console.log(result);
 * // Output: [ [ 1 ], [ 2 ], [ 3 ], [ 1, 2 ], [ 1, 3 ], [ 2, 3 ], [ 1, 2, 3 ] ]
 *
 * const resultWithEmpty = arrayPowerset([1, 2, 3], false);
 * console.log(resultWithEmpty);
 * // Output: [ [], [ 1 ], [ 2 ], [ 3 ], [ 1, 2 ], [ 1, 3 ], [ 2, 3 ], [ 1, 2, 3 ] ]
 */
export const arrayPowerset = <T>(array: T[], ignoreEmpty = true): T[][] => {
	if (array.length === 0 && ignoreEmpty) return [[]];
	const result: T[][] = [[]];

	for (const value of array) {
		const subsetsWithValue = result.map((subset) => [...subset, value]);
		result.push(...subsetsWithValue);
	}

	return result.slice(ignoreEmpty ? 1 : 0);
};
