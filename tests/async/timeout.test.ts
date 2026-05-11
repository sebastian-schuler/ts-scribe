import { describe, expect, it } from 'bun:test';
import { timeout } from '../../src/async/index.js';

describe('timeout', () => {
	// -------------------------------------------------------------------------
	// Happy path
	// -------------------------------------------------------------------------

	it('resolves when the promise settles before the deadline', async () => {
		const result = await timeout(Promise.resolve(42), 100);
		expect(result).toBe(42);
	});

	it('has correct type inference for the resolved value', async () => {
		const value: string = await timeout(Promise.resolve('hello'), 100);
		expect(value).toBe('hello');
	});

	it.each([
		['false', false],
		['zero', 0],
		['empty string', ''],
		['null', null],
	] as const)('propagates falsy resolved value: %s', async (_, value) => {
		const result = await timeout(Promise.resolve(value), 100);
		expect(result).toBe(value);
	});

	// -------------------------------------------------------------------------
	// Deadline exceeded
	// -------------------------------------------------------------------------

	it('rejects with an AbortError when the deadline is exceeded', async () => {
		const never = new Promise<never>(() => {});
		await expect(timeout(never, 20)).rejects.toMatchObject({
			name: 'AbortError',
		});
	});

	it('rejects with code 20 when the deadline is exceeded', async () => {
		const never = new Promise<never>(() => {});
		await expect(timeout(never, 20)).rejects.toMatchObject({ code: 20 });
	});

	it('rejects with the default message when the deadline is exceeded', async () => {
		const never = new Promise<never>(() => {});
		await expect(timeout(never, 20)).rejects.toMatchObject({
			message: 'Timed out after 20ms',
		});
	});

	it('rejects with a custom message when provided', async () => {
		const never = new Promise<never>(() => {});
		await expect(timeout(never, 20, { message: 'Query timed out' })).rejects.toMatchObject({
			name: 'AbortError',
			message: 'Query timed out',
		});
	});

	it('treats zero ms as an immediate deadline', async () => {
		const never = new Promise<never>(() => {});
		await expect(timeout(never, 0)).rejects.toMatchObject({ name: 'AbortError' });
	});

	it('treats negative ms as an immediate deadline', async () => {
		const never = new Promise<never>(() => {});
		await expect(timeout(never, -50)).rejects.toMatchObject({ name: 'AbortError' });
	});

	it('throws a RangeError when ms is NaN', async () => {
		const never = new Promise<never>(() => {});
		await expect(timeout(never, Number.NaN)).rejects.toThrow(RangeError);
	});

	// -------------------------------------------------------------------------
	// Rejection forwarding
	// -------------------------------------------------------------------------

	it('forwards the original Error rejection when the promise rejects before the deadline', async () => {
		const failing = Promise.reject(new Error('original error'));
		await expect(timeout(failing, 100)).rejects.toThrow('original error');
	});

	it('wraps a non-Error rejection in an Error', async () => {
		const failing = Promise.reject('just a string');
		const result = timeout(failing, 100);
		await expect(result).rejects.toBeInstanceOf(Error);
		await expect(result).rejects.toMatchObject({ message: 'just a string' });
	});

	it('wraps a numeric non-Error rejection in an Error', async () => {
		const failing = Promise.reject(42);
		await expect(timeout(failing, 100)).rejects.toMatchObject({ message: '42' });
	});

	// -------------------------------------------------------------------------
	// AbortSignal — pre-aborted
	// -------------------------------------------------------------------------

	it('rejects immediately when an already-aborted signal is provided', async () => {
		const controller = new AbortController();
		controller.abort('cancelled');
		await expect(timeout(Promise.resolve(1), 100, { signal: controller.signal })).rejects.toMatchObject({
			name: 'AbortError',
			code: 20,
		});
	});

	it('rejects immediately when signal is pre-aborted with an Error reason', async () => {
		const controller = new AbortController();
		controller.abort(new Error('pre-aborted'));
		await expect(timeout(Promise.resolve(1), 100, { signal: controller.signal })).rejects.toMatchObject({
			name: 'AbortError',
			message: 'pre-aborted',
		});
	});

	// -------------------------------------------------------------------------
	// AbortSignal — fires during wait
	// -------------------------------------------------------------------------

	it('rejects when the signal fires before the deadline', async () => {
		const controller = new AbortController();
		const never = new Promise<never>(() => {});
		const result = timeout(never, 10_000, { signal: controller.signal });

		setTimeout(() => controller.abort('cancelled'), 10);

		await expect(result).rejects.toMatchObject({ name: 'AbortError', code: 20 });
	});

	it('rejects with an AbortError using the Error reason from the signal', async () => {
		const controller = new AbortController();
		const never = new Promise<never>(() => {});
		const result = timeout(never, 10_000, { signal: controller.signal });

		setTimeout(() => controller.abort(new Error('signal reason')), 10);

		await expect(result).rejects.toMatchObject({ name: 'AbortError', message: 'signal reason' });
	});

	// -------------------------------------------------------------------------
	// Cleanup — no dangling listeners or unhandled rejections
	// -------------------------------------------------------------------------

	it('removes the abort listener after the promise resolves', async () => {
		const controller = new AbortController();
		await timeout(Promise.resolve('done'), 5_000, { signal: controller.signal });

		// Aborting after resolution must not produce an unhandled rejection
		controller.abort('too late');
		await Promise.resolve(); // flush microtasks
		// If we reach here without an unhandled rejection the test passes
	});

	it('removes the abort listener after the promise rejects before the deadline', async () => {
		const controller = new AbortController();
		await expect(
			timeout(Promise.reject(new Error('early fail')), 5_000, { signal: controller.signal }),
		).rejects.toThrow('early fail');

		// Aborting after rejection must not produce an unhandled rejection
		controller.abort('too late');
		await Promise.resolve();
	});

	it('clears the deadline timer when the promise resolves early', async () => {
		// A 5-second timer that is never fired — if it weren't cleared the
		// process/test runner would hang waiting for it.
		const result = await timeout(Promise.resolve('done'), 5_000);
		expect(result).toBe('done');
	});
});
