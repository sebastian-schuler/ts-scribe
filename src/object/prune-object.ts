/**
 * Recursively removes `undefined` values from an object or array.
 * This function cleans nested objects and arrays, ensuring that no properties
 * or elements are left with the value `undefined`.
 *
 * @category Object
 * @param {T} object - The object or array to prune.
 * @returns {T} The pruned object or array with `undefined` values removed.
 *
 * @template T - The type of the object to be pruned, which extends an object.
 *
 * @example
 * pruneObject({ a: 1, b: undefined, c: { d: undefined } }); // Returns: { a: 1, c: {} }
 *
 * pruneObject([1, undefined, { a: undefined }, [undefined]]); // Returns: [1, {}]
 *
 * pruneObject([undefined, undefined]); // Returns: []
 *
 * pruneObject({ date: new Date() }); // Returns: { date: DateInstance }
 */
export const pruneObject = <T>(object: T): T => {
	return pruneValue(object) as T;
};

const pruneValue = (value: unknown): unknown => {
	// Iterate if object is an array
	if (Array.isArray(value)) {
		return value
			.map((item) => pruneValue(item))
			.filter((item): item is Exclude<unknown, undefined> => item !== undefined);
	}

	// Keep property if not an object
	if (typeof value !== 'object' || value === null || value instanceof Date) {
		return value;
	}

	// Recursively clean object
	const result: Record<string, unknown> = {};
	for (const key in value) {
		if (Object.hasOwn(value, key)) {
			const prunedValue = pruneValue((value as Record<string, unknown>)[key]);
			if (prunedValue !== undefined) {
				result[key] = prunedValue;
			}
		}
	}

	return result;
};
