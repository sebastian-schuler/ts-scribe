/**
 * Extracts the values of a specific key from an array of objects.
 *
 * This function maps over an array of objects and returns a new array containing
 * the values of the specified key from each object.
 *
 * @param {T[]} array - The array of objects to pluck values from.
 * @param {K} key - The key whose values are to be extracted.
 * @returns {T[K][]} An array of values for the specified key from each object in the array.
 *
 * @example
 * const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
 * const names = arrPluck(users, 'name');
 * console.log(names); // Output: ['Alice', 'Bob']
 */
export const arrPluck = <T, K extends keyof T>(array: T[], key: K): T[K][] => {
  return array.map((item) => item[key]);
};
