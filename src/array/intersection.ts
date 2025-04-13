import { Nestable } from '../types/common-types.js';
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
const intersectionInternal = <T>(deep = false, ...arrays: T[][]): Array<T> => {
  if (arrays.length === 0 || arrays.some((arr) => arr.length === 0)) {
    return [];
  }

  const findIntersection = (arr1: T[], arr2: T[]): T[] => {
    const intersection = arr1.filter((value) => {
      return arr2.some((value2) => {
        return deep ? objectDeepEquals(value as Nestable, value2 as Nestable) : value === value2;
      });
    });
    return Array.from(new Set(intersection));
  };

  // Reduce the arrays to find the intersection
  let result: T[] = arrays[0] || [];
  for (let i = 0; i < arrays.length; i++) {
    const currentArray = arrays[i] || [];
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
 * @param {T[][]} arrays - The arrays to find the intersection of.
 * @returns {T[]} An array containing elements that are present in all arrays.
 *
 * @example
 * const result = arrIntersection([1, 2, 3], [2, 3, 4], [3, 2, 5]);
 * console.log(result); // Output: [2, 3]
 */
export const arrIntersection = <T>(...arrays: T[][]): Array<T> => intersectionInternal(false, ...arrays);

/**
 * Find the intersection of multiple arrays using deep equality comparison.
 *
 * This function returns a new array containing the elements that are present
 * in all provided arrays, where deep equality is used to compare elements.
 * Deep equality comparison ensures that objects are compared by value, not by reference.
 *
 * @param {T[][]} arrays - The arrays to find the intersection of.
 * @returns {T[]} An array containing elements that are present in all arrays.
 *
 * @example
 * const result = arrIntersectionDeep([{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 3 }], [{ id: 2 }]);
 * console.log(result); // Output: [{ id: 2 }]
 */
export const arrIntersectionDeep = <T>(...arrays: T[][]): Array<T> => intersectionInternal(true, ...arrays);
