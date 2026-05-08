import { describe, expect, test } from 'bun:test';
import { createAbortError } from '../../src/async/index.js';

describe('createAbortError', () => {
	test('should preserve an Error reason and set AbortError name/code', () => {
		const original = new Error('something went wrong');
		const result = createAbortError(original);

		expect(result).toBe(original); // same reference
		expect(result.name).toBe('AbortError');
		expect((result as any).code).toBe(20);
		expect(result.message).toBe('something went wrong');
	});

	test('should wrap a string reason in an Error', () => {
		const result = createAbortError('timeout');

		expect(result).toBeInstanceOf(Error);
		expect(result.name).toBe('AbortError');
		expect((result as any).code).toBe(20);
		expect(result.message).toBe('timeout');
	});

	test('should wrap a number reason in an Error', () => {
		const result = createAbortError(42);

		expect(result).toBeInstanceOf(Error);
		expect(result.name).toBe('AbortError');
		expect((result as any).code).toBe(20);
		expect(result.message).toBe('42');
	});

	test('should wrap undefined reason in an Error', () => {
		const result = createAbortError(undefined);

		expect(result).toBeInstanceOf(Error);
		expect(result.name).toBe('AbortError');
		expect((result as any).code).toBe(20);
		expect(result.message).toBe('undefined');
	});

	test('should wrap null reason in an Error', () => {
		const result = createAbortError(null);

		expect(result).toBeInstanceOf(Error);
		expect(result.name).toBe('AbortError');
		expect((result as any).code).toBe(20);
		expect(result.message).toBe('null');
	});

	test('should wrap an object reason in an Error', () => {
		const result = createAbortError({ detail: 'custom' });

		expect(result).toBeInstanceOf(Error);
		expect(result.name).toBe('AbortError');
		expect((result as any).code).toBe(20);
		expect(result.message).toBe('[object Object]');
	});

	test('should not double-wrap an Error that already has AbortError name', () => {
		const original = new Error('cancelled');
		original.name = 'AbortError';
		(original as any).code = 20;

		const result = createAbortError(original);

		expect(result).toBe(original);
		expect(result.name).toBe('AbortError');
		expect((result as any).code).toBe(20);
	});

	test('should handle DOMException (read-only name/code) by wrapping', () => {
		// Bun creates a DOMException for AbortController.abort() without args.
		// DOMException has read-only .name and .code getters.
		const controller = new AbortController();
		controller.abort();
		const domException = controller.signal.reason;

		const result = createAbortError(domException);

		expect(result).toBeInstanceOf(Error);
		expect(result.name).toBe('AbortError');
		expect((result as any).code).toBe(20);
		expect(result.message).toBe(domException.message);
		expect(result.cause).toBe(domException);
	});
});
