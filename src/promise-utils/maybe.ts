import { Mandatory, NonNullish, Nullish } from '..';

const MAYBE = Symbol.for('@@maybe');

type MaybeBase<TValue> = {
  readonly [MAYBE]: Maybe<TValue>;
  /**
   * True if the monad does not have a non-nullish value. Otherwise, false.
   * Always the inverse of the `ok` property
   */
  readonly empty: boolean;
  readonly error: NonNullish | null;
  /**
   * True if the monad has a non-nullish value. Otherwise, false.
   * Always the inverse of the `empty` property.
   */
  readonly ok: boolean;
  /**
   * Get the non-nullish value if the monad is `ok`. Otherwise, throws the
   * `error` or a new `ReferenceError`.
   */
  readonly value: Mandatory<TValue>;
  /**
   * Get the next monad if the current monad is `empty` and does not have an
   * `error`. Otherwise, return the current monad.
   */
  else<TNext>(next: TNext | (() => Nullish | TNext) | null | undefined): Maybe<TNext | TValue>;
  /**
   * Get the next monad if the current monad has an `error`. Otherwise, return
   * the current monad.
   */
  catch<TNext>(next: (error: NonNullish) => Nullish | TNext): Maybe<TNext | TValue>;
  /**
   * Get an `empty` monad if the current monad is `ok` and the `predicate`
   * returns false. Otherwise, return the current monad.
   */
  filter<TNext extends TValue = TValue>(
    predicate: ((value: Mandatory<TValue>) => boolean) | ((value: TValue) => value is TNext)
  ): Maybe<TNext>;
  /**
   * Get the next monad if the current monad is `ok`. Otherwise, return the
   * current `empty` monad.
   */
  map<TNext>(next: (value: Mandatory<TValue>) => Maybe<TNext> | Nullish | TNext): Maybe<TNext>;
  /**
   * Get a one element array containing the non-nullish value if `ok`.
   * Otherwise, return an empty array.
   */
  toArray(): [] | [Mandatory<TValue>];
};

type MaybeOk<TValue> = MaybeBase<TValue> & {
  readonly empty: false;
  readonly error: null;
  readonly ok: true;
};

type MaybeNotOk<TValue> = MaybeBase<TValue> & {
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
 */
type Maybe<TValue> = MaybeNotOk<TValue> | MaybeOk<TValue>;

/**
 * Create a monad with the given `value`.
 * @param value
 * @returns
 */
const createOk = <TValue>(value: Mandatory<TValue>): MaybeOk<TValue> => {
  const instance: MaybeOk<TValue> = {
    get [MAYBE]() {
      return instance;
    },
    empty: false,
    error: null,
    ok: true,
    value,
    else: () => instance,
    catch: () => instance,
    filter: (predicate) => maybe<any>(() => (predicate(value) ? instance : maybe.empty())), // eslint-disable-line @typescript-eslint/no-explicit-any
    map: (next) => maybe(() => next(value)),
    toArray: () => [value],
  };

  return instance;
};

/**
 * Create an empty monad with the given `error` value.
 * @param error
 * @returns
 */
const createEmpty = (error: NonNullish | null): MaybeNotOk<never> => {
  const instance: MaybeNotOk<never> = {
    get [MAYBE]() {
      return instance;
    },
    empty: true,
    error,
    ok: false,
    get value(): never {
      throw error ?? new ReferenceError('maybe instance is empty');
    },
    else: error == null ? maybe : () => instance,
    catch: error == null ? () => instance : (next) => maybe(() => next(error)),
    filter: () => instance,
    map: () => instance,
    toArray: () => [],
  };

  return instance;
};

/**
 * Get a monad for the `init` value.
 * @param init - A value, or value factory.
 * @returns A monad instance.
 */
const maybe = <TValue>(
  init: Maybe<TValue> | TValue | (() => Maybe<TValue> | Nullish | TValue) | null | undefined
): Maybe<TValue> => {
  try {
    const value = typeof init === 'function' ? (init as () => Maybe<TValue> | Nullish | TValue)() : init;

    if (isMaybe(value)) {
      return value;
    } else if (value == null) {
      return maybe.empty();
    } else {
      return createOk(value as Mandatory<TValue>);
    }
  } catch (error) {
    return maybe.error(error);
  }
};

/**
 * Get an empty monad with the given `error` value. If the error is not given
 * or nullish (ie. null or undefined), a default error will be created.
 */
maybe.error = <TValue = never>(error?: unknown): Maybe<TValue> => {
  return createEmpty((error ?? new Error('unknown')) as NonNullish);
};

/**
 * Get an empty (not ok) monad, without an error.
 * All empty monad instances are the same instance (ie. referentially
 * identical).
 */
maybe.empty = <TValue = never>(): Maybe<TValue> => {
  return empty;
};

const empty = createEmpty(null);

/**
 * Returns true of the `value` is a `Maybe` monad instance. Otherwise, false.
 * @param value - The value to check.
 * @returns Boolean
 */
const isMaybe = (value: unknown): value is Maybe<unknown> => {
  return Boolean((value as { [MAYBE]?: unknown })?.[MAYBE]);
};

export { isMaybe, maybe, type Maybe };
