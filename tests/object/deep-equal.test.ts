/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'bun:test';
import { objectDeepEquals } from '../../src/object/index.js';

describe('deepEquals', () => {
  it('should return true for equal primitive values', () => {
    expect(objectDeepEquals(5, 5)).toBe(true);
    expect(objectDeepEquals('hello', 'hello')).toBe(true);
    expect(objectDeepEquals(true, true)).toBe(true);
    expect(objectDeepEquals(null, null)).toBe(true);
  });

  it('should return false for different primitive values', () => {
    expect(objectDeepEquals(5, 10)).toBe(false);
    expect(objectDeepEquals('hello', 'world')).toBe(false);
    expect(objectDeepEquals(true, false)).toBe(false);
    expect(objectDeepEquals(null, undefined)).toBe(false);
  });

  it('should return true for equal nested objects', () => {
    const obj1 = {
      a: 1,
      b: {
        c: 2,
        d: [3, 4],
      },
    };

    const obj2 = {
      a: 1,
      b: {
        c: 2,
        d: [3, 4],
      },
    };

    expect(objectDeepEquals(obj1, obj2)).toBe(true);
  });

  it('should return false for different nested objects', () => {
    const obj1 = {
      a: 1,
      b: {
        c: 2,
        d: [3, 4],
      },
    };

    const obj2 = {
      a: 1,
      b: {
        c: 2,
        d: [5, 6], // Different array values
      },
    };

    expect(objectDeepEquals(obj1, obj2)).toBe(false);
  });

  it('should handle arrays correctly', () => {
    const arr1 = [1, [2, 3], { a: 4 }];
    const arr2 = [1, [2, 3], { a: 4 }];
    const arr3 = [1, [2, 3], { a: 5 }]; // Different object value

    expect(objectDeepEquals(arr1, arr2)).toBe(true);
    expect(objectDeepEquals(arr1, arr3)).toBe(false);
  });

  it('should return false for objects with different number of keys', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 1 };

    expect(objectDeepEquals(obj1, obj2)).toBe(false);
  });

  it('should return true for objects with same keys but different order', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { b: 2, a: 1 };

    expect(objectDeepEquals(obj1, obj2)).toBe(true);
  });

  it('should handle circular references', () => {
    const obj1: any = {};
    obj1.a = obj1;

    const obj2: any = {};
    obj2.a = obj2;

    expect(objectDeepEquals(obj1, obj2)).toBe(true);
  });
});
