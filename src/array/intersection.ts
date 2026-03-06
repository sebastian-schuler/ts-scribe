import { type Nestable } from '../types/common-types.js';
import { objectDeepEquals } from '../object/deep-equals.js';

/**
 * Helper function to find the intersection of multiple arrays.
 * It supports deep equality comparison or strict equality based on the `deep` flag.
 *
 * @param deep - If `true`, uses deep equality comparison; if `false`, uses strict equality.
 * @param arrays - The arrays to find the intersection of.
 * @returns An array containing elements that are present in all arrays.
 *
 * @private
 */
const intersectionInternal = <T>(deep = false, ...arrays: T[][]): T[] => {
	if (arrays.length === 0 || arrays.some((array) => array.length === 0)) {
		return [];
	}

	const findIntersection = (array1: T[], array2: T[]): T[] => {
		const intersection = array1.filter((value) => {
			return array2.some((value2) => {
				return deep ? objectDeepEquals(value as Nestable, value2 as Nestable) : value === value2;
			});
		});
		return [...new Set(intersection)];
	};

	// Reduce the arrays to find the intersection
	let result: T[] = arrays[0] || [];
	for (const array of arrays) {
		const currentArray = array || [];
		const currentIntersection = findIntersection(result, currentArray);
		if (currentIntersection.length === 0) {
			return []; // No intersection, return empty array
		}

		result = currentIntersection;
	}

	return result;
};

/**
 * Find the intersection of multiple arrays using strict equality (===).
 *
 * This function returns a new array containing the elements that are present
 * in all provided arrays. Strict equality (===) is used to compare elements.
 *
 * @category Array
 * @param {T[][]} arrays - The arrays to find the intersection of.
 * @returns {T[]} An array containing elements that are present in all arrays.
 *
 * @example
 * const result = arrayIntersection([1, 2, 3], [2, 3, 4], [3, 2, 5]);
 * console.log(result); // Output: [2, 3]
 */
export const arrayIntersection = <T>(...arrays: T[][]): T[] => intersectionInternal(false, ...arrays);

/**
 * Find the intersection of multiple arrays using deep equality comparison.
 *
 * This function returns a new array containing the elements that are present
 * in all provided arrays, where deep equality is used to compare elements.
 * Deep equality comparison ensures that objects are compared by value, not by reference.
 *
 * @category Array
 * @param {T[][]} arrays - The arrays to find the intersection of.
 * @returns {T[]} An array containing elements that are present in all arrays.
 *
 * @example
 * const result = arrayIntersectionDeep([{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 3 }], [{ id: 2 }]);
 * console.log(result); // Output: [{ id: 2 }]
 */
export const arrayIntersectionDeep = <T>(...arrays: T[][]): T[] => intersectionInternal(true, ...arrays);
