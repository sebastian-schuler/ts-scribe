import { describe, expect, it } from 'bun:test';
import { flattenObject } from '../../src/object/index.js';

describe('flattenObject', () => {
  it('should flatten a simple nested object', () => {
    const input = {
      a: {
        b: {
          c: 1,
        },
      },
    };
    const expectedOutput = {
      'a.b.c': 1,
    };
    expect(flattenObject(input)).toEqual(expectedOutput);
  });

  it('should handle multiple nested keys', () => {
    const input = {
      a: {
        b: 1,
        c: {
          d: 2,
        },
      },
      e: 3,
    };
    const expectedOutput = {
      'a.b': 1,
      'a.c.d': 2,
      e: 3,
    };
    expect(flattenObject(input)).toEqual(expectedOutput);
  });

  it('should work with arrays', () => {
    const input = {
      a: [1, 2, 3],
      b: {
        c: [4, 5],
      },
    };
    const expectedOutput = {
      'a.0': 1,
      'a.1': 2,
      'a.2': 3,
      'b.c.0': 4,
      'b.c.1': 5,
    };
    expect(flattenObject(input)).toEqual(expectedOutput);
  });

  it('should return an empty object if input is an empty object', () => {
    const input = {};
    const expectedOutput = {};
    expect(flattenObject(input)).toEqual(expectedOutput);
  });

  it('should handle an object with no nesting', () => {
    const input = {
      a: 1,
      b: 2,
    };
    const expectedOutput = {
      a: 1,
      b: 2,
    };
    expect(flattenObject(input)).toEqual(expectedOutput);
  });

  it('should respect the prefix argument', () => {
    const input = {
      a: {
        b: 1,
      },
    };
    const expectedOutput = {
      '$.a.b': 1,
    };
    expect(flattenObject(input, '$')).toEqual(expectedOutput);
  });

  it('should handle objects with null or undefined values', () => {
    const input = {
      a: null,
      b: {
        c: undefined,
      },
    };
    const expectedOutput = {
      a: null,
      'b.c': undefined,
    };
    expect(flattenObject(input)).toEqual(expectedOutput);
  });

  it('should handle complex nested structures', () => {
    const input = {
      a: {
        b: {
          c: {
            d: 1,
          },
        },
        e: [1, { f: 2 }],
      },
    };
    const expectedOutput = {
      'a.b.c.d': 1,
      'a.e.0': 1,
      'a.e.1.f': 2,
    };
    expect(flattenObject(input)).toEqual(expectedOutput);
  });
});
