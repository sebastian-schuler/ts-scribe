/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'bun:test';
import { parseNumber } from '../../src/core/index.js';

describe('parseNumber function', () => {
  it('should return parsed number when value is a valid integer string', () => {
    expect(parseNumber('123', 0, 'int')).toBe(123);
  });

  it('should return parsed number when value is a valid floating point string', () => {
    expect(parseNumber('3.14', 0)).toBe(3.14);
  });

  it('should return default value when value is null and default value is provided', () => {
    expect(parseNumber(null, 100, 'int')).toBe(100);
  });

  it('should return default value when value is undefined and default value is provided', () => {
    expect(parseNumber(undefined, 100, 'int')).toBe(100);
  });

  it('should return default value when value is an empty string and default value is provided', () => {
    expect(parseNumber('', 100, 'float')).toBe(100);
  });

  it('should return default value when type is "int" and value is float', () => {
    expect(parseNumber('3.14', 0, 'int')).toBe(0);
  });

  it('should return parsed floating point number when type is "float"', () => {
    expect(parseNumber('123', 0)).toBe(123);
  });

  it('should throw error when throw is true and value is not a number', () => {
    expect(() => parseNumber('3sdasd', 0, 'float', true)).toThrow(TypeError);
  });

  it('should throw error when throw is true and value is object', () => {
    const value = { val: '3sdasd' } as any;
    expect(() => parseNumber(value, 0, 'float', true)).toThrow(TypeError);
  });
});
