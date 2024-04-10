import { deepEquals } from './deep-equals';
import { deepMerge } from './deep-merge';
import { deepClone } from './deepClone/deepClone';
import { parseBoolean } from './parse-boolean';
import { parseNumber } from './parse-number';

/**
 * A collection of object utilities.
 */
export const ObjectUtils = {
  deepEquals,
  deepMerge: deepMerge,
  deepClone,
  parseBoolean,
  parseNumber,
};
