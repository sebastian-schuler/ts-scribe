import { isEmptyObject } from '../is-empty-object';

describe('isEmptyObject', () => {
  it('should return true for an empty object', () => {
    const obj = {};
    expect(isEmptyObject(obj)).toBe(true);
  });

  it('should return false for an object with properties', () => {
    const obj = {
      a: 1,
      b: 'hello',
      c: [1, 2, 3],
      d: {
        nested: true,
      },
    };
    expect(isEmptyObject(obj)).toBe(false);
  });

  it('should return true for an object with no enumerable properties', () => {
    const obj = Object.create(null);
    expect(isEmptyObject(obj)).toBe(true);
  });

  it('should return false for non-empty arrays and non-object values', () => {
    expect(isEmptyObject([])).toBe(false);
    expect(isEmptyObject([1, 2, 3])).toBe(false);
  });
});
