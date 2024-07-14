import { smallestCommonMultiple } from '../../src/math';

describe('smallestCommonMultiple', () => {
  it('it should calculate the greatest common divisor of any amount of numbers', () => {
    expect(smallestCommonMultiple(12, 15, 75)).toBe(300);
    expect(smallestCommonMultiple(5, 100)).toBe(100);
    expect(smallestCommonMultiple(100)).toBe(100);
    expect(smallestCommonMultiple(3, 77, 2, 9, 7, 123)).toBe(56826);
    expect(smallestCommonMultiple(0)).toBe(0);
  });
});
