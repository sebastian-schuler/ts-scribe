import { Nestable } from '../common-types/common-types';
import { deepEquals } from '../object-utils/deepEquals';

/**
 * Find the intersection of multiple arrays
 * @param arrays - The arrays to find the intersection of
 * @returns An array containing elements that are present in all arrays
 */
const intersection = <T>(deep = false, ...arrays: T[][]): Array<T> => {
  if (arrays.length === 0 || arrays.some((arr) => arr.length === 0)) {
    return [];
  }

  const findIntersection = (arr1: T[], arr2: T[]): T[] => {
    const intersection = arr1.filter((value) => {
      return arr2.some((value2) => {
        return deep ? deepEquals(value as Nestable, value2 as Nestable) : value === value2;
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

export const arrIntersection = <T>(...arrays: T[][]): Array<T> => intersection(false, ...arrays);
export const arrIntersectionDeep = <T>(...arrays: T[][]): Array<T> => intersection(true, ...arrays);
