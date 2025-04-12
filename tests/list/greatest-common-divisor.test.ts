import { describe, expect, it } from 'bun:test';
import { greatestCommonDivisor } from '../../src/math/index.js';

describe('greatestCommonDivisor', () => {
  it('it should calculate the greatest common divisor of any amount of numbers', () => {
    expect(greatestCommonDivisor(18, 24)).toBe(6);
    expect(greatestCommonDivisor(7, 10, 81)).toBe(1);
    expect(greatestCommonDivisor(2940, 3150, 294)).toBe(42);
    expect(greatestCommonDivisor(2940, 3150, 294)).toBe(42);
    expect(greatestCommonDivisor(235)).toBe(235);
    expect(greatestCommonDivisor(28, 66, 800, 2)).toBe(2);
    expect(greatestCommonDivisor(0)).toBe(0);
  });
});
