import { deepmerge, deepmergeCustom, deepmergeInto, deepmergeIntoCustom } from 'deepmerge-ts';

// Re-Exported
export { deepmerge, deepmergeCustom, deepmergeInto, deepmergeIntoCustom };

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
export { asyncForEach, asyncMap, debounce, maybe, retry, sleep, waterfall } from './async/index.js';
export type { Maybe, RetryHandler, RetryOptions, Semaphore } from './async/index.js';

// Core
export { parseBoolean, parseNumber, run, safeJsonParse } from './core/index.js';

// Development
export { benchmark } from './development/index.js';

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
  strSlugify,
  strSnakeCase,
  strTruncate,
} from './string/index.js';

// System
export { getEnvironment, isBrowser, isNode } from './system/index.js';

// Typeguards
export { isDefined, isEmptyObject, isEmptyValue, isNumber, isString, isNotDefined } from './typeguards/index.js';

// Custom Types
export type {
  DeepPartial,
  DeepReadonly,
  GenericFunction,
  Mandatory,
  Nestable,
  NonNullish,
  Nullish,
  OverloadUnion,
  Primitive,
  Serializable,
  Simplify,
  SmartPartial,
  TypeOfString,
  TypeOfType,
  UnionToIntersection,
} from './types/common-types.js';
