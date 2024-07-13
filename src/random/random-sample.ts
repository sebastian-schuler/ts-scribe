/**
 * Returns a random sample of elements from an array
 * @param arr - The array to sample from
 * @param size - The number of elements to sample (default: 1)
 * @returns The random sample of elements
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
