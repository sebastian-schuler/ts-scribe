/**
 * Shuffles the elements of an array randomly.
 *
 * The function creates a new array and performs an in-place shuffle using the Fisher-Yates algorithm.
 * This ensures that the shuffled array has a uniform random distribution of elements.
 *
 * @param {T[]} array - The input array to shuffle.
 * @returns {T[]} A new array with the elements shuffled randomly.
 *
 * @example
 * const shuffledArray = arrShuffle([1, 2, 3, 4, 5]);
 * console.log(shuffledArray);
 * // Output: A shuffled array, e.g., [4, 1, 3, 5, 2] (output will be random).
 */
export function arrShuffle<T>(array: T[]): T[] {
  const newArr: T[] = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}
