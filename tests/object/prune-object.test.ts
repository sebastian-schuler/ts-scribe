import { describe, expect, it } from 'vitest';
import { pruneObject } from '../../src/object';

describe('pruneObject', () => {
  it('should remove undefined values from a flat object', () => {
    const input = { a: 1, b: undefined, c: 'test', d: null };
    const expected = { a: 1, c: 'test', d: null };
    expect(pruneObject(input)).toEqual(expected);
  });

  it('should remove undefined values recursively from nested objects', () => {
    const input = {
      a: 1,
      b: undefined,
      c: {
        d: undefined,
        e: 'nested',
        f: {
          g: undefined,
          h: 'deep',
        },
      },
    };
    const expected = {
      a: 1,
      c: {
        e: 'nested',
        f: {
          h: 'deep',
        },
      },
    };
    expect(pruneObject(input)).toEqual(expected);
  });

  it('should remove undefined values from arrays', () => {
    const input = [1, undefined, 2, undefined, 3];
    const expected = [1, 2, 3];
    expect(pruneObject(input)).toEqual(expected);
  });

  it('should handle mixed objects and arrays', () => {
    const input = {
      a: [1, undefined, 2],
      b: {
        c: [undefined, 'test', undefined],
        d: undefined,
      },
    };
    const expected = {
      a: [1, 2],
      b: {
        c: ['test'],
      },
    };
    expect(pruneObject(input)).toEqual(expected);
  });

  it('should return an empty object if all values are undefined', () => {
    const input = { a: undefined, b: undefined };
    const expected = {};
    expect(pruneObject(input)).toEqual(expected);
  });

  it('should return an empty array if all elements are undefined', () => {
    const input = [undefined, undefined];
    const expected: any[] = [];
    expect(pruneObject(input)).toEqual(expected);
  });

  it('should handle null values properly', () => {
    const input = { a: null, b: undefined };
    const expected = { a: null };
    expect(pruneObject(input)).toEqual(expected);
  });

  it('should handle empty objects and arrays', () => {
    const input = { a: {}, b: [], c: undefined };
    const expected = { a: {}, b: [] };
    expect(pruneObject(input)).toEqual(expected);
  });

  it('should not remove falsy values other than undefined', () => {
    const input = { a: false, b: 0, c: '', d: undefined };
    const expected = { a: false, b: 0, c: '' };
    expect(pruneObject(input)).toEqual(expected);
  });

  it('should handle complex nested structures', () => {
    const input = {
      a: [
        {
          b: undefined,
          c: 'value',
          d: [undefined, { e: undefined, f: 'deep' }],
        },
      ],
      g: undefined,
    };
    const expected = {
      a: [
        {
          c: 'value',
          d: [
            {
              f: 'deep',
            },
          ],
        },
      ],
    };
    expect(pruneObject(input)).toEqual(expected);
  });

  it('should return a new object and not mutate the original input', () => {
    const input = { a: undefined, b: 1 };
    const inputCopy = { ...input };
    pruneObject(input);
    expect(input).toEqual(inputCopy);
  });
});
