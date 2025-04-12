import { describe, expect, it } from 'bun:test';
import { deepMerge } from '../../src/object/index.js';

describe('deepmerge', () => {
  it('should merge multiple objects deeply', () => {
    const obj1 = {
      a: 1,
      b: {
        c: 2,
        d: [3, 4],
      },
    };

    const obj2 = {
      b: {
        d: [5],
      },
      e: 6,
    };

    const obj3 = {
      f: {
        g: {
          h: 7,
        },
      },
    };

    const result = deepMerge(obj1, obj2, obj3);

    expect(result).toEqual({
      a: 1,
      b: {
        c: 2,
        d: [3, 4, 5],
      },
      e: 6,
      f: {
        g: {
          h: 7,
        },
      },
    });
  });

  it('should not mutate the original objects', () => {
    const obj1 = {
      a: 1,
      b: {
        c: 2,
      },
    };

    const obj2 = {
      b: {
        d: 3,
      },
    };

    const obj1Copy = { ...obj1 };
    const obj2Copy = { ...obj2 };

    deepMerge(obj1, obj2);

    expect(obj1).toEqual(obj1Copy);
    expect(obj2).toEqual(obj2Copy);
  });
});
