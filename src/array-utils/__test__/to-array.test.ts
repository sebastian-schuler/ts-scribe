import { describe, expect, it } from '@jest/globals';
import { toArray } from '../to-array';

describe('toArray', () => {
  it('should convert a single value to an array', () => {
    expect(toArray(5)).toEqual([5]);
    expect(toArray('hello')).toEqual(['hello']);
    expect(toArray(true)).toEqual([true]);
    expect(toArray({ key: 'value' })).toEqual([{ key: 'value' }]);
  });

  it('should convert an array-like object to an array', () => {
    const arrayLike = { 0: 'a', 1: 'b', length: 2 };
    expect(toArray(arrayLike)).toEqual(['a', 'b']);
  });

  it('should convert an iterable object to an array', () => {
    const iterable = new Set([1, 2, 3]);
    expect(toArray(iterable)).toEqual([1, 2, 3]);
  });

  it('should return an empty array for null or undefined', () => {
    expect(toArray(null)).toEqual([]);
    expect(toArray(undefined)).toEqual([]);
  });

  it('should return an array with the same value if already an array', () => {
    const array = [1, 2, 3];
    expect(toArray(array)).toEqual(array);
  });

  it('should return an array with the same value if already an iterable object', () => {
    const iterable = new Set([1, 2, 3]);
    expect(toArray(iterable)).toEqual(Array.from(iterable));
  });

  it('should return an array with the same value if already an array-like object', () => {
    const arrayLike = { 0: 'a', 1: 'b', length: 2 };
    expect(toArray(arrayLike)).toEqual(Array.from(arrayLike));
  });
});
