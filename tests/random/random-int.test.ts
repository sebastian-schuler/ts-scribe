import { randomInt } from '../../src/random';

describe('randomInt', () => {
  it('should generate a random number within the specified range', () => {
    const min = 1;
    const max = 10;
    const result = randomInt(min, max);
    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
  });

  it('should generate a random number with default range if not provided', () => {
    const result = randomInt();
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(Number.MAX_VALUE);
  });

  it('should generate a random number with specified min value and default max value', () => {
    const min = 100;
    const result = randomInt(min);
    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(Number.MAX_VALUE);
  });

  it('should generate a random number with specified max value and default min value', () => {
    const max = 500;
    const result = randomInt(undefined, max);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(max);
  });

  it('should return NaN if provided invalid range', () => {
    const min = 10;
    const max = 5;
    const result = randomInt(min, max);
    expect(result).toBeNaN();
  });

  it('should return a number inclusive of the range', () => {
    const min = 0;
    const max = 1;
    const result = randomInt(min, max);
    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
  });
});
