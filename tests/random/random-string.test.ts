import { describe, expect, it } from 'bun:test';
import { randomString } from '../../src/random/index.js';

describe('randomString', () => {
  it('should generate a random string of specified length with default options', () => {
    const length = 150;
    const result = randomString(length);
    expect(result.length).toBe(length);
    expect(/^[A-Za-z0-9!@#$%^&*()_\-+=<>?/[\]{}.,:;]+$/.test(result)).toBe(true);
  });

  it('should generate a random string without including numbers and symbols', () => {
    const length = 150;
    const result = randomString(length, { includeNumbers: false, includeSymbols: false });
    expect(result.length).toBe(length);
    expect(/^[A-Za-z]+$/.test(result)).toBe(true);
  });

  it('should generate a random string including numbers but not symbols', () => {
    const length = 150;
    const result = randomString(length, { includeNumbers: true, includeSymbols: false });
    expect(result.length).toBe(length);
    expect(/^[A-Za-z0-9]+$/.test(result)).toBe(true);
  });

  it('should generate a random string including numbers and symbols', () => {
    const length = 150;
    const result = randomString(length, { includeNumbers: true, includeSymbols: true });
    expect(result.length).toBe(length);
    expect(/^[A-Za-z0-9!@#$%^&*()_\-+=<>?/[\]{}.,:;]+$/.test(result)).toBe(true);
  });

  it('should generate a random string of length 0 if provided', () => {
    const length = 0;
    const result = randomString(length);
    expect(result.length).toBe(length);
  });
});
