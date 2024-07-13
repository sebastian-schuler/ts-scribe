import { safeJsonParse } from '../safe-json-parse';

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
    // Mock console.error to capture logs
    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});

    const jsonString = '{name: "John", age: 30}';
    const fallbackValue = { name: 'Fallback', age: 0 };
    safeJsonParse(jsonString, fallbackValue, () => console.error('Error parsing JSON'));

    expect(consoleErrorMock).toHaveBeenCalledTimes(1);
    expect(consoleErrorMock).toHaveBeenCalledWith(expect.stringContaining('Error parsing JSON'));

    consoleErrorMock.mockRestore();
  });
});
