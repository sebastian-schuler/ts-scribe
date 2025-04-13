import { describe, expect, it, spyOn } from 'bun:test';
import { safeJsonParse } from '../../src/core/index.js';

describe('safeJsonParse', () => {
  it('should parse a valid JSON string correctly', () => {
    const jsonString = '{"name": "John", "age": 30}';
    const parsedObject = safeJsonParse(jsonString, { name: '', age: 0 });

    expect(parsedObject).toEqual({ name: 'John', age: 30 });
  });

  it('should return the fallback value for an empty JSON string', () => {
    const jsonString = '';
    const fallbackValue = { name: 'Fallback', age: 0 };
    const parsedObject = safeJsonParse(jsonString, fallbackValue);

    expect(parsedObject).toEqual(fallbackValue);
  });

  it('should return the fallback value for an invalid JSON string', () => {
    const jsonString = '{name: "John", age: 30}';
    const fallbackValue = { name: 'Fallback', age: 0 };
    const parsedObject = safeJsonParse(jsonString, fallbackValue);

    expect(parsedObject).toEqual(fallbackValue);
  });

  it('should handle JSON parsing errors gracefully and return the fallback value', () => {
    const jsonString = 'not a JSON string';
    const fallbackValue = { name: 'Fallback', age: 0 };
    const parsedObject = safeJsonParse(jsonString, fallbackValue);

    expect(parsedObject).toEqual(fallbackValue);
  });

  it('should run the callback function if parsing fails', () => {
    const callbackMock = spyOn({ fn: () => {} }, 'fn');
    const jsonString = '{invalid json}';
    const fallbackValue = { name: 'Fallback', age: 0 };

    safeJsonParse(jsonString, fallbackValue, { callback: callbackMock });

    expect(callbackMock).toHaveBeenCalledTimes(1);
    expect(callbackMock).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should log an error if logError is true and parsing fails', () => {
    const consoleErrorMock = spyOn(console, 'error').mockImplementation(() => {});
    const jsonString = 'invalid';
    const fallbackValue = { error: true };

    safeJsonParse(jsonString, fallbackValue, {
      logError: true,
    });

    expect(consoleErrorMock).toHaveBeenCalledTimes(1);
    expect(consoleErrorMock.mock.calls[0][0]).toBe('Failed to parse JSON:');
    consoleErrorMock.mockRestore();
  });

  it('should use the reviver function during parsing', () => {
    const jsonString = '{"name": "alice", "age": 25}';
    const fallbackValue = { name: '', age: 0 };

    const parsedObject = safeJsonParse(jsonString, fallbackValue, {
      reviver: (key, value) => (key === 'name' ? value.toUpperCase() : value),
    });

    expect(parsedObject).toEqual({ name: 'ALICE', age: 25 });
  });
});
