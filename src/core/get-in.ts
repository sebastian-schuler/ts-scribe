/** @internal */
type PathKey<T> = T extends null | undefined
	? never
	: NonNullable<T> extends readonly unknown[]
		? number
		: NonNullable<T> extends ReadonlyMap<infer K extends string | number, unknown>
			? K
			: NonNullable<T> extends object
				? keyof NonNullable<T> & (string | number)
				: never;

/** @internal */
type Step<T, K extends string | number> = T extends null | undefined
	? undefined
	: NonNullable<T> extends ReadonlyArray<infer Item>
		? K extends number
			? Item | undefined
			: undefined
		: NonNullable<T> extends ReadonlyMap<unknown, infer V>
			? V | undefined
			: K extends keyof NonNullable<T>
				? NonNullable<T>[K]
				: undefined;

// Value type after following the first N keys from T.
// Keeping these aliases short is what makes the per-length overload signatures readable.
type Reach1<T, K0 extends string | number> = Step<T, K0>;
type Reach2<T, K0 extends string | number, K1 extends string | number> = Step<Reach1<T, K0>, K1>;
type Reach3<T, K0 extends string | number, K1 extends string | number, K2 extends string | number> = Step<
	Reach2<T, K0, K1>,
	K2
>;
type Reach4<
	T,
	K0 extends string | number,
	K1 extends string | number,
	K2 extends string | number,
	K3 extends string | number,
> = Step<Reach3<T, K0, K1, K2>, K3>;
type Reach5<
	T,
	K0 extends string | number,
	K1 extends string | number,
	K2 extends string | number,
	K3 extends string | number,
	K4 extends string | number,
> = Step<Reach4<T, K0, K1, K2, K3>, K4>;
type Reach6<
	T,
	K0 extends string | number,
	K1 extends string | number,
	K2 extends string | number,
	K3 extends string | number,
	K4 extends string | number,
	K5 extends string | number,
> = Step<Reach5<T, K0, K1, K2, K3, K4>, K5>;

/**
 * Resolves the type at the end of a path tuple `P` walked into `T`.
 *
 * Useful when you want to derive the return type of a {@link getIn} call without
 * calling the function itself.
 *
 * @example
 * ```ts
 * type Result = DeepGet<typeof data, ['user', 'profile', 'name']>;
 * // string
 * ```
 *
 * @category Core
 * @template T - Root object type.
 * @template P - Tuple of string / number keys describing the path.
 */
export type DeepGet<T, P extends ReadonlyArray<string | number>> = P extends []
	? T
	: P extends [infer K extends string | number, ...infer Rest extends ReadonlyArray<string | number>]
		? DeepGet<Step<T, K>, Rest>
		: never;

// ---------------------------------------------------------------------------
// Overloaded signatures
//
// Each overload constrains K_n to PathKey<result of following K_0…K_{n-1}>.
// This is what drives autocomplete at every position in the tuple — the
// language server can enumerate valid members because they are concrete union
// members, not the unenumerable `string` or `number` intrinsics.
// ---------------------------------------------------------------------------

// empty path – identity
export function getIn<T>(object: T, path: []): T;
// Depth 1
export function getIn<T, K0 extends PathKey<T>, D>(
	object: T,
	path: [K0],
	defaultValue: D,
): Exclude<Reach1<T, K0>, undefined> | D;
export function getIn<T, K0 extends PathKey<T>>(object: T, path: [K0]): Reach1<T, K0>;
// Depth 2
export function getIn<T, K0 extends PathKey<T>, K1 extends PathKey<Reach1<T, K0>>, D>(
	object: T,
	path: [K0, K1],
	defaultValue: D,
): Exclude<Reach2<T, K0, K1>, undefined> | D;
export function getIn<T, K0 extends PathKey<T>, K1 extends PathKey<Reach1<T, K0>>>(
	object: T,
	path: [K0, K1],
): Reach2<T, K0, K1>;
// Depth 3
export function getIn<
	T,
	K0 extends PathKey<T>,
	K1 extends PathKey<Reach1<T, K0>>,
	K2 extends PathKey<Reach2<T, K0, K1>>,
	D,
>(object: T, path: [K0, K1, K2], defaultValue: D): Exclude<Reach3<T, K0, K1, K2>, undefined> | D;
export function getIn<
	T,
	K0 extends PathKey<T>,
	K1 extends PathKey<Reach1<T, K0>>,
	K2 extends PathKey<Reach2<T, K0, K1>>,
>(object: T, path: [K0, K1, K2]): Reach3<T, K0, K1, K2>;
// Depth 4
export function getIn<
	T,
	K0 extends PathKey<T>,
	K1 extends PathKey<Reach1<T, K0>>,
	K2 extends PathKey<Reach2<T, K0, K1>>,
	K3 extends PathKey<Reach3<T, K0, K1, K2>>,
	D,
>(object: T, path: [K0, K1, K2, K3], defaultValue: D): Exclude<Reach4<T, K0, K1, K2, K3>, undefined> | D;
export function getIn<
	T,
	K0 extends PathKey<T>,
	K1 extends PathKey<Reach1<T, K0>>,
	K2 extends PathKey<Reach2<T, K0, K1>>,
	K3 extends PathKey<Reach3<T, K0, K1, K2>>,
>(object: T, path: [K0, K1, K2, K3]): Reach4<T, K0, K1, K2, K3>;
// Depth 5
export function getIn<
	T,
	K0 extends PathKey<T>,
	K1 extends PathKey<Reach1<T, K0>>,
	K2 extends PathKey<Reach2<T, K0, K1>>,
	K3 extends PathKey<Reach3<T, K0, K1, K2>>,
	K4 extends PathKey<Reach4<T, K0, K1, K2, K3>>,
	D,
>(object: T, path: [K0, K1, K2, K3, K4], defaultValue: D): Exclude<Reach5<T, K0, K1, K2, K3, K4>, undefined> | D;
export function getIn<
	T,
	K0 extends PathKey<T>,
	K1 extends PathKey<Reach1<T, K0>>,
	K2 extends PathKey<Reach2<T, K0, K1>>,
	K3 extends PathKey<Reach3<T, K0, K1, K2>>,
	K4 extends PathKey<Reach4<T, K0, K1, K2, K3>>,
>(object: T, path: [K0, K1, K2, K3, K4]): Reach5<T, K0, K1, K2, K3, K4>;
// Depth 6
export function getIn<
	T,
	K0 extends PathKey<T>,
	K1 extends PathKey<Reach1<T, K0>>,
	K2 extends PathKey<Reach2<T, K0, K1>>,
	K3 extends PathKey<Reach3<T, K0, K1, K2>>,
	K4 extends PathKey<Reach4<T, K0, K1, K2, K3>>,
	K5 extends PathKey<Reach5<T, K0, K1, K2, K3, K4>>,
	D,
>(
	object: T,
	path: [K0, K1, K2, K3, K4, K5],
	defaultValue: D,
): Exclude<Reach6<T, K0, K1, K2, K3, K4, K5>, undefined> | D;
export function getIn<
	T,
	K0 extends PathKey<T>,
	K1 extends PathKey<Reach1<T, K0>>,
	K2 extends PathKey<Reach2<T, K0, K1>>,
	K3 extends PathKey<Reach3<T, K0, K1, K2>>,
	K4 extends PathKey<Reach4<T, K0, K1, K2, K3>>,
	K5 extends PathKey<Reach5<T, K0, K1, K2, K3, K4>>,
>(object: T, path: [K0, K1, K2, K3, K4, K5]): Reach6<T, K0, K1, K2, K3, K4, K5>;
// Fallback for paths deeper than depth 6 – requires ≥7 elements so invalid shorter paths still produce a type error
export function getIn(
	object: unknown,
	path: [
		string | number,
		string | number,
		string | number,
		string | number,
		string | number,
		string | number,
		string | number,
		...Array<string | number>,
	],
	defaultValue?: unknown,
): unknown;
/**
 * Safely traverses `object` along a typed path tuple and returns the value at
 * that location, or `defaultValue` if any step along the way is `null` or
 * `undefined`.
 *
 * - Supports plain objects, arrays (including negative indices), and `Map`s.
 * - Every position in the `path` tuple is autocompleted and type-checked by
 *   the language server — including positions that follow numeric array indices.
 * - Paths up to depth 6 have fully inferred return types. Deeper paths compile
 *   without error but return `unknown`.
 *
 * > **Note:** passing `undefined` as `defaultValue` is indistinguishable from
 * > omitting it — the function cannot tell whether a key is missing or
 * > explicitly holds `undefined`.
 *
 * @example Basic property access
 * ```ts
 * getIn(data, ['user', 'profile', 'name'])
 * // 'Alice'
 * ```
 *
 * @example Through an array
 * ```ts
 * getIn(data, ['user', 'profile', 'addresses', 0, 'city'])
 * // 'NYC'
 * ```
 *
 * @example With a default value for a missing / undefined key
 * ```ts
 * getIn(data, ['user', 'profile', 'age'], 25)
 * // 25
 * ```
 *
 * @example Negative array index (Python-style)
 * ```ts
 * getIn(['a', 'b', 'c'], [-1])
 * // 'c'
 * ```
 *
 * @example With a Map
 * ```ts
 * const map = new Map([['key', { value: 42 }]]);
 * getIn(map, ['key', 'value'])
 * // 42
 * ```
 *
 * @category Core
 * @template T - The root object type.
 * @template D - The type of the fallback default value.
 * @param object - The root value to traverse.
 * @param path - Tuple of string keys or numeric indices describing the path.
 * @param defaultValue - Returned when the resolved value is `undefined`.
 * @returns The value at the given path, or `defaultValue` if any step is nullish.
 */
export function getIn(object: unknown, path: ReadonlyArray<string | number>, defaultValue?: unknown): unknown {
	let current: unknown = object;

	for (const key of path) {
		if (current === null || current === undefined) {
			return defaultValue;
		}

		if (current instanceof Map) {
			current = current.get(key);
		} else if (Array.isArray(current)) {
			const array = current as unknown[];
			const idx = typeof key === 'number' ? key : Number(key);
			current = array[idx < 0 ? array.length + idx : idx];
		} else {
			current = (current as Record<string | number, unknown>)[key];
		}
	}

	return current === undefined ? defaultValue : current;
}
