/**
 * Computes the difference between multiple arrays.
 *
 * This function returns a new array containing elements that exist in the first array
 * but do not appear in any of the subsequent arrays.
 *
 * ---
 * Example:
 * ```ts
 * const arr1 = [1, 2, 3, 4];
 * const arr2 = [3, 4, 5];
 * const arr3 = [4, 6];
 * const result = arrayDifference(arr1, arr2, arr3);
 * console.log(result); // [1, 2]
 * ```
 *
 * @param {...T[][]} arrays - One or more arrays to compare.
 *
 * @returns {T[]} A new array containing elements from the first array that are not in any of the other arrays.
 *
 * @example
 * const arr1 = [1, 2, 3];
 * const arr2 = [2, 3, 4];
 * const result = arrayDifference(arr1, arr2);
 * console.log(result); // [1]
 */
export const arrayDifference = <T>(...arrays: T[][]): T[] => {
	let result = arrays[0] ?? [];

	for (const array of arrays.slice(1)) {
		result = result.filter((value) => !array.includes(value));
	}

	return result;
};
