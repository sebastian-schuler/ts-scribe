/**
 * Recursively removes `undefined` values from an object or array.
 * This function cleans nested objects and arrays, ensuring that no properties
 * or elements are left with the value `undefined`.
 *
 * @param {T} obj - The object or array to prune.
 * @returns {T} The pruned object or array with `undefined` values removed.
 *
 * @template T - The type of the object to be pruned, which extends an object.
 *
 * @example
 * objectPrune({ a: 1, b: undefined, c: { d: undefined } }); // Returns: { a: 1, c: {} }
 *
 * objectPrune([1, undefined, { a: undefined }, [undefined]]); // Returns: [1, {}]
 *
 * objectPrune([undefined, undefined]); // Returns: []
 *
 * objectPrune({ date: new Date() }); // Returns: { date: DateInstance }
 */
export const objectPrune = <T extends object>(obj: T): T => {
  // Iterate if object is an array
  if (Array.isArray(obj)) {
    return obj.map((value) => objectPrune(value)).filter((value) => value !== undefined) as T;
  }

  // Keep property if not an object
  if (typeof obj !== 'object' || obj === null || obj instanceof Date) {
    return obj;
  }

  // Recursively clean object
  const result = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = objectPrune(obj[key]!);
      if (value !== undefined) {
        result[key] = value;
      }
    }
  }

  return result;
};
