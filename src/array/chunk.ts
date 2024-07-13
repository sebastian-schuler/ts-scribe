/**
 * Chunks an array into smaller arrays of a specified size.
 * @param arr - The array to chunk.
 * @param size - The size of each chunk.
 * @returns - An array of smaller arrays.
 */
export const chunk = <T>(arr: T[], size: number): T[][] => {
  const res = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
};
