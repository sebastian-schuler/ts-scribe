import type { DeepMerge, DeepMergeTuple } from '../types/common-types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Options for {@link objectDeepMerge.withOptions}.
 *
 * @category Object
 */
export type DeepMergeOptions = {
	/**
	 * Strategy for merging arrays.
	 *
	 * - `'replace'` (default): the second array fully replaces the first.
	 * - `'concat'`: arrays are concatenated (second appended to first).
	 */
	arrayMerge?: 'replace' | 'concat';

	/**
	 * Maximum recursion depth before bailing out (default: `50`).
	 * Beyond this depth, the second value overwrites the first without further
	 * recursion, preventing stack overflows on deeply nested or malicious input.
	 */
	maxDepth?: number;
};

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const defaults: Required<DeepMergeOptions> = {
	arrayMerge: 'replace',
	maxDepth: 50,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Check whether a value is a "special" built-in object that should be
 * treated as an atomic scalar during merging (second overwrites first).
 */
function isSpecialObject(value: unknown): boolean {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	return (
		value instanceof Date ||
		value instanceof RegExp ||
		value instanceof Error ||
		value instanceof Map ||
		value instanceof Set ||
		value instanceof WeakMap ||
		value instanceof WeakSet ||
		value instanceof ArrayBuffer ||
		(typeof SharedArrayBuffer !== 'undefined' && value instanceof SharedArrayBuffer) ||
		ArrayBuffer.isView(value)
	);
}

/**
 * Merge two arrays according to the configured strategy.
 *
 * Both `a` and `b` are guaranteed to be arrays at this point.  The caller
 * must register a cycle-breaking placeholder in `visiting` (keyed on `b`)
 * pointing to `result` **before** calling this function so that circular
 * references resolve to the same array instance.
 *
 * Elements are pushed into `result` in-place.
 */
// eslint-disable-next-line max-params
function mergeArrays(
	a: unknown[],
	b: unknown[],
	options: Required<DeepMergeOptions>,
	visiting: WeakMap<object, unknown>,
	depth: number,
	result: unknown[],
): void {
	if (options.arrayMerge === 'concat') {
		for (const element of a) {
			result.push(mergeTwo(element, element, options, visiting, depth + 1));
		}

		for (const element of b) {
			result.push(mergeTwo(element, element, options, visiting, depth + 1));
		}
	} else {
		// Replace — walk B's elements (they may contain nested objects).
		for (const element of b) {
			result.push(mergeTwo(element, element, options, visiting, depth + 1));
		}
	}
}

/**
 * Recursively merge two values into a new value.
 *
 * @param a        - Base value (lower precedence).
 * @param b        - Overriding value (higher precedence).
 * @param options  - Resolved options.
 * @param visiting - WeakMap tracking objects currently on the recursion
 *                   stack (cycle detection). Each entry maps the original
 *                   B object to its result placeholder. Entries are removed
 *                   before the function returns so that the same B-reference
 *                   encountered at a *different* merge path is processed
 *                   independently with its own A-value.
 * @param depth    - Current recursion depth.
 * @returns A new merged value. Neither `a` nor `b` are mutated.
 */
// eslint-disable-next-line max-params
function mergeTwo(
	a: unknown,
	b: unknown,
	options: Required<DeepMergeOptions>,
	visiting: WeakMap<object, unknown>,
	depth: number,
): unknown {
	// --- Primitives & null: B always wins -----------------------------------
	if (typeof b !== 'object' || b === null) {
		return b;
	}

	// When a is not an object but b is, we still want to produce a fresh
	// object graph.  Normalise a to an empty counterpart of b's structural
	// type so the array / plain-object branches below naturally deep-clone b
	// element-by-element / key-by-key.
	if (typeof a !== 'object' || a === null) {
		if (isSpecialObject(b)) {
			return b; // Special objects are atomic – return as-is.
		}

		a = Array.isArray(b) ? [] : {};
	}

	// --- Special built-in objects: treat as atomic (B wins) -----------------
	if (isSpecialObject(a) || isSpecialObject(b)) {
		return b;
	}

	// --- Depth guard --------------------------------------------------------
	if (depth >= options.maxDepth) {
		return b;
	}

	// --- Cycle detection ----------------------------------------------------
	// If B is already on the recursion stack we have a cycle; return the
	// placeholder that was registered when B was first encountered so that
	// the circular reference points to the correct result object.
	if (visiting.has(b)) {
		return visiting.get(b);
	}

	// --- Arrays -------------------------------------------------------------
	if (Array.isArray(a) && Array.isArray(b)) {
		const result: unknown[] = [];
		visiting.set(b, result);
		mergeArrays(a, b, options, visiting, depth, result);
		visiting.delete(b);
		return result;
	}

	// If only one side is an array, B wins.
	if (Array.isArray(a) || Array.isArray(b)) {
		return b;
	}

	// --- Plain objects ------------------------------------------------------
	// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
	const sourceA = a as Record<string, unknown>;
	// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
	const sourceB = b as Record<string, unknown>;

	// Placeholder entry to break cycles.
	const result: Record<string, unknown> = {};
	visiting.set(b, result);

	// Symbols are intentionally excluded — they are rare in data objects and
	// including them would force a polyfill path for `Object.getOwnPropertySymbols`
	// in older runtimes. Only enumerable string keys are merged.
	const keys = [...new Set([...Object.keys(sourceA), ...Object.keys(sourceB)])];

	for (const key of keys) {
		result[key] = Object.hasOwn(sourceB, key)
			? mergeTwo(sourceA[key], sourceB[key], options, visiting, depth + 1)
			: sourceA[key];
	}

	visiting.delete(b);
	return result;
}

/**
 * Core merge logic shared by {@link objectDeepMerge} and
 * {@link objectDeepMerge.withOptions}.
 */
function mergeAll(objects: any[], resolved: Required<DeepMergeOptions>): unknown {
	if (objects.length === 0) {
		return {};
	}

	if (objects.length === 1) {
		// Deep-clone via structuredClone so the caller always gets a fresh
		// object graph (consistent immutability guarantee).
		return structuredClone(objects[0]);
	}

	const visiting = new WeakMap<object, unknown>();
	let accumulator: unknown = objects[0];

	for (let index = 1; index < objects.length; index++) {
		accumulator = mergeTwo(accumulator, objects[index], resolved, visiting, 0);
	}

	return accumulator;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Deeply merge two or more objects into a new object.
 *
 * Merging is **left-to-right**: each subsequent object's properties take
 * precedence over the previous ones. For plain objects, properties are
 * recursively merged. Primitives, arrays (by default), and special built-in
 * types (`Date`, `RegExp`, `Map`, `Set`, etc.) are overwritten by the
 * right-hand value.
 *
 * Use {@link objectDeepMerge.withOptions} when you need non-default merging
 * behaviour (e.g. array concatenation or a custom depth limit).
 *
 * **Immutability**: Inputs are never modified. Every call returns a fresh
 * object graph.
 *
 * **Circular references**: Detected and handled safely via internal WeakMap
 * tracking — no infinite loops.
 *
 * @category Object
 * @param objects - Two or more objects to merge.
 * @returns A new deeply-merged object.
 *
 * @template T - The tuple of types to merge.
 *
 * @example
 * // Basic merge
 * const a = { name: 'Alice', meta: { visits: 1 } };
 * const b = { meta: { lastSeen: new Date() }, age: 30 };
 * const merged = objectDeepMerge(a, b);
 * // { name: 'Alice', meta: { visits: 1, lastSeen: ... }, age: 30 }
 *
 * @example
 * // Multiple objects
 * const merged = objectDeepMerge({ a: 1 }, { b: 2 }, { c: 3 });
 * // { a: 1, b: 2, c: 3 }
 *
 * @example
 * // Custom options via withOptions
 * const merged = objectDeepMerge.withOptions({ arrayMerge: 'concat' })(
 *   { tags: ['js'] },
 *   { tags: ['css'] }
 * );
 * // { tags: ['js', 'css'] }
 *
 * @remarks
 * - **Array default**: arrays are replaced, not concatenated. Use
 *   {@link objectDeepMerge.withOptions} with `{ arrayMerge: 'concat' }` to
 *   concatenate instead.
 * - **Special types** (`Date`, `RegExp`, `Map`, `Set`, `Error`, `ArrayBuffer`,
 *   `SharedArrayBuffer`, typed arrays, etc.) are treated as atomic — the
 *   right-hand value overwrites the left.
 * - **`null`** is treated as a primitive, not an object. A `null` on the
 *   right will overwrite any left-hand value.
 * - **Depth limit**: defaults to 50 to prevent stack overflow on
 *   pathological input. Adjust via
 *   `objectDeepMerge.withOptions({ maxDepth: … })`.
 * - **Symbol keys** are not merged (only enumerable string keys).
 */
export function objectDeepMerge<T1, T2>(a: T1, b: T2): DeepMerge<T1, T2>;
export function objectDeepMerge<T1, T2, T3>(a: T1, b: T2, c: T3): DeepMerge<DeepMerge<T1, T2>, T3>;
export function objectDeepMerge<T1, T2, T3, T4>(
	a: T1,
	b: T2,
	c: T3,
	d: T4,
): DeepMerge<DeepMerge<DeepMerge<T1, T2>, T3>, T4>;
// eslint-disable-next-line max-params
export function objectDeepMerge<T1, T2, T3, T4, T5>(
	a: T1,
	b: T2,
	c: T3,
	d: T4,
	fifth: T5,
): DeepMerge<DeepMerge<DeepMerge<DeepMerge<T1, T2>, T3>, T4>, T5>;
export function objectDeepMerge<T extends any[]>(...objects: T): DeepMergeTuple<T>;
export function objectDeepMerge(...args: any[]): any {
	return mergeAll(args, defaults);
}

/**
 * Create a pre-configured deep-merge function with custom options.
 *
 * This is the recommended way to use non-default merge behaviour (e.g.
 * array concatenation or a custom depth limit). It avoids the ambiguity
 * of detecting an options bag among the objects to merge.
 *
 * @category Object
 * @param options - Merge options to apply.
 * @returns A function that accepts one or more objects and returns their
 *   deep merge using the given options.
 *
 * @example
 * const merge = objectDeepMerge.withOptions({ arrayMerge: 'concat' });
 * merge({ tags: ['js'] }, { tags: ['css'] });
 * // { tags: ['js', 'css'] }
 *
 * @example
 * const merge = objectDeepMerge.withOptions({ maxDepth: 10 });
 * merge(deepA, deepB);
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace objectDeepMerge {
	export function withOptions(options: DeepMergeOptions): <T extends any[]>(...objects: T) => DeepMergeTuple<T> {
		const resolved: Required<DeepMergeOptions> = { ...defaults, ...options };
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-type-assertion
		return (...objects: any[]) => mergeAll(objects, resolved) as any;
	}
}
