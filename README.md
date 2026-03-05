# TS-Scribe

[![npm](https://img.shields.io/npm/v/ts-scribe)](https://www.npmjs.com/package/ts-scribe)
<a href="https://pkg-size.dev/ts-scribe"><img src="https://pkg-size.dev/badge/install/381931" title="Install size for ts-scribe"></a>
<a href="https://pkg-size.dev/ts-scribe"><img src="https://pkg-size.dev/badge/bundle/9868" title="Bundle size for ts-scribe"></a>
[![Module type: CJS+ESM](https://img.shields.io/badge/module%20type-cjs%2Besm-brightgreen)](https://github.com/voxpelli/badges-cjs-esm)

A TypeScript utility library tailored for Node.js and Bun development. It provides a rich set of utility functions and advanced types to enhance productivity and code quality.

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
- `safeJsonParse`: Safely parses a string without throwing.
- `safeJsonStringify`: Safely stringifies a JSON object without throwing (handles issues like circular references).

### Array

- `arrayUnique`: Given an array of primitive values, returns a new array with duplicates removed.
- `arrayChunk`: Splits an array into chunks of a specified size.
- `arrayDifference`: Returns the difference between two arrays.
- `arrayGroupBy`: Groups an array of objects by a specified key.
- `arrayIntersection`: Returns the intersection of two arrays.
- `arrayIntersectionDeep`: Deep intersection between arrays of objects or values.
- `arrayPluck`: Extracts a list of property values from an array of objects.
- `arrayPowerset`: Returns the powerset of an array.
- `arrayShuffle`: Shuffles an array randomly.
- `arrayUniqueBy`: Returns an array of unique values based on a specified key.
- `toArray`: Converts almost anything into an array.

### Async

- `asyncForEach`: Runs async operations over an array in parallel.
- `asyncMap`: Similar to asyncForEach but with the behavior of Array.map function.
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
- `flattenObject`: Flattens an object into dot notation.
- `pruneObject`: Removes properties with undefined values.
- `removeObjectKeys`: Removes specified keys from an object.

### Random

- `randomBool`: Generates a random boolean, optionally biased.
- `randomInt`: Generates a random integer in a given range.
- `randomSample`: Randomly samples values from an array.
- `randomString`: Generates a random string of given length/charset.

### String

- `toCamelCase`: Converts a string to camelCase.
- `toDotCase`: Converts a string to dot.case.
- `toHeaderCase`: Converts a string to Header Case.
- `toKebabCase`: Converts a string to kebab-case.
- `toPascalCase`: Converts a string to PascalCase.
- `toSnakeCase`: Converts a string to snake_case.
- `truncateString`: Truncates a string with configurable options.
- `slugifyString`: Slugifies a string, converting it into a URL-friendly format with customizable options.

### System

- `isBrowser`: Returns `true` if running in a browser environment.
- `isNode`: Returns `true` if running in Node.js.
- `getEnvironment`: Returns 'Browser', 'Bun', 'Node', or 'Unknown' depending on the context it's run in.

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
- `Serializable`: Represents a type that can be serialized to a JSON-compatible format.

### Development

- `benchmark`: Wrap around a function to benchmark it's performance without affecting app behavior.

## Credits

- [semaphore](https://github.com/Shakeskeyboarde)

## License

MIT
