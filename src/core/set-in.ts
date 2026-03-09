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
 * Resolves the type produced by immutably setting value `V` at path `P` in `T`.
 *
 * Useful when you want to derive the return type of a {@link setIn} call without
 * calling the function itself.
 *
 * @example
 * ```ts
 * type Original = { user: { profile: { name: string } } };
 * type Updated = DeepSet<Original, ['user', 'profile', 'name'], 'Alice'>;
 * // { user: { profile: { name: string } } }
 * ```
 *
 * @category Core
 * @template T - Root object type.
 * @template P - Tuple of string / number keys describing the path.
 * @template V - Type of the value to set.
 */
export type DeepSet<T, P extends ReadonlyArray<string | number>, V> = P extends [] ? V : T;

// Empty path – replace root
export function setIn<T, V>(object: T, path: [], value: V): V;
// Depth 1
export function setIn<T, K0 extends PathKey<T>, V extends Exclude<Reach1<T, K0>, undefined>>(
	object: T,
	path: [K0],
	value: V,
): T;
// Depth 2
export function setIn<
	T,
	K0 extends PathKey<T>,
	K1 extends PathKey<Reach1<T, K0>>,
	V extends Exclude<Reach2<T, K0, K1>, undefined>,
>(object: T, path: [K0, K1], value: V): T;
// Depth 3
export function setIn<
	T,
	K0 extends PathKey<T>,
	K1 extends PathKey<Reach1<T, K0>>,
	K2 extends PathKey<Reach2<T, K0, K1>>,
	V extends Exclude<Reach3<T, K0, K1, K2>, undefined>,
>(object: T, path: [K0, K1, K2], value: V): T;
// Depth 4
export function setIn<
	T,
	K0 extends PathKey<T>,
	K1 extends PathKey<Reach1<T, K0>>,
	K2 extends PathKey<Reach2<T, K0, K1>>,
	K3 extends PathKey<Reach3<T, K0, K1, K2>>,
	V extends Exclude<Reach4<T, K0, K1, K2, K3>, undefined>,
>(object: T, path: [K0, K1, K2, K3], value: V): T;
// Depth 5
export function setIn<
	T,
	K0 extends PathKey<T>,
	K1 extends PathKey<Reach1<T, K0>>,
	K2 extends PathKey<Reach2<T, K0, K1>>,
	K3 extends PathKey<Reach3<T, K0, K1, K2>>,
	K4 extends PathKey<Reach4<T, K0, K1, K2, K3>>,
	V extends Exclude<Reach5<T, K0, K1, K2, K3, K4>, undefined>,
>(object: T, path: [K0, K1, K2, K3, K4], value: V): T;
// Depth 6
export function setIn<
	T,
	K0 extends PathKey<T>,
	K1 extends PathKey<Reach1<T, K0>>,
	K2 extends PathKey<Reach2<T, K0, K1>>,
	K3 extends PathKey<Reach3<T, K0, K1, K2>>,
	K4 extends PathKey<Reach4<T, K0, K1, K2, K3>>,
	K5 extends PathKey<Reach5<T, K0, K1, K2, K3, K4>>,
	V extends Exclude<Reach6<T, K0, K1, K2, K3, K4, K5>, undefined>,
>(object: T, path: [K0, K1, K2, K3, K4, K5], value: V): T;
// Generic fallback for dynamic or shape-expanding paths
export function setIn<T, V>(object: T, path: ReadonlyArray<string | number>, value: V): unknown;
// Fallback for paths deeper than depth 6
export function setIn(
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
	value: unknown,
): unknown;

/**
 * Immutably sets a value at a nested path, returning a new root object.
 *
 * - Supports plain objects, arrays (including negative indices), and `Map`s.
 * - Clones only the containers on the updated path (structural sharing).
 * - Unaffected sibling branches retain their original references.
 * - Missing intermediate containers are auto-created as `{}` or `[]` depending
 *   on whether the next key is numeric.
 * - Every position in the `path` tuple is autocompleted and type-checked by
 *   the language server for known types.
 * - Paths up to depth 6 have fully inferred return types. Deeper paths compile
 *   without error but return `unknown`.
 *
 * > **Note:** For dynamic paths or paths that create fields not present in the
 * > original type, the return type falls back to `unknown`. Use type assertions
 * > when needed.
 *
 * @example Basic nested update
 * ```ts
 * const data = { user: { profile: { name: 'Alice' } } };
 * const updated = setIn(data, ['user', 'profile', 'name'], 'Bob');
 * // { user: { profile: { name: 'Bob' } } }
 * // Original data.user.profile.name is still 'Alice'
 * ```
 *
 * @example Updating array elements
 * ```ts
 * const data = { items: [{ id: 1 }, { id: 2 }] };
 * const updated = setIn(data, ['items', 1, 'id'], 99);
 * // { items: [{ id: 1 }, { id: 99 }] }
 * ```
 *
 * @example Negative array index (Python-style)
 * ```ts
 * const data = { tags: ['a', 'b', 'c'] };
 * const updated = setIn(data, ['tags', -1], 'z');
 * // { tags: ['a', 'b', 'z'] }
 * ```
 *
 * @example Creating missing intermediate paths
 * ```ts
 * const data = {};
 * const updated = setIn(data, ['user', 'profile', 'name'], 'Alice');
 * // { user: { profile: { name: 'Alice' } } }
 * ```
 *
 * @example Creating arrays when path contains numeric keys
 * ```ts
 * const data = {};
 * const updated = setIn(data, ['items', 0, 'value'], 'first');
 * // { items: [{ value: 'first' }] }
 * ```
 *
 * @example With a Map
 * ```ts
 * const map = new Map([['user', { score: 100 }]]);
 * const updated = setIn(map, ['user', 'score'], 200);
 * // Map has {user: { score: 200 }}; original map unchanged
 * ```
 *
 * @example Deeply nested arrays
 * ```ts
 * const data = { matrix: [[1, 2], [3, 4]] };
 * const updated = setIn(data, ['matrix', 1, 0], 99);
 * // { matrix: [[1, 2], [99, 4]] }
 * ```
 *
 * @category Core
 * @template T - The root object type.
 * @template V - The type of the value to set.
 * @param object - The root value to update immutably.
 * @param path - Tuple of string keys or numeric indices describing the path.
 * @param value - The value to set at the given path.
 * @returns A new root object with the value set at the specified path. Original object is unchanged.
 */
export function setIn(object: unknown, path: ReadonlyArray<string | number>, value: unknown): unknown {
	if (path.length === 0) {
		return value;
	}

	const createContainerForKey = (key: string | number): Record<string | number, unknown> | unknown[] => {
		return typeof key === 'number' ? [] : {};
	};

	const cloneObject = (object_: object): Record<string | number, unknown> => {
		const prototype = Reflect.getPrototypeOf(object_);
		const clone = Object.create(prototype) as Record<string | number, unknown>;
		return Object.assign(clone, object_);
	};

	const normalizeArrayIndex = (key: string | number, length: number): number | null => {
		if (typeof key === 'number' && Number.isInteger(key)) {
			const normalized = key < 0 ? length + key : key;
			return normalized >= 0 ? normalized : null;
		}

		if (typeof key === 'string' && /^-?\d+$/.test(key)) {
			const parsed = Number(key);
			const normalized = parsed < 0 ? length + parsed : parsed;
			return Number.isInteger(normalized) && normalized >= 0 ? normalized : null;
		}

		return null;
	};

	const assignAtPath = (current: unknown, depth: number): unknown => {
		const key = path[depth];
		const isLeaf = depth === path.length - 1;

		if (current instanceof Map) {
			const clone = new Map(current);
			const previous: unknown = clone.get(key);
			clone.set(key, isLeaf ? value : assignAtPath(previous, depth + 1));
			return clone;
		}

		if (Array.isArray(current)) {
			const source = current as unknown[];
			const clone = [...source];
			const recordClone = clone as unknown as Record<string | number, unknown>;
			const idx = normalizeArrayIndex(key, clone.length);

			if (idx === null) {
				recordClone[key] = isLeaf ? value : assignAtPath(recordClone[key], depth + 1);
			} else {
				clone[idx] = isLeaf ? value : assignAtPath(clone[idx], depth + 1);
			}

			return clone;
		}

		const writable = (
			current !== null && typeof current === 'object' ? cloneObject(current) : createContainerForKey(key)
		) as Record<string | number, unknown>;

		writable[key] = isLeaf ? value : assignAtPath(writable[key], depth + 1);
		return writable;
	};

	return assignAtPath(object, 0);
}
