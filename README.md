# TS-Scribe

[![npm](https://img.shields.io/npm/v/ts-scribe)](https://www.npmjs.com/package/ts-scribe)
<a href="https://pkg-size.dev/ts-scribe"><img src="https://pkg-size.dev/badge/install/235263" title="Install size for ts-scribe"></a>
<a href="https://pkg-size.dev/ts-scribe"><img src="https://pkg-size.dev/badge/bundle/47710" title="Bundle size for ts-scribe"></a>
[![Module type: CJS+ESM](https://img.shields.io/badge/module%20type-cjs%2Besm-brightgreen)](https://github.com/voxpelli/badges-cjs-esm)

TypeScript utilities for Node.js and Bun. Zero dependencies. Tree-shakeable ESM with a CommonJS fallback.

- [Full API documentation](https://sebastian-schuler.github.io/ts-scribe/)

## Installation

```bash
npm install ts-scribe
```

```bash
bun add ts-scribe
```

## API

### Core

| Export | Description |
|---|---|
| `getIn(value, path)` | Safely read a nested value via a path array. Supports objects, Maps, and Arrays with full type inference up to 6 levels deep. |
| `setIn(value, path, newValue)` | Immutably set a nested value, creating missing containers along the path. |
| `memoize(fn, options?)` | Wrap a function with an LRU cache. Supports TTL, max entry count, max entry size, error caching, and hit/miss/eviction stats. |
| `safeJsonParse(text, fallback?)` | Parse JSON without throwing. Returns the parsed value or a fallback. |
| `safeJsonStringify(value, fallback?)` | Stringify to JSON without throwing. Handles circular references, BigInt, and non-serializable values. |
| `jsonByteSize(value, accuracy?)` | Measure the byte size of a value's JSON representation. Three accuracy modes: `'exact'`, `'fast'`, and `'estimate'`. |
| `parseBoolean(value)` | Coerce strings, numbers, and other values to a boolean. |
| `parseNumber(value)` | Coerce strings and other values to a number, or `undefined` if not parseable. |
| `run(fn)` | Immediately invoke a function. Useful for scoping inline expressions. |

### Array

| Export | Description |
|---|---|
| `arrayChunk(array, size)` | Split an array into fixed-size chunks. |
| `arrayDifference(a, b)` | Elements in `a` not present in `b`. |
| `arrayGroupBy(array, key)` | Group an array of objects by a property or function. |
| `arrayIntersection(a, b)` | Elements present in both arrays. |
| `arrayIntersectionDeep(a, b)` | Deep equality intersection for arrays of objects. |
| `arrayPartition(array, predicate)` | Split an array into two: elements that satisfy the predicate and those that don't. Supports type guard narrowing. |
| `arrayPluck(array, key)` | Extract a property from each object in an array. |
| `arrayPowerset(array)` | All possible subsets of an array. |
| `arrayShuffle(array)` | Randomly shuffle an array in place using Fisher-Yates. |
| `arrayUnique(array)` | Remove duplicate primitive values. |
| `arrayUniqueBy(array, key)` | Remove duplicate objects by a property or function. |
| `toArray(value)` | Normalize a value to an array. Handles iterables, array-likes, and scalar values. |

### Async

| Export | Description |
|---|---|
| `asyncFilter(array, fn, options?)` | Filter an array with an async predicate. Supports concurrency limiting. |
| `asyncForEach(array, fn, options?)` | Run an async function over each array element in parallel with concurrency control. |
| `asyncMap(array, fn, options?)` | Map an array through an async function with concurrency control. |
| `debounce(fn, delay)` | Create a debounced version of a function or promise. |
| `maybe(value)` | Maybe monad for chaining operations on values that may be null or undefined. Supports `map`, `filter`, `else`, and `catch`. |
| `retry(handler, options?)` | Retry a promise-returning function with configurable delays, retry count, and abort signal. |
| `Semaphore` | Class that limits concurrent access to a resource. Acquire and release locks. |
| `sleep(ms)` | Pause execution for a given number of milliseconds. |
| `waterfall(tasks)` | Run an array of async tasks in sequence. Resolves with the result of the last task. |

### Development

| Export | Description |
|---|---|
| `benchmark(fn, options?)` | Measure the execution time of a function over multiple iterations. Returns timing stats without changing function behavior. |
| `createPerfTimer(options?)` | Create a high-resolution timer with lap support for measuring code blocks. |
| `traceFunction(fn, options?)` | Wrap a function to log calls, arguments, return values, and execution time without altering its behavior. |

### List

| Export | Description |
|---|---|
| `SortedList` | A class that maintains elements in sorted order using binary search. Supports custom comparators and duplicate policies. |
| `WeightedList` | A class for weighted random selection. Items with higher weights are more likely to be picked. |

### Math

| Export | Description |
|---|---|
| `clamp(value, min, max)` | Constrain a number to a range. |
| `greatestCommonDivisor(...numbers)` | Compute the GCD of one or more integers. |
| `smallestCommonMultiple(...numbers)` | Compute the LCM of one or more integers. |

### Object

| Export | Description |
|---|---|
| `objectDeepClone(value, options?)` | Deep clone using `structuredClone` with a fallback. Handles Date, RegExp, Map, Set, and circular references. |
| `objectDeepEquals(a, b)` | Deep equality comparison for objects and arrays. Handles circular references. |
| `objectDeepFreeze(value)` | Recursively `Object.freeze` an object and all its nested properties. |
| `objectFlatten(value, prefix?)` | Flatten a nested object into dot-notation keys. |
| `objectMask(value, options)` | Recursively replace sensitive values with a masking character. Supports key-based rules, custom predicates, depth limits, and custom mask functions. Handles circular references and special types. |
| `objectOmitKeys(value, keys)` | Return a shallow copy of an object with specified keys removed. |
| `objectPickKeys(value, keys)` | Return a shallow copy of an object with only the specified keys. |
| `objectPrune(value, options?)` | Remove keys with `undefined` values from an object. Optionally remove nulls and empty values. |

### Random

| Export | Description |
|---|---|
| `randomBool(bias?)` | Generate a random boolean with an optional bias from 0 to 1. |
| `randomInt(min, max)` | Generate a random integer in a range, inclusive. |
| `randomSample(array, count?)` | Pick one or more random items from an array without replacement. |
| `randomString(length, charset?)` | Generate a random string of a given length with a configurable character set. |

### String

| Export | Description |
|---|---|
| `interpolateString(template, data, options?)` | Replace `{placeholders}` in a template string with values from a data object. Supports strict mode, custom delimiters, fallbacks, and value transforms. |
| `slugify(input, options?)` | Convert a string to a URL-friendly slug. Supports transliteration, custom separators, and character filtering. |
| `toCamelCase(input)` | Convert a string to camelCase. |
| `toDotCase(input)` | Convert a string to dot.case. |
| `toHeaderCase(input)` | Convert a string to Header-Case. |
| `toKebabCase(input)` | Convert a string to kebab-case. |
| `toPascalCase(input)` | Convert a string to PascalCase. |
| `toSnakeCase(input)` | Convert a string to snake_case. |
| `truncate(input, options?)` | Truncate a string to a maximum length with configurable ellipsis and word-boundary awareness. |

### System

| Export | Description |
|---|---|
| `getEnvironment()` | Detect the runtime: returns `'Browser'`, `'Bun'`, `'Node'`, or `'Unknown'`. |
| `isBrowser()` | Returns `true` when running in a browser. |
| `isNode()` | Returns `true` when running in Node.js. |

### Typeguards

| Export | Description |
|---|---|
| `isDefined(value)` | Type guard: `value` is not `null`, `undefined`, or `NaN`. |
| `isEmptyObject(value)` | Type guard: `value` is an object with no own enumerable keys. |
| `isEmptyValue(value)` | Returns `true` for `null`, `undefined`, `NaN`, empty strings, empty arrays, and empty objects. |
| `isNumber(value)` | Type guard: `value` is a finite number or a numeric string. |
| `isString(value)` | Type guard: `value` is a string primitive or `String` object. |

## Types

Utility types are exported alongside functions and require no additional import path.

| Type | Description |
|---|---|
| `DeepPartial<T>` | Recursively make all properties optional. |
| `DeepReadonly<T>` | Recursively make all properties readonly. |
| `GenericFunction` | Type for any callable function. |
| `Mandatory<T>` | Strip `null` and `undefined` from all properties. |
| `Nestable<T>` | A type that can contain itself recursively. |
| `NonNullish` | Exclude `null` and `undefined`. |
| `Nullish` | `null \| undefined`. |
| `OverloadUnion<T>` | Convert a union of function types into a single overloaded signature. |
| `Primitive` | Union of `string \| number \| boolean \| symbol \| bigint \| null \| undefined`. |
| `Serializable` | Values that can appear in valid JSON. |
| `Simplify<T>` | Flatten intersection types for better IDE display. |
| `SmartPartial<T>` | Make a property optional only if its type already includes `undefined`. |
| `TypeOfString` | Union of valid `typeof` return strings. |
| `TypeOfType<T>` | Extract the `typeof` string for a value type. |
| `UnionToIntersection<U>` | Convert a union type to an intersection type. |

## Credits

The `SortedList` and `Semaphore` implementations are based on work by [Shakeskeyboarde](https://github.com/Shakeskeyboarde).

## License

MIT

MIT
