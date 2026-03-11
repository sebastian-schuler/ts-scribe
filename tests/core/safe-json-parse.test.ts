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

	it('should run the onError function if parsing fails', () => {
		// @ts-expect-error - Testing onError invocation on parse failure
		const callbackMock = spyOn({ fn() {} }, 'fn');
		const jsonString = '{invalid json}';
		const fallbackValue = { name: 'Fallback', age: 0 };

		// @ts-expect-error - Testing onError invocation on parse failure
		safeJsonParse(jsonString, fallbackValue, { onError: callbackMock });

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
		expect(consoleErrorMock.mock.calls[0][2]).toBe('Input string:');
		expect(consoleErrorMock.mock.calls[0][3]).toBe(jsonString);
		consoleErrorMock.mockRestore();
	});

	it('should not log if logError is true and parsing succeeds', () => {
		const consoleErrorMock = spyOn(console, 'error').mockImplementation(() => {});

		safeJsonParse('{"ok": true}', {}, { logError: true });

		expect(consoleErrorMock).not.toHaveBeenCalled();
		consoleErrorMock.mockRestore();
	});

	it('should not call onError if parsing succeeds', () => {
		// @ts-expect-error - Testing onError is not called on success
		const onError = spyOn({ fn() {} }, 'fn');

		// @ts-expect-error - Testing onError is not called on success
		safeJsonParse('{"ok": true}', {}, { onError });

		expect(onError).not.toHaveBeenCalled();
	});

	it('should invoke both onError and log when both options are set and parsing fails', () => {
		const consoleErrorMock = spyOn(console, 'error').mockImplementation(() => {});
		// @ts-expect-error - Testing combined onError and logError
		const onError = spyOn({ fn() {} }, 'fn');
		const jsonString = '{bad}';
		const fallbackValue = { x: 0 };

		// @ts-expect-error - Testing combined onError and logError
		safeJsonParse(jsonString, fallbackValue, { onError, logError: true });

		expect(consoleErrorMock).toHaveBeenCalledTimes(1);
		expect(onError).toHaveBeenCalledTimes(1);
		expect(onError).toHaveBeenCalledWith(expect.any(Error));
		consoleErrorMock.mockRestore();
	});

	it('should parse JSON primitive values correctly', () => {
		expect(safeJsonParse('42', 0)).toBe(42);
		expect(safeJsonParse('true', false)).toBe(true);
		expect(safeJsonParse('false', true)).toBe(false);
		expect(safeJsonParse('null', 'default')).toBeNull();
		expect(safeJsonParse('"hello"', '')).toBe('hello');
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
