/**
 * Returns an array of values from a given key in an array of objects
 * @param array - The array of objects to pluck values from
 * @param key - The key to pluck from the objects
 * @returns An array of values from the given key
 */
export const pluck = <T, K extends keyof T>(array: T[], key: K): T[K][] => {
  return array.map((item) => item[key]);
};
