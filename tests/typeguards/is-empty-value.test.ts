import { describe, expect, it } from 'bun:test';
import { isEmptyValue } from '../../src/typeguards/index.js';

describe('isEmptyValue function', () => {
  // Test null value
  it('should return true for null', () => {
    expect(isEmptyValue(null)).toBe(true);
  });

  // Test undefined value
  it('should return true for undefined', () => {
    expect(isEmptyValue(undefined)).toBe(true);
  });

  // Test empty string
  it('should return true for empty string', () => {
    expect(isEmptyValue('')).toBe(true);
  });

  // Test string with only spaces
  it('should return true for string with only spaces', () => {
    expect(isEmptyValue('   ')).toBe(true);
  });

  // Test non-empty string
  it('should return false for non-empty string', () => {
    expect(isEmptyValue('hello')).toBe(false);
  });

  // Test empty array
  it('should return true for empty array', () => {
    expect(isEmptyValue([])).toBe(true);
  });

  // Test non-empty array
  it('should return false for non-empty array', () => {
    expect(isEmptyValue([1, 2, 3])).toBe(false);
  });

  // Test empty object
  it('should return true for empty object', () => {
    expect(isEmptyValue({})).toBe(true);
  });

  // Test object with properties
  it('should return false for object with properties', () => {
    expect(isEmptyValue({ key: 'value' })).toBe(false);
  });

  // Test number (should not be considered empty)
  it('should return false for number', () => {
    expect(isEmptyValue(0)).toBe(false);
  });

  // Test boolean (should not be considered empty)
  it('should return false for boolean', () => {
    expect(isEmptyValue(true)).toBe(false);
  });

  // Test non-empty array with mixed types
  it('should return false for non-empty array with mixed types', () => {
    expect(isEmptyValue([null, 1, 'string'])).toBe(false);
  });

  // Test object with nested empty object
  it('should return false for object with a nested empty object', () => {
    expect(isEmptyValue({ nested: {} })).toBe(false);
  });
});
