/**
 * Creates a new object by removing specified keys from the original object.
 * This function avoids mutating the original object by creating a shallow copy.
 *
 * @param {T} obj - The object from which keys will be removed.
 * @param {K[]} keys - The array of keys to remove from the object.
 * @returns {Omit<T, K>} A new object with the specified keys removed.
 *
 * @template T - The type of the object from which keys will be removed.
 * @template K - The keys of the object to be removed.
 *
 * @example
 * const original = { a: 1, b: 2, c: 3 };
 * const result = objectRemoveKeys(original, ['b', 'c']);
 * console.log(result); // { a: 1 }
 *
 * const user = { name: 'Alice', age: 25, country: 'USA' };
 * const updatedUser = objectRemoveKeys(user, ['age']);
 * console.log(updatedUser); // { name: 'Alice', country: 'USA' }
 */
export function objectRemoveKeys<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  // Create a shallow copy of the object to avoid mutating the original object
  const newObj = { ...obj };

  // Loop through the provided keys and delete them from the new object
  for (const key of keys) {
    delete newObj[key];
  }

  return newObj;
}
