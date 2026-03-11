/**
 * Creates a new object by excluding specified keys from the original object.
 * This function avoids mutating the original object by creating a new object.
 *
 * @category Object
 * @param {T} object - The object from which keys will be omitted.
 * @param {K[]} keys - The array of keys to omit from the object.
 * @returns {Omit<T, K>} A new object with the specified keys excluded.
 *
 * @template T - The type of the object from which keys will be omitted.
 * @template K - The keys of the object to be omitted.
 *
 * @example
 * const original = { a: 1, b: 2, c: 3 };
 * const result = objectOmitKeys(original, ['b']);
 * console.log(result); // { a: 1, c: 3 }
 *
 * const user = { name: 'Alice', age: 25, country: 'USA' };
 * const publicData = objectOmitKeys(user, ['age']);
 * console.log(publicData); // { name: 'Alice', country: 'USA' }
 */
export function objectOmitKeys<T extends object, K extends keyof T>(object: T, keys: K[]): Omit<T, K> {
	// Create a shallow copy of the object to avoid mutating the original object
	const result = { ...object };

	// Loop through the provided keys and delete them from the new object
	for (const key of keys) {
		// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
		delete result[key];
	}

	return result;
}
