/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

/**
 * JS primitive types.
 */
type Primitive = bigint | boolean | number | string | symbol | null | undefined;
/**
 * Only allows assignment of anything nullish.
 */
type Nullish = null | undefined | void;
/**
 * Allows assignment of anything except nullish values.
 */
type NonNullish = NonNullable<unknown>;
/**
 * Exclude nullish values from a type.
 */
type Mandatory<TValue> = Exclude<TValue, Nullish>;

/**
 * Nestable object type.
 */
type Nestable = Primitive | Nestable[] | { [key: string]: Nestable };

/**
 * Function type with generic arguments and return type.
 */
type GenericFunction<T, R> = (arg: T) => R;

/**
 * Strings which can be used with `typeof` operator.
 */
type TypeOfString = 'bigint' | 'boolean' | 'function' | 'number' | 'object' | 'string' | 'symbol' | 'undefined';

/**
 * Infer the `typeof` type from a `typeof` string.
 */
type TypeOfType<TString> = TString extends 'string'
  ? string
  : TString extends 'number'
    ? number
    : TString extends 'boolean'
      ? boolean
      : TString extends 'object'
        ? object
        : TString extends 'function'
          ? Function
          : TString extends 'bigint'
            ? bigint
            : TString extends 'symbol'
              ? symbol
              : TString extends 'undefined'
                ? undefined
                : unknown;

/**
 * Convert a union type (`|`) to an intersection type (`&`).
 */
type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer V) => any ? V : never;

/**
 * Make optional the keys of an object which allow undefined value assignment.
 */
type SmartPartial<T> = Simplify<
  UnionToIntersection<{ [P in keyof T]: undefined extends T[P] ? { [K in P]?: T[P] } : { [K in P]: T[P] } }[keyof T]>
>;

/**
 * _Developer Experience_
 *
 * If two or more objects are intersected (`{ foo: string } & { bar: string }`),
 * simplify the type to a single object with all the properties
 * (`{ foo: string; bar: string }`).
 */
type Simplify<T> = T extends Record<string, unknown> ? { [P in keyof T]: T[P] } : T;

type _OverloadUnion<TOverload, TPartialOverload = unknown> = TPartialOverload & TOverload extends (
  ...args: infer TArgs
) => infer TReturn
  ? TPartialOverload extends TOverload
    ? never
    :
        | _OverloadUnion<TOverload, Pick<TOverload, keyof TOverload> & TPartialOverload & ((...args: TArgs) => TReturn)>
        | ((...args: TArgs) => TReturn)
  : never;

/**
 * Convert a function overload (aka: an intersection of function signatures)
 * into a union of the signatures.
 *
 * type U = OverloadUnion<(() => 1) & ((a: 2) => 2)>;
 * type U = (() => 1) | ((a: 2) => 2))
 */
type OverloadUnion<TOverload extends (...args: any[]) => any> = Exclude<
  _OverloadUnion<(() => never) & TOverload>,
  TOverload extends () => never ? never : () => never
>;

export type {
  Mandatory,
  NonNullish,
  Nullish,
  OverloadUnion,
  Primitive,
  Simplify,
  SmartPartial,
  TypeOfString,
  TypeOfType,
  UnionToIntersection,
  GenericFunction,
  Nestable,
};
