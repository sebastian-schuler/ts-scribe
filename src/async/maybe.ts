import { type Mandatory, type NonNullish, type Nullish } from '../types/common-types.js';

const maybe$ = Symbol.for('@@maybe');

type MaybeBase<TypedValue> = {
	readonly [maybe$]: Maybe<TypedValue>;
	/**
	 * True if the monad does not have a non-nullish value. Otherwise, false.
	 * Always the inverse of the `ok` property.
	 * @type {boolean}
	 */
	readonly empty: boolean;

	/**
	 * Error associated with the monad. `null` if no error is present.
	 * @type {NonNullish | null}
	 */
	readonly error: NonNullish | undefined | null;

	/**
	 * True if the monad has a non-nullish value. Otherwise, false.
	 * Always the inverse of the `empty` property.
	 * @type {boolean}
	 */
	readonly ok: boolean;

	/**
	 * Get the non-nullish value if the monad is `ok`. Otherwise, throws the
	 * `error` or a new `ReferenceError`.
	 * @type {Mandatory<TypedValue>}
	 */
	readonly value: Mandatory<TypedValue>;

	/**
	 * Get the next monad if the current monad is `empty` and does not have an
	 * `error`. Otherwise, return the current monad.
	 * @param next - The next monad or value to transition to.
	 * @returns {Maybe<TypedNext | TypedValue>}
	 */
	else<TypedNext>(next: TypedNext | (() => Nullish | TypedNext) | undefined): Maybe<TypedNext | TypedValue>;

	/**
	 * Get the next monad if the current monad has an `error`. Otherwise, return
	 * the current monad.
	 * @param next - A function to handle the error and return the next monad or value.
	 * @returns {Maybe<TypedNext | TypedValue>}
	 */
	catch<TypedNext>(next: (error: NonNullish) => Nullish | TypedNext): Maybe<TypedNext | TypedValue>;

	/**
	 * Get an `empty` monad if the current monad is `ok` and the `predicate`
	 * returns false. Otherwise, return the current monad.
	 * @param predicate - A function to test the current value of the monad.
	 * @returns {Maybe<TypedNext>}
	 */
	filter<TypedNext extends TypedValue = TypedValue>(
		predicate: ((value: Mandatory<TypedValue>) => boolean) | ((value: TypedValue) => value is TypedNext),
	): Maybe<TypedNext>;

	/**
	 * Get the next monad if the current monad is `ok`. Otherwise, return the
	 * current `empty` monad.
	 * @param next - A function to return the next monad or value.
	 * @returns {Maybe<TypedNext>}
	 */
	map<TypedNext>(next: (value: Mandatory<TypedValue>) => Maybe<TypedNext> | Nullish | TypedNext): Maybe<TypedNext>;

	/**
	 * Get a one element array containing the non-nullish value if `ok`.
	 * Otherwise, return an empty array.
	 * @returns {[] | [Mandatory<TypedValue>]}
	 */
	toArray(): [] | [Mandatory<TypedValue>];
};

type MaybeOk<TypedNext> = MaybeBase<TypedNext> & {
	readonly empty: false;
	readonly error: undefined | null;
	readonly ok: true;
};

type MaybeNotOk<TypedNext> = MaybeBase<TypedNext> & {
	readonly empty: true;
	readonly ok: false;
	readonly value: never;
};

/**
 * Maybe monad.
 *
 * Access the current state using the `ok`, `empty`, `value`, and `error` properties,
 * or the `toArray` method.
 *
 * Create derivative monads using the `else*`, `map`, and `filter` methods.
 * The `else*` methods are no-ops if `ok` property is true. The `map` and
 * `filter` methods are no-ops if the `ok` property is false.
 * @type {Maybe<TypedNext>}
 */
type Maybe<TypedNext> = MaybeNotOk<TypedNext> | MaybeOk<TypedNext>;

/**
 * Create a monad with the given `value`.
 * @param value - The non-nullish value to create the monad with.
 * @returns {MaybeOk<TypedNext>} The created monad with `ok` state.
 */
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

/**
 * Create an empty monad with the given `error` value.
 * @param error - The error to associate with the monad.
 * @returns {MaybeNotOk<never>} The created monad with `empty` state.
 */
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
 * Get a monad for the `init` value.
 * @param init - A value, or value factory.
 * @returns {Maybe<TypedValue>} A monad instance.
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
 * Get an empty monad with the given `error` value. If the error is not given
 * or nullish (ie. null or undefined), a default error will be created.
 * @param error - The error to associate with the monad.
 * @returns {Maybe<TypedValue>} The created empty monad.
 */
maybe.error = <TypedValue = never>(error?: unknown): Maybe<TypedValue> => {
	return createEmpty((error ?? new Error('unknown')) as NonNullish);
};

/**
 * Get an empty (not ok) monad, without an error.
 * All empty monad instances are the same instance (ie. referentially
 * identical).
 * @returns {Maybe<TypedValue>} The created empty monad.
 */
maybe.empty = <TypedValue = never>(): Maybe<TypedValue> => {
	return empty;
};

const empty = createEmpty(null);

/**
 * Returns true of the `value` is a `Maybe` monad instance. Otherwise, false.
 * @param value - The value to check.
 * @returns {boolean} Boolean indicating if `value` is a `Maybe` monad.
 */
const isMaybe = (value: unknown): value is Maybe<unknown> => {
	return Boolean((value as { [maybe$]?: unknown })?.[maybe$]);
};

export { isMaybe, maybe };
export type { Maybe };
