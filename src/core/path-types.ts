/**
 * Shared type-level helpers used by {@link getIn} and {@link setIn}.
 *
 * @internal
 */

/** Valid key type for a given container. */
export type PathKey<T> = T extends null | undefined
	? never
	: NonNullable<T> extends readonly unknown[]
		? number
		: NonNullable<T> extends ReadonlyMap<infer K extends string | number, unknown>
			? K
			: NonNullable<T> extends object
				? keyof NonNullable<T> & (string | number)
				: never;

/** Value type at key `K` inside `T`, or `undefined` for out-of-bounds / missing keys. */
export type Step<T, K extends string | number> = T extends null | undefined
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
export type Reach1<T, K0 extends string | number> = Step<T, K0>;
export type Reach2<T, K0 extends string | number, K1 extends string | number> = Step<Reach1<T, K0>, K1>;
export type Reach3<T, K0 extends string | number, K1 extends string | number, K2 extends string | number> = Step<
	Reach2<T, K0, K1>,
	K2
>;
export type Reach4<
	T,
	K0 extends string | number,
	K1 extends string | number,
	K2 extends string | number,
	K3 extends string | number,
> = Step<Reach3<T, K0, K1, K2>, K3>;
export type Reach5<
	T,
	K0 extends string | number,
	K1 extends string | number,
	K2 extends string | number,
	K3 extends string | number,
	K4 extends string | number,
> = Step<Reach4<T, K0, K1, K2, K3>, K4>;
export type Reach6<
	T,
	K0 extends string | number,
	K1 extends string | number,
	K2 extends string | number,
	K3 extends string | number,
	K4 extends string | number,
	K5 extends string | number,
> = Step<Reach5<T, K0, K1, K2, K3, K4>, K5>;
