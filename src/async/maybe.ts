import { type Mandatory, type NonNullish, type Nullish } from '../types/common-types.js';

const maybe$ = Symbol.for('@@maybe');

/** @internal */
type MaybeOk<TypedValue> = Maybe<TypedValue> & {
	readonly empty: false;
	readonly error: undefined | null;
	readonly ok: true;
};

/** @internal */
type MaybeNotOk<TypedValue> = Maybe<TypedValue> & {
	readonly empty: true;
	readonly ok: false;
	readonly value: never;
};

/**
 * A lightweight Maybe monad for representing values that may or may not be
 * present, with optional error context.
 *
 * A `Maybe<T>` is always in one of two states:
 * - **ok** – holds a non-nullish `value` of type `T`.
 * - **empty** – holds no value; optionally holds an `error`.
 *
 * ### Reading state
 * Use the `ok`, `empty`, `value`, and `error` properties, or `toArray()`.
 *
 * ### Deriving new monads
 * | Method | Behaviour |
 * |---|---|
 * | `map` | Transform the value (no-op when `empty`). |
 * | `filter` | Discard the value unless a predicate holds (no-op when `empty`). |
 * | `else` | Provide a fallback when `empty` **without** an error. |
 * | `catch` | Recover from an `error` (no-op without one). |
 *
 * ### Creating monads
 * Use the {@link maybe} factory and its static helpers
 * {@link maybe.empty} and {@link maybe.error}.
 *
 * @category Async
 *
 * @example
 * ```ts
 * // Basic value wrapping
 * const m = maybe(42);
 * m.ok;    // true
 * m.value; // 42
 *
 * // Chaining
 * const result = maybe<string>(fetchName())
 *   .map((name) => name.trim())
 *   .filter((name) => name.length > 0)
 *   .else('Anonymous')
 *   .value;
 *
 * // Error handling
 * const parsed = maybe(() => JSON.parse(rawInput))
 *   .catch(() => ({}));
 * ```
 */
type Maybe<TypedValue> = (
	| {
			readonly empty: true;
			readonly ok: false;
			readonly error: NonNullish | undefined | null;
			readonly value: never;
	  }
	| {
			readonly empty: false;
			readonly ok: true;
			readonly error: undefined | null;
			readonly value: Mandatory<TypedValue>;
	  }
) & {
	/** @internal */
	readonly [maybe$]: Maybe<TypedValue>;

	/**
	 * `true` if the monad does not hold a non-nullish value; always the inverse
	 * of `ok`.
	 *
	 * @example
	 * ```ts
	 * maybe(42).empty;   // false
	 * maybe(null).empty; // true
	 * ```
	 */
	readonly empty: boolean;

	/**
	 * The error associated with an `empty` monad, or `null` / `undefined` when
	 * no error is present (i.e. the monad is `ok` or was emptied via
	 * {@link maybe.empty}).
	 *
	 * @example
	 * ```ts
	 * maybe(42).error;                              // undefined
	 * maybe.empty().error;                          // null
	 * maybe.error(new Error('oops')).error;         // Error: oops
	 * maybe(() => { throw new Error('!'); }).error; // Error: !
	 * ```
	 */
	readonly error: NonNullish | undefined | null;

	/**
	 * `true` if the monad holds a non-nullish value; always the inverse of
	 * `empty`.
	 *
	 * @example
	 * ```ts
	 * maybe(42).ok;   // true
	 * maybe(null).ok; // false
	 * ```
	 */
	readonly ok: boolean;

	/**
	 * The non-nullish value held by an `ok` monad.
	 *
	 * @throws {Error} The associated `error` if one exists, or a `ReferenceError`
	 * when the monad is empty without an error.
	 *
	 * @example
	 * ```ts
	 * maybe(42).value;                      // 42
	 * maybe(null).value;                    // throws ReferenceError
	 * maybe.error(new Error('oops')).value; // throws Error: oops
	 * ```
	 */
	readonly value: Mandatory<TypedValue>;

	/**
	 * Returns `next` wrapped in a monad when the current monad is `empty`
	 * **and has no error**. Returns the current monad unchanged in every other
	 * case (i.e. when `ok`, or when `empty` with an error).
	 *
	 * `next` may be a plain value, a zero-argument factory, or `undefined`.
	 * Factory errors are caught and produce an error monad.
	 *
	 * @param next - Fallback value, factory, or `undefined`.
	 * @returns A monad for `next` or the current monad.
	 *
	 * @example
	 * ```ts
	 * maybe<number>(null).else(0).value;         // 0
	 * maybe<number>(null).else(() => 0).value;   // 0
	 * maybe(42).else(0).value;                   // 42  (ok – no-op)
	 * maybe.error(new Error('!')).else(0).error; // Error: ! (error – no-op)
	 * ```
	 */
	else<TypedNext>(next: TypedNext | (() => Nullish | TypedNext) | undefined): Maybe<TypedNext | TypedValue>;

	/**
	 * Returns a new monad produced by `next` when the current monad has an
	 * `error`. Returns the current monad unchanged when `ok` or `empty` without
	 * an error.
	 *
	 * Factory errors thrown inside `next` are caught and produce a new error
	 * monad.
	 *
	 * @param next - A function that receives the current error and returns a
	 * recovery value or `null` / `undefined` to stay empty.
	 * @returns A monad for the recovery value, or the current monad.
	 *
	 * @example
	 * ```ts
	 * maybe.error(new Error('oops'))
	 *   .catch((err) => `recovered: ${err.message}`)
	 *   .value; // 'recovered: oops'
	 *
	 * maybe(42).catch(() => 0).value;   // 42     (ok – no-op)
	 * maybe.empty().catch(() => 0).ok;  // false  (no error – no-op)
	 * ```
	 */
	catch<TypedNext>(next: (error: NonNullish) => Nullish | TypedNext): Maybe<TypedNext | TypedValue>;

	/**
	 * Returns an `empty` monad when the current monad is `ok` but `predicate`
	 * returns `false`. Returns the current monad unchanged when `empty`.
	 *
	 * Supports type-guard predicates to narrow the result type.
	 *
	 * @param predicate - A boolean-returning test, or a type-guard, applied to
	 * the current value.
	 * @returns A monad whose value satisfies the predicate, or an empty monad.
	 *
	 * @example
	 * ```ts
	 * maybe(42).filter((n) => n > 0).value; // 42
	 * maybe(-1).filter((n) => n > 0).empty; // true
	 *
	 * // Type-guard narrows the result type
	 * const m = maybe<string | number>('hello')
	 *   .filter((v): v is string => typeof v === 'string');
	 * m.value; // 'hello' (typed as string)
	 * ```
	 */
	filter<TypedNext extends TypedValue = TypedValue>(
		predicate: ((value: Mandatory<TypedValue>) => boolean) | ((value: TypedValue) => value is TypedNext),
	): Maybe<TypedNext>;

	/**
	 * Transforms the current value by applying `next` when the monad is `ok`.
	 * Returns an `empty` or error monad unchanged.
	 *
	 * If `next` returns a `Maybe`, that monad is returned as-is (flat-map
	 * behaviour). If `next` returns a nullish value, an empty monad is returned.
	 * Errors thrown inside `next` are caught and produce an error monad.
	 *
	 * @param next - A mapping function that receives the current value and
	 * returns the next value, `Maybe`, or `null` / `undefined`.
	 * @returns A monad wrapping the mapped value.
	 *
	 * @example
	 * ```ts
	 * maybe(21).map((n) => n * 2).value;         // 42
	 * maybe('hello').map((s) => s.length).value; // 5
	 * maybe<number>(null).map((n) => n * 2).ok;  // false  (empty – no-op)
	 *
	 * // Flat-map: returning a Maybe is unwrapped
	 * maybe(42).map((n) => maybe(n > 0 ? n : null)).value; // 42
	 *
	 * // Errors thrown in next are caught
	 * maybe(42).map(() => { throw new Error('!'); }).error; // Error: !
	 * ```
	 */
	map<TypedNext>(next: (value: Mandatory<TypedValue>) => Maybe<TypedNext> | Nullish | TypedNext): Maybe<TypedNext>;

	/**
	 * Returns a single-element tuple containing the value when `ok`, or an
	 * empty tuple when `empty`. Useful for destructuring or spreading into
	 * other arrays.
	 *
	 * @returns `[value]` when `ok`, otherwise `[]`.
	 *
	 * @example
	 * ```ts
	 * maybe(42).toArray();   // [42]
	 * maybe(null).toArray(); // []
	 *
	 * const results = [maybe(1), maybe(null), maybe(3)]
	 *   .flatMap((m) => m.toArray()); // [1, 3]
	 * ```
	 */
	toArray(): [] | [Mandatory<TypedValue>];
};

/** @internal */
const createOk = <TypedValue>(value: Mandatory<TypedValue>): MaybeOk<TypedValue> => {
	const instance: MaybeOk<TypedValue> = {
		get [maybe$]() {
			return instance;
		},
		empty: false,
		error: undefined,
		ok: true,
		value,
		else: () => instance,
		catch: () => instance,
		filter: (predicate) => maybe<any>(() => (predicate(value) ? instance : maybe.empty())),
		map: (next) => maybe(() => next(value)),
		toArray: () => [value],
	};

	return instance;
};

/** @internal */
const createEmpty = (error: NonNullish | undefined | null): MaybeNotOk<never> => {
	const instance: MaybeNotOk<never> = {
		get [maybe$]() {
			return instance;
		},
		empty: true,
		error,
		ok: false,
		get value(): never {
			throw error instanceof Error ? error : new ReferenceError('maybe instance is empty');
		},
		else: error === null ? maybe : () => instance,
		catch: error === null ? () => instance : (next) => maybe(() => next(error!)),
		filter: () => instance,
		map: () => instance,
		toArray: () => [],
	};

	return instance;
};

/**
 * Create a {@link Maybe} monad from a value, a factory function, or an
 * existing `Maybe`.
 *
 * - If `init` is already a `Maybe`, it is returned as-is.
 * - If `init` is a function, it is called and its return value is wrapped.
 * - If the resolved value is `null` or `undefined`, an empty monad is
 *   returned (equivalent to {@link maybe.empty}).
 * - Errors thrown by a factory are caught and produce an error monad
 *   (equivalent to {@link maybe.error}).
 *
 * @category Async
 * @param init - A value, a zero-argument factory, or an existing `Maybe`.
 * @returns A `Maybe` monad wrapping the resolved value.
 *
 * @example
 * ```ts
 * // Wrap a plain value
 * maybe(42).value; // 42
 *
 * // Wrap a factory – nullish return becomes empty
 * maybe(() => null).empty; // true
 *
 * // Pass-through an existing Maybe
 * const m = maybe(42);
 * maybe(m) === m; // true
 *
 * // Errors thrown in a factory become error monads
 * maybe(() => { throw new Error('!'); }).error; // Error: !
 *
 * // Nullish init becomes empty
 * maybe(undefined).empty; // true
 * ```
 */
const maybe = <TypedValue>(
	init: Maybe<TypedValue> | TypedValue | (() => Maybe<TypedValue> | Nullish | TypedValue) | undefined,
): Maybe<TypedValue> => {
	try {
		const value = typeof init === 'function' ? (init as () => Maybe<TypedValue> | Nullish | TypedValue)() : init;

		if (isMaybe(value)) {
			return value;
		}

		if (value === null || value === undefined) {
			return maybe.empty();
		}

		return createOk(value as Mandatory<TypedValue>);
	} catch (error) {
		return maybe.error(error);
	}
};

/**
 * Create an `empty` monad carrying an error.
 *
 * If `error` is omitted or nullish, a generic `Error('unknown')` is used so
 * the monad always has a non-nullish `error` property. Use this variant
 * (rather than {@link maybe.empty}) when you want downstream `catch` handlers
 * to run.
 *
 * @param error - The error value to associate with the monad. Defaults to
 * `new Error('unknown')` when omitted.
 * @returns An `empty` `Maybe` carrying the given error.
 *
 * @example
 * ```ts
 * const m = maybe.error(new TypeError('bad input'));
 * m.ok;    // false
 * m.empty; // true
 * m.error; // TypeError: bad input
 *
 * // Recover with catch
 * m.catch((err) => `Handled: ${err.message}`).value;
 * // 'Handled: bad input'
 *
 * // catch is a no-op on maybe.empty() (error is null)
 * maybe.empty().catch(() => 'x').ok; // false
 * ```
 */
maybe.error = <TypedValue = never>(error?: unknown): Maybe<TypedValue> => {
	return createEmpty((error ?? new Error('unknown')) as NonNullish);
};

/**
 * Return the shared `empty` monad singleton — an `empty` monad with no
 * associated error.
 *
 * Because there is no error, `catch` is a no-op on this monad; use `else` to
 * provide a fallback instead. All calls return the **same** instance.
 *
 * @returns The shared `empty` `Maybe` singleton.
 *
 * @example
 * ```ts
 * const m = maybe.empty<number>();
 * m.ok;    // false
 * m.empty; // true
 * m.error; // null
 *
 * // Provide a fallback with else
 * m.else(0).value; // 0
 *
 * // catch is a no-op – use else instead
 * m.catch(() => 0).ok; // false
 *
 * // All instances are identical
 * maybe.empty() === maybe.empty(); // true
 * ```
 */
maybe.empty = <TypedValue = never>(): Maybe<TypedValue> => {
	return empty;
};

const empty = createEmpty(null);

/**
 * Returns `true` if `value` is a {@link Maybe} monad instance.
 *
 * Uses the internal `@@maybe` well-known symbol for the check, so it works
 * reliably across module boundaries and `instanceof` limitations.
 *
 * @param value - The value to test.
 * @returns `true` when `value` is a `Maybe`; `false` otherwise.
 *
 * @example
 * ```ts
 * isMaybe(maybe(42));      // true
 * isMaybe(maybe.empty());  // true
 * isMaybe(42);             // false
 * isMaybe(null);           // false
 * isMaybe({ ok: true });   // false
 * ```
 */
const isMaybe = (value: unknown): value is Maybe<unknown> => {
	return Boolean((value as { [maybe$]?: unknown })?.[maybe$]);
};

export { isMaybe, maybe };
export type { Maybe };
