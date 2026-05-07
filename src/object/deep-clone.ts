/**
 * Options for {@link objectDeepClone}.
 */
export type DeepCloneOptions = {
	/**
	 * When `true`, enumerable properties from the prototype chain are flattened
	 * into own properties before cloning. Defaults to `false`.
	 */
	protoProps?: boolean;
};

/**
 * Creates a deep clone of a value using the native `structuredClone` algorithm.
 *
 * This is a thin, production-safe wrapper around the built-in `structuredClone`,
 * which handles all standard cloneable types: primitives, plain objects, arrays,
 * `Date`, `RegExp`, `Map`, `Set`, `ArrayBuffer`, typed arrays, and circular
 * references.
 *
 * ---
 * Example:
 * ```ts
 * const obj = { a: 1, b: { c: 2 } };
 * const clone = objectDeepClone(obj);
 * console.log(clone); // { a: 1, b: { c: 2 } }
 * ```
 *
 * @category Object
 * @param object - The value to deep clone.
 * @param options - Optional configuration.
 * @returns A structurally identical deep clone of the input.
 *
 * @throws {Error} If the value contains non-cloneable data (functions, symbols,
 *   or DOM nodes) that `structuredClone` cannot handle.
 */
export function objectDeepClone<T>(object: T, options?: DeepCloneOptions): T {
	// Primitives and null are returned as-is (identity clone).
	if (typeof object !== 'object' || object === null) {
		return object;
	}

	// The built-in structuredClone handles circular references, Date,
	// RegExp, Map, Set, ArrayBuffer, and typed arrays automatically.
	if (!options?.protoProps) {
		return cloneSafe(object);
	}

	// When protoProps is requested, flatten prototype chain properties
	// into own properties first, then hand off to structuredClone.
	return cloneSafe(flattenPrototypeChain(object));
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Calls `structuredClone` and re-throws `DataCloneError` with a friendlier
 * message so callers know *why* their value could not be cloned.
 */
function cloneSafe<T>(value: T): T {
	try {
		return structuredClone(value);
	} catch (error: unknown) {
		if (error instanceof DOMException && error.name === 'DataCloneError') {
			throw new Error(
				'objectDeepClone: the value contains data that cannot be cloned (such as functions, symbols, or DOM nodes).',
				{ cause: error },
			);
		}

		throw error;
	}
}

/**
 * Recursively flattens enumerable prototype-chain properties into own
 * properties so that `structuredClone` can see them.
 *
 * - `Date`, `RegExp`, `ArrayBuffer`, and typed-array views are returned
 *   unchanged; `structuredClone` handles them natively with full fidelity.
 * - `Map` and `Set` are recursively walked so that their entries / members
 *   also get prototype-chain flattening applied.
 * - Arrays are mapped recursively.
 * - Plain objects have every enumerable property (own + inherited) copied
 *   into a fresh object, recursing into each value.
 */
function flattenPrototypeChain<T>(value: T): T {
	if (typeof value !== 'object' || value === null) {
		return value;
	}

	// Let structuredClone preserve these built-in types as-is.
	if (value instanceof Date || value instanceof RegExp || ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
		return value;
	}

	// Recurse into Map entries so prototype-bearing keys / values get
	// flattened before structuredClone sees them.
	if (value instanceof Map) {
		const entries = [...value].map(
			([key, value_]) => [flattenPrototypeChain(key), flattenPrototypeChain(value_)] as const,
		);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
		return new Map(entries) as T;
	}

	// Recurse into Set members.
	if (value instanceof Set) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-unsafe-return
		return new Set([...value].map((member) => flattenPrototypeChain(member))) as T;
	}

	if (Array.isArray(value)) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-unsafe-return
		return value.map((element) => flattenPrototypeChain(element)) as T;
	}

	// Remaining case: plain object.
	// After filtering out primitives, built-in types, Maps, Sets, and arrays
	// we know this is a dictionary-like object.
	// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
	const source = value as Record<string, unknown>;

	// Copy every enumerable property (own + inherited) into a fresh plain
	// object, recursing into each value.
	// Intentionally using for-in without hasOwn: we WANT prototype props.
	const flat: Record<string, unknown> = {};
	// eslint-disable-next-line guard-for-in
	for (const key in source) {
		flat[key] = flattenPrototypeChain(source[key]);
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
	return flat as T;
}
