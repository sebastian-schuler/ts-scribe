/**
 * Creates a new object containing only the specified keys from the original object.
 * This function avoids mutating the original object by creating a new object.
 *
 * @category Object
 * @param {T} object - The object from which keys will be picked.
 * @param {K[]} keys - The array of keys to pick from the object.
 * @returns {Pick<T, K>} A new object containing only the specified keys.
 *
 * @template T - The type of the object from which keys will be picked.
 * @template K - The keys of the object to be picked.
 *
 * @example
 * const original = { a: 1, b: 2, c: 3 };
 * const result = objectPickKeys(original, ['a', 'c']);
 * console.log(result); // { a: 1, c: 3 }
 *
 * const user = { name: 'Alice', age: 25, country: 'USA' };
 * const pickedData = objectPickKeys(user, ['name', 'age']);
 * console.log(pickedData); // { name: 'Alice', age: 25 }
 */
export function objectPickKeys<T extends object, K extends keyof T>(object: T, keys: K[]): Pick<T, K> {
	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	const result: Pick<T, K> = {} as Pick<T, K>;

	// Loop through the provided keys and copy them to the new object
	for (const key of keys) {
		if (key in object) {
			result[key] = object[key];
		}
	}

	return result;
}
