import { randomBool } from './random-bool';
import { randomInt } from './random-int';
import { randomSample } from './random-sample';
import { randomString } from './random-string';

/**
 * A collection of utilities for generating random values.
 */
export const RandomUtils = {
  string: randomString,
  int: randomInt,
  bool: randomBool,
  sample: randomSample,
};
