/**
 * Returns a random sample of unique elements from the given array.
 *
 * @template T - The type of elements in the input array.
 * @param {T[]} arr - The array to sample from.
 * @param {number} [size=1] - The number of elements to sample. Defaults to 1.
 * @returns {T[]} A new array containing `size` randomly selected unique elements from the input array.
 *                If `size` is greater than the length of `arr`, the original array is returned.
 *                If `size` is less than 0, an empty array is returned.
 *
 * @example
 * randomSample([1, 2, 3, 4, 5], 2); // might return [3, 1]
 * randomSample(['a', 'b', 'c']);   // returns one random element, e.g. ['b']
 */
export const randomSample = <T>(arr: T[], size: number = 1): T[] => {
  if (size < 0) return [];
  if (size > arr.length) return arr;
  const result = [];
  const copy = [...arr];
  for (let i = 0; i < size; i++) {
    const randomIndex = Math.floor(Math.random() * copy.length);
    result.push(copy[randomIndex]);
    copy.splice(randomIndex, 1);
  }
  return result;
};
