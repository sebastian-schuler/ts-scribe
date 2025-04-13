import { deepmerge, deepmergeInto, deepmergeCustom, deepmergeIntoCustom } from 'deepmerge-ts';

// Re-Exported
export { deepmerge, deepmergeInto, deepmergeCustom, deepmergeIntoCustom };

// Array
export {
  arrChunk,
  arrDifference,
  arrGroupBy,
  arrIntersection,
  arrIntersectionDeep,
  arrPluck,
  arrPowerset,
  arrShuffle,
  arrUniqueBy,
  toArray,
} from './array/index.js';

// Async
export { asyncForEach, debounce, maybe, retry, sleep, waterfall } from './async/index.js';
export type { Maybe, RetryHandler, RetryOptions, Semaphore } from './async/index.js';

// Core
export { parseBoolean, parseNumber, run, safeJsonParse } from './core/index.js';

// List
export { SortedList, WeightedList } from './list/index.js';
export type { SortedListCompare, SortedListOptions } from './list/index.js';

// Math
export { clamp, greatestCommonDivisor, smallestCommonMultiple } from './math/index.js';

// Object
export {
  objectDeepClone,
  objectDeepEquals,
  objectDeepFreeze,
  objectFlatten,
  objectPrune,
  objectRemoveKeys,
} from './object/index.js';

// Random
export { randomBool, randomInt, randomSample, randomString } from './random/index.js';

// String
export {
  strCamelCase,
  strDotCase,
  strHeaderCase,
  strKebabCase,
  strPascalCase,
  strSnakeCase,
  strTruncate,
} from './string/index.js';

// String
export { isBrowser, isNode } from './system/index.js';

// Typeguards
export { isDefined, isEmptyObject, isEmptyValue, isNumber, isString } from './typeguards/index.js';

// Custom Types
export type {
  GenericFunction,
  Mandatory,
  Nestable,
  NonNullish,
  Nullish,
  OverloadUnion,
  Primitive,
  Simplify,
  SmartPartial,
  TypeOfString,
  TypeOfType,
  UnionToIntersection,
  DeepPartial,
  DeepReadonly,
} from './types/common-types.js';
