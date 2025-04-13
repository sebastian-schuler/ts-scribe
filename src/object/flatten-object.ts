/**
 * Flattens a nested object or array into a single-level object with dot-separated keys.
 * This function recursively flattens the object, including arrays, to produce a key-value map where the keys
 * represent the path to the original value, separated by dots.
 *
 * @param {Record<string, unknown>} obj - The object or array to flatten.
 * @param {string} [prefix=''] - The prefix to use for nested keys (used recursively).
 * @returns {Record<string, T>} A new object with flattened keys and values.
 *
 * @template T - The type of the values in the flattened object.
 *
 * @example
 * const obj = {
 *   a: 1,
 *   b: { x: 2, y: [3, 4] },
 *   c: { z: { w: 5 } }
 * };
 * const flattened = objectFlatten(obj);
 * console.log(flattened);
 * // Output: {
 * //   'a': 1,
 * //   'b.x': 2,
 * //   'b.y.0': 3,
 * //   'b.y.1': 4,
 * //   'c.z.w': 5
 * // }
 *
 * const arr = [1, [2, 3], { a: 4 }];
 * const flattenedArr = objectFlatten(arr);
 * console.log(flattenedArr);
 * // Output: {
 * //   '0': 1,
 * //   '1.0': 2,
 * //   '1.1': 3,
 * //   '2.a': 4
 * // }
 */
export const objectFlatten = <T>(obj: Record<string, unknown>, prefix: string = ''): Record<string, T> => {
  return Object.keys(obj).reduce(
    (acc, key) => {
      const value = obj[key];

      // Only append the dot if the prefix is not empty and does not already end with a dot
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            Object.assign(acc, objectFlatten(item, `${newKey}.${index}`));
          } else {
            acc[`${newKey}.${index}`] = item;
          }
        });
      } else if (value && typeof value === 'object') {
        Object.assign(acc, objectFlatten(value as Record<string, unknown>, newKey));
      } else {
        acc[newKey] = value as T;
      }

      return acc;
    },
    {} as Record<string, T>,
  );
};
