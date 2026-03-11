/**
 * Options for configuring the behaviour of {@link objectPrune}.
 *
 * @category Object
 */
export type PruneObjectOptions = {
	/**
	 * Recursively prune nested objects and arrays.
	 * @default true
	 */
	deep?: boolean;
	/**
	 * Remove `undefined` items from arrays.
	 * When `false`, arrays are returned as-is without any modification.
	 * @default true
	 */
	arrays?: boolean;
	/**
	 * Preserve `Date` instances without recursing into them.
	 * When `false`, `Date` objects are treated as plain objects (and typically become `{}`).
	 * @default true
	 */
	preserveDate?: boolean;
	/**
	 * Preserve `RegExp` instances without recursing into them.
	 * When `false`, `RegExp` objects are treated as plain objects (and typically become `{}`).
	 * @default true
	 */
	preserveRegExp?: boolean;
};

const defaults: Required<PruneObjectOptions> = {
	deep: true,
	arrays: true,
	preserveDate: true,
	preserveRegExp: true,
};

/**
 * Recursively removes `undefined` values from an object or array.
 * This function cleans nested objects and arrays, ensuring that no properties
 * or elements are left with the value `undefined`.
 *
 * @category Object
 * @param {T} object - The object or array to prune.
 * @param {PruneObjectOptions} [options] - Configuration options.
 * @returns {T} The pruned object or array with `undefined` values removed.
 *
 * @template T - The type of the object to be pruned, which extends an object.
 *
 * @example
 * objectPrune({ a: 1, b: undefined, c: { d: undefined } }); // Returns: { a: 1, c: {} }
 *
 * objectPrune([1, undefined, { a: undefined }, [undefined]]); // Returns: [1, {}, []]
 *
 * objectPrune([undefined, undefined]); // Returns: []
 *
 * objectPrune({ date: new Date() }); // Returns: { date: DateInstance }
 *
 * objectPrune({ a: { b: undefined } }, { deep: false }); // Returns: { a: { b: undefined } }
 *
 * objectPrune({ a: [1, undefined] }, { arrays: false }); // Returns: { a: [1, undefined] }
 */
export const objectPrune = <T>(object: T, options?: PruneObjectOptions): T => {
	return pruneValue(object, { ...defaults, ...options }) as T;
};

const pruneValue = (value: unknown, options: Required<PruneObjectOptions>): unknown => {
	if (Array.isArray(value)) {
		if (!options.arrays) return value;

		// Single-pass loop avoids an intermediate mapped array
		const items: unknown[] = [];
		for (const item of value as unknown[]) {
			const pruned = options.deep ? pruneValue(item, options) : item;
			if (pruned !== undefined) items.push(pruned);
		}

		return items;
	}

	// Cheap typeof guard first before instanceof checks
	if (typeof value !== 'object' || value === null) return value;
	if (options.preserveDate && value instanceof Date) return value;
	if (options.preserveRegExp && value instanceof RegExp) return value;

	// Object.keys() only iterates own enumerable string-keyed properties,
	// equivalent to for...in + hasOwn but without the prototype walk
	const result: Record<string, unknown> = {};
	for (const key of Object.keys(value)) {
		const child = (value as Record<string, unknown>)[key];
		const pruned = options.deep ? pruneValue(child, options) : child;
		if (pruned !== undefined) {
			result[key] = pruned;
		}
	}

	return result;
};
