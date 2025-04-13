/**
 * Generates the powerset (all subsets) of a given array.
 *
 * The powerset includes all subsets of the array, including the empty set.
 * By default, the empty set is excluded, but you can control this behavior with the `ignoreEmpty` parameter.
 *
 * @param {Array<T>} arr - The input array for which the powerset is to be generated.
 * @param {boolean} [ignoreEmpty=true] - A flag that controls whether the empty subset is included in the result. Default is `true` (exclude empty set).
 * @returns {Array<T>[]} An array of arrays representing all subsets of the input array.
 *
 * @example
 * const result = arrPowerset([1, 2, 3]);
 * console.log(result);
 * // Output: [ [ 1 ], [ 2 ], [ 3 ], [ 1, 2 ], [ 1, 3 ], [ 2, 3 ], [ 1, 2, 3 ] ]
 *
 * const resultWithEmpty = arrPowerset([1, 2, 3], false);
 * console.log(resultWithEmpty);
 * // Output: [ [], [ 1 ], [ 2 ], [ 3 ], [ 1, 2 ], [ 1, 3 ], [ 2, 3 ], [ 1, 2, 3 ] ]
 */
export const arrPowerset = <T>(arr: Array<T>, ignoreEmpty: boolean = true): Array<T>[] => {
  if (arr.length === 0 && ignoreEmpty) return [[]];
  const res = arr.reduce((a, v) => a.concat(a.map((r) => r.concat(v))), [[]] as Array<Array<T>>);

  return res.slice(ignoreEmpty ? 1 : 0);
};
