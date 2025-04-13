# TS-Scribe

[![npm](https://img.shields.io/npm/v/ts-scribe)](https://www.npmjs.com/package/ts-scribe)
<a href="https://pkg-size.dev/ts-scribe"><img src="https://pkg-size.dev/badge/install/135422" title="Install size for ts-scribe"></a>
<a href="https://pkg-size.dev/ts-scribe"><img src="https://pkg-size.dev/badge/bundle/14746" title="Bundle size for ts-scribe"></a>
[![Module type: CJS+ESM](https://img.shields.io/badge/module%20type-cjs%2Besm-brightgreen)](https://github.com/voxpelli/badges-cjs-esm)

A TypeScript utility library tailored for Node.js development. It provides a rich set of utility functions and advanced types to enhance productivity and code quality.

## Installation

```bash
npm install ts-scribe
```

```bash
bun add ts-scribe
```

## Functions

### Core

- `run`: Helper to run a function or block of code in a cleaner way.
- `parseBoolean`: Parses various values into a boolean.
- `parseNumber`: Parses various values into a number.
- `safeJsonParse`: Safely parses a JSON string without throwing.

### Array

- `arrChunk`: Splits an array into chunks of a specified size.
- `arrDifference`: Returns the difference between two arrays.
- `arrGroupBy`: Groups an array of objects by a specified key.
- `arrIntersection`: Returns the intersection of two arrays.
- `arrIntersectionDeep`: Deep intersection between arrays of objects or values.
- `arrPluck`: Extracts a list of property values from an array of objects.
- `arrPowerset`: Returns the powerset of an array.
- `arrShuffle`: Shuffles an array randomly.
- `arrUniqueBy`: Returns an array of unique values based on a specified key.
- `toArray`: Converts almost anything into an array.

### Async

- `asyncForEach`: Runs async operations over an array in parallel.
- `debounce`: Debounces a function or promise.
- `maybe`: Maybe monad for null-safe operations.
- `retry`: Retries a promise a specified number of times.
- `sleep`: Pauses execution for a specified time.
- `waterfall`: Chains functions that pass results to each other.

### List

- `SortedList`: Maintains a sorted list.
- `WeightedList`: Selects items based on weight/probability.

### Math

- `clamp`: Clamps a number between min and max.
- `greatestCommonDivisor`: Finds the GCD of multiple numbers.
- `smallestCommonMultiple`: Finds the LCM of multiple numbers.

### Object

- `objectDeepClone`: Deeply clones an object.
- `objectDeepEquals`: Deeply compares two objects or arrays.
- `objectDeepFreeze`: Deep freezes an object recursively.
- `objectDeepMerge`: Deep merges multiple objects with accurate types.
- `objectFlatten`: Flattens an object into dot notation.
- `objectPrune`: Removes properties with undefined values.
- `objectRemoveKeys`: Removes specified keys from an object.

### Random

- `randomBool`: Generates a random boolean, optionally biased.
- `randomInt`: Generates a random integer in a given range.
- `randomSample`: Randomly samples values from an array.
- `randomString`: Generates a random string of given length/charset.

### String

- `strCamelCase`: Converts a string to camelCase.
- `strDotCase`: Converts a string to dot.case.
- `strHeaderCase`: Converts a string to Header Case.
- `strKebabCase`: Converts a string to kebab-case.
- `strPascalCase`: Converts a string to PascalCase.
- `strSnakeCase`: Converts a string to snake_case.
- `strTruncate`: Truncates a string with configurable options.

### System

- `isBrowser`: Returns `true` if running in a browser environment.
- `isNode`: Returns `true` if running in Node.js.

### Typeguards

- `isDefined`: Checks if a value is not null/undefined/NaN.
- `isEmptyObject`: Checks if an object has no own properties.
- `isEmptyValue`: Checks for null, undefined, NaN, empty string/array/object.
- `isNumber`: Validates numeric values or strings that can be parsed as numbers.
- `isString`: Validates if a value is a string.

## Types

- `Primitive`: JavaScript primitive types.
- `Nullish`: Represents `null | undefined`.
- `NonNullish`: Excludes `null | undefined`.
- `Mandatory<T>`: Removes nullish from all properties of `T`.
- `Nestable<T>`: A type that can nest recursively.
- `GenericFunction`: A generic function type.
- `TypeOfString`: Valid `typeof` operator string values.
- `TypeOfType<T>`: Infers the `typeof` type string from a value.
- `UnionToIntersection<U>`: Converts a union to an intersection.
- `SmartPartial<T>`: Only makes properties optional if their type includes `undefined`.
- `Simplify<T>`: Flattens complex types for better readability.
- `OverloadUnion<T>`: Turns a union of functions into a single overloaded function type.
- `DeepReadonly<T>`: Deep version of `Readonly<T>`.
- `DeepPartial<T>`: Deep version of `Partial<T>`.

## Credits

- [objectDeepClone](https://github.com/davidmarkclements/rfdc/tree/master)
- [semaphore](https://github.com/Shakeskeyboarde)

## License

MIT
