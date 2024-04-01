# TS-Scribe

A TypeScript library tailored for Node.js development. It offers utility functions and custom types to enhance productivity and improve code quality. Whether you’re handling files, working with asynchronous operations, or ensuring type safety, ts-scribe provides valuable tools for your TypeScript projects.

## Installation

```bash
npm install ts-scribe
```

## Functions

### Object Functions

- `deepEquals`: Deeply compares two objects or arrays.
- `deepMerge`: Deep merges multiple objects and gives accurate types.
- `deepClone`: Deep clones an object. It's a faster and more accurate alternative to `JSON.parse(JSON.stringify(obj))`. (A type-safe wrapper for `rfdc`)

### Number Functions

- `isNumber`: Checks if any value is a number or can be parsed into a number.
- `clamp`: Clamps a number between a minimum and maximum value.

### Promise Functions

- `debounced`: Debounces a promise.
- `maybe`: A Maybe monad is an immutable wrapper which allows you to defer handling of null/undefined values and errors until you want to capture the result of an operation. It's an alternative to frequent nullish checks and try/catch blocks.
- `retry`: Retries a promise a specified number of times.
- `semaphore`: Limits the number of promises that can be executed concurrently.

### Array Functions

- `toArray`: Converts almost anything into an array.
- `arrPowerset`: Returns the powerset of an array.
- `arrChunk`: Splits an array into chunks of a specified size.
- `arrayDifference`: Returns the difference between two arrays.
- `arrayIntersection`: Returns the intersection of two arrays.

### List Classes

- `WeightedList`: A weighted list is a list where each element has a weight associated with it. The probability of an element being selected is proportional to its weight.
- `SortedList`: A sorted list is a list that maintains its elements in sorted order. It's useful for maintaining a list of elements that need to be sorted frequently.

### Utility Types

- `Mandatory`: Exclude nullish values from a type.
- `NonNullish`: Allows assignment of anything except nullish values.
- `Nullish`: Only allows assignment of anything nullish.
- `OverloadUnion`: Converts a union of functions into a single function with overloads.
- `Primitive`: JS primitive types.
- `Simplify`: If two or more types are intersected, it simplifies them into a single type for better readability.
- `SmartPartial`: The keys that allow undefined are optional, the rest are required.
- `TypeOfString`: Strings which can be used with `typeof` operator.
- `TypeOfType`: Infer the `typeof` type from a `typeof` string.
- `UnionToIntersection`: Convert a union type (`|`) to an intersection type (`&`).
- `GenericFunction`: A generic function type, useful for defining functions that accept any number of arguments and return any type. It's a stronger type than `Function`.
- `Nestable`: A type that can be nested infinitely. Used in deepEquals and arrIntersection functions.

## Credits

- [deepClone](https://github.com/davidmarkclements/rfdc/tree/master)
- [semaphore](https://github.com/Shakeskeyboarde)

## License

MIT
