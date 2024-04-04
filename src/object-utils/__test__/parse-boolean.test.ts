import { parseBoolean } from '../parse-boolean';

describe('parseBoolean', () => {
  // Test cases for valid inputs
  it('should parse string "true" to true', () => {
    expect(parseBoolean('true')).toBe(true);
  });

  it('should parse string "false" to false', () => {
    expect(parseBoolean('false')).toBe(false);
  });

  it('should parse boolean true to true', () => {
    expect(parseBoolean(true)).toBe(true);
  });

  it('should parse boolean false to false', () => {
    expect(parseBoolean(false)).toBe(false);
  });

  it('should parse number 1 to true', () => {
    expect(parseBoolean(1)).toBe(true);
  });

  it('should parse number 0 to false', () => {
    expect(parseBoolean(0)).toBe(false);
  });

  it('should return the default value when input is null', () => {
    expect(parseBoolean(null, true)).toBe(true);
    expect(parseBoolean(null, false)).toBe(false);
  });

  it('should return the default value when input is undefined', () => {
    expect(parseBoolean(undefined, true)).toBe(true);
    expect(parseBoolean(undefined, false)).toBe(false);
  });

  // Test cases for invalid inputs
  it('should throw an error when throwInvalid is true and input is invalid', () => {
    expect(() => {
      parseBoolean('invalid', false, true);
    }).toThrow();
  });

  it('should return the default value when throwInvalid is false and input is invalid', () => {
    expect(parseBoolean('invalid', false, false)).toBe(false);
  });
});
