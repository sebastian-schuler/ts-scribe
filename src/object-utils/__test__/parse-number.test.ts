import { parseNumber } from '../parse-number';

describe('parseNumber function', () => {
  it('should parse a valid integer string', () => {
    expect(parseNumber('123', 0, 'int')).toBe(123);
  });

  it('should parse a valid float string', () => {
    expect(parseNumber('3.14', 0, 'float')).toBe(3.14);
  });

  it('should return default value if value is null', () => {
    expect(parseNumber(null, 0)).toBe(0);
  });

  it('should return default value if value is undefined', () => {
    expect(parseNumber(undefined, 0)).toBe(0);
  });

  it('should return default value if value is an empty string', () => {
    expect(parseNumber('', 0)).toBe(0);
  });

  it('should return default value if value is NaN', () => {
    expect(parseNumber('hello', 0)).toBe(0);
  });

  it('should return default value if value is Infinity', () => {
    expect(parseNumber(Infinity, 0)).toBe(0);
  });

  it('should return default value if value is -Infinity', () => {
    expect(parseNumber(-Infinity, 0)).toBe(0);
  });

  it('should throw an error if throwInvalid is true and value is invalid', () => {
    expect(() => parseNumber('hello', 0, 'float', true)).toThrow(TypeError);
  });

  it('should return default value if value is not an integer and type is int', () => {
    expect(parseNumber(3.14, 0, 'int')).toBe(0);
  });

  it('should return parsed float value if value is not an integer and type is float', () => {
    expect(parseNumber(3.14, 0, 'float')).toBe(3.14);
  });

  it('should return parsed float value if value is a float string and type is int', () => {
    expect(parseNumber('3.14', 0, 'int')).toBe(3.14);
  });

  it('should return default value if value is an empty string and type is int', () => {
    expect(parseNumber('', 0, 'int')).toBe(0);
  });
});
