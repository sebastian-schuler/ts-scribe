/**
 * Returns the difference between two or more arrays.
 * @param arrays - The arrays to compare.
 * @returns - An array of values that
 */
export const difference = <T>(...arrays: T[][]): T[] => {
  const result = arrays.reduce((acc, curr) => {
    return acc.filter((val) => !curr.includes(val));
  });

  return result;
};
