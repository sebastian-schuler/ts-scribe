/**
 * Get all permutations of objects in the array
 * @param arr
 * @param ignoreEmpty - If true, the empty array is not included in the result
 * @returns Array of all permutation arrays
 */
export const arrPowerset = <T>(arr: Array<T>, ignoreEmpty = true): Array<T>[] => {
  if (arr.length === 0 && ignoreEmpty) return [[]];
  const res = arr.reduce((a, v) => a.concat(a.map((r) => r.concat(v))), [[]] as Array<Array<T>>);

  return res.slice(ignoreEmpty ? 1 : 0);
};
