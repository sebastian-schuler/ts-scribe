/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

/**
 * Represents JS primitive types.
 * This includes all the fundamental types available in JavaScript,
 * such as numbers, strings, and booleans, as well as `null` and `undefined`.
 */
export type Primitive = bigint | boolean | number | string | symbol | null | undefined;

/**
 * Type representing values that are either `null`, `undefined`, or `void`.
 * Useful for ensuring that only nullish values are allowed in specific contexts.
 */
export type Nullish = null | undefined | void;

/**
 * Type that allows assignment of any value except for nullish values (`null` or `undefined`).
 * It ensures that only non-nullish values can be assigned.
 */
export type NonNullish = NonNullable<unknown>;

/**
 * Excludes nullish values (`null` and `undefined`) from a given type.
 * This type is useful when you need to ensure a value is always defined (i.e., not null or undefined).
 * 
 * @template TValue - The type from which `null` and `undefined` are excluded.
 */
export type Mandatory<TValue> = Exclude<TValue, Nullish>;

/**
 * A recursive type that represents objects that can contain primitives, nested objects, or arrays of `Nestable` types.
 * This allows for deeply nested structures, such as JSON-like objects, while ensuring that only valid primitive or nested types are allowed.
 */
export type Nestable = Primitive | Nestable[] | { [key: string]: Nestable };

/**
 * A function type with a generic argument and return type.
 * This type allows you to define a function signature with specific input and output types.
 * 
 * @template T - The type of the function's input argument.
 * @template R - The type of the function's return value.
 */
export type GenericFunction<T, R> = (arg: T) => R;

/**
 * Represents the strings that can be used with the `typeof` operator.
 * This is helpful for type-safe operations when checking the type of a value at runtime using `typeof`.
 */
export type TypeOfString = 'bigint' | 'boolean' | 'function' | 'number' | 'object' | 'string' | 'symbol' | 'undefined';

/**
 * A type that infers the type based on the result of the `typeof` operator in JavaScript.
 * It maps a string representing a `typeof` result to the corresponding TypeScript type.
 * 
 * @template TString - A string that represents the result of `typeof`.
 */
export type TypeOfType<TString> = TString extends 'string'
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
 * Converts a union type (`|`) into an intersection type (`&`).
 * This utility type is helpful for extracting the intersection of all possible types in a union.
 * 
 * @template T - The union type to be converted into an intersection type.
 */
export type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer V) => any ? V : never;

/**
 * Creates a type where the properties of an object are made optional,
 * but only for those properties that can accept `undefined` as a valid value.
 * This is useful for scenarios where a partial version of an object is allowed,
 * but only for properties that are explicitly nullable.
 * 
 * @template T - The object type to apply the smart partial transformation to.
 */
export type SmartPartial<T> = Simplify<
  UnionToIntersection<{ [P in keyof T]: undefined extends T[P] ? { [K in P]?: T[P] } : { [K in P]: T[P] } }[keyof T]>
>;

/**
 * Simplifies a type by merging intersected objects into a single object with all properties.
 * This utility is helpful when dealing with complex object intersections.
 * For example, `{ foo: string } & { bar: string }` would be simplified to `{ foo: string; bar: string }`.
 * 
 * @template T - The type to simplify, typically an intersection of types.
 */
export type Simplify<T> = T extends Record<string, unknown> ? { [P in keyof T]: T[P] } : T;

/**
 * Helper type to assist in the implementation of function overloads.
 * This type works recursively to extract the union of overloaded function signatures.
 * 
 * @template TOverload - The function overload type.
 * @template TPartialOverload - A partial version of the overload.
 */
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
 * Converts a function overload (an intersection of function signatures)
 * into a union of those signatures.
 * This is useful when you want to handle multiple function signatures as separate types,
 * rather than a single intersection of them.
 * 
 * @template TOverload - The function overload type, typically an intersection of function signatures.
 * 
 * @example
 * type U = OverloadUnion<(() => 1) & ((a: 2) => 2)>;
 * type U = (() => 1) | ((a: 2) => 2);
 */
export type OverloadUnion<TOverload extends (...args: any[]) => any> = Exclude<
  _OverloadUnion<(() => never) & TOverload>,
  TOverload extends () => never ? never : () => never
>;

/**
 * A recursive `readonly` type for objects, ensuring that all properties
 * in an object and its nested structures are read-only.
 * This helps in cases where you want to deeply enforce immutability in an object.
 * 
 * @template T - The object type to make deeply readonly.
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

/**
 * A recursive `partial` type for objects, where all properties and nested properties
 * are optional. This is useful when you want to allow partial updates or modifications
 * to deeply nested objects.
 * 
 * @template T - The object type to make deeply partial.
 */
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
