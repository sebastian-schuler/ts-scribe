# TS-Scribe

[![npm](https://img.shields.io/npm/v/ts-scribe)](https://www.npmjs.com/package/ts-scribe)
<a href="https://pkg-size.dev/ts-scribe"><img src="https://pkg-size.dev/badge/install/96171" title="Install size for ts-scribe"></a>
<a href="https://pkg-size.dev/ts-scribe"><img src="https://pkg-size.dev/badge/bundle/145" title="Bundle size for ts-scribe"></a>

A TypeScript library tailored for Node.js development. It offers utility functions and custom types to enhance productivity and improve code quality. Whether you’re handling files, working with asynchronous operations, or ensuring type safety, ts-scribe provides valuable tools for your TypeScript projects.

## Installation

```bash
npm install ts-scribe
```

## Functions

### Core Utilities

- `run`: Helper to run a function or block of code in a cleaner way.
- `parseBoolean`: Parses different kinds of values into a boolean.
- `parseNumber`: Parses different kinds of values into a number.

### Array Utilities

- `chunkArray`: Splits an array into chunks of a specified size.
- `differenceArray`: Returns the difference between two arrays.
- `groupBy`: Groups an array of objects by a specified key.
- `intersection`: Returns the intersection of two arrays.
- `pluckArray`: Extracts a list of property values from an array of objects.
- `powerset`: Returns the powerset of an array.
- `shuffleArray`: Shuffle an array.
- `toArray`: Converts almost anything into an array.
- `uniqueBy`: Returns an array of unique objects based on a specified key.

### Async Utilities

- `debounced`: Debounces a promise.
- `maybe`: A Maybe monad is an immutable wrapper which allows you to defer handling of null/undefined values and errors until you want to capture the result of an operation. It's an alternative to frequent nullish checks and try/catch blocks.
- `retry`: Retries a promise a specified number of times.
- `semaphore`: Limits the number of promises that can be executed concurrently.
- `sleep`: Pause the process for a certain amount of time.

### List Utilities

- `WeightedList`: A list where each element has a weight associated with it. The probability of an element being selected is proportional to its weight.
- `SortedList`: A list that maintains its elements in sorted order. It's useful for maintaining a list of elements that need to be sorted frequently.

### Number Utilities

- `clamp`: Clamps a number between a minimum and maximum value.

### Object Utilities

- `deepClone`: Deep clones an object. It's a faster and more accurate alternative to `JSON.parse(JSON.stringify(obj))`.
- `deepEquals`: Deeply compares two objects or arrays.
- `deepFreeze`: Deeply freeze an object.
- `deepMerge`: Deep merges multiple objects and gives accurate types.
- `safeJsonParse`: Parse a Json string safely.

### Random Utilities

- `randomString`: Generates a random string. You can specify the length and character set.
- `randomInt`: Generates a random integer. You can specify the minimum and maximum values.
- `randomBool`: Generates a random boolean. You can specify the probability of getting `true`.
- `randomSample`: Returns random elements from an array. You can specify the number of elements to return.

### String Utilities

- `toCamelCase`: Converts a string to camelCase.
- `toKebabCase`: Converts a string to kebab-case.
- `toSnakeCase`: Converts a string to snake_case.
- `toDotCase`: Converts a string to dot.case.
- `toPascalCase`: Converts a string to PascalCase.
- `toHeaderCase`: Converts a string to Header Case.

### Typeguards

- `isDefined`: Checks if a value is defined and not null / undefined / NaN.
- `isEmptyObject`: Checks if an object is empty.
- `isNumber`: Checks if any value is a number or can be parsed into a number.
- `isString`: Checks if any value is a string.

### Utility Types

- `Primitive`: JS primitive types.
- `Nullish`: Only allows assignment of anything nullish.
- `NonNullish`: Allows assignment of anything except nullish values.
- `Mandatory`: Exclude nullish values from a type.
- `Nestable`: A type that can be nested infinitely. Used in deepEquals and arrIntersection functions.
- `GenericFunction`: A generic function type, useful for defining functions that accept any number of arguments and return any type. It's a stronger type than `Function`.
- `TypeOfString`: Strings which can be used with `typeof` operator.
- `TypeOfType`: Infer the `typeof` type from a `typeof` string.
- `UnionToIntersection`: Convert a union type (`|`) to an intersection type (`&`).
- `SmartPartial`: The keys that allow undefined are optional, the rest are required.
- `Simplify`: If two or more types are intersected, it simplifies them into a single type for better readability.
- `OverloadUnion`: Converts a union of functions into a single function with overloads.
- `ReadonlyDeep`: Typescripts readonly but for nested objects.
  
## Credits

- [deepClone](https://github.com/davidmarkclements/rfdc/tree/master)
- [semaphore](https://github.com/Shakeskeyboarde)

## License

MIT
