import { chunk } from './chunk';
import { difference } from './difference';
import { groupBy } from './group-by';
import { intersection } from './intersection';
import { pluck } from './pluck';
import { powerset } from './powerset';
import { toArray } from './to-array';
import { uniqueBy } from './unique-by';

/**
 * A collection of utilities for working with arrays.
 */
export const ArrayUtils = {
  toArray,
  powerset,
  chunk,
  difference,
  intersection,
  pluck,
  groupBy,
  uniqueBy,
};
