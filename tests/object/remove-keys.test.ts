import { describe, expect, it } from 'bun:test';
import { removeKeys } from '../../src/object/index.js';

describe('removeKeys', () => {
  it('should remove a single key from the object', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = removeKeys(obj, ['b']);

    expect(result).toEqual({ a: 1, c: 3 });
  });

  it('should remove multiple keys from the object', () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 };
    const result = removeKeys(obj, ['b', 'd']);

    expect(result).toEqual({ a: 1, c: 3 });
  });

  it('should return the original object if no keys are specified', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = removeKeys(obj, []);

    expect(result).toEqual(obj); // Should return the same object
  });

  it('should not mutate the original object', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const originalObj = { ...obj };

    removeKeys(obj, ['b']);

    // Check that the original object is unchanged
    expect(obj).toEqual(originalObj);
  });

  it('should handle empty objects gracefully', () => {
    const obj = {};

    // Should throw a TypeError if the function tries to access a property of an empty object
    // @ts-expect-error
    const result = removeKeys(obj, ['a']);

    expect(result).toEqual({}); // Should return an empty object
  });

  it('should return the same object if the key to remove does not exist', () => {
    const obj = { a: 1, b: 2 };

    // Should throw a TypeError if the function tries to access a property of an empty object
    // @ts-expect-error
    const result = removeKeys(obj, ['c']); // 'c' doesn't exist in the object

    expect(result).toEqual(obj); // Should return the same object
  });

  it('should not alter the type of the object when removing keys', () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 };
    const result = removeKeys(obj, ['b', 'd']);

    // TypeScript should ensure result has only 'a' and 'c'
    expect(result).toEqual({ a: 1, c: 3 });
  });
});
