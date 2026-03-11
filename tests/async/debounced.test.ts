import { describe, expect, it, jest } from 'bun:test';
import { debounce } from '../../src/async/index.js';

describe('debounce', () => {
	it('calls the function after the wait time', async () => {
		const fn = jest.fn();
		const debounced = debounce(fn, 100);
		debounced();

		expect(fn).not.toHaveBeenCalled();

		await new Promise((res) => setTimeout(res, 150));
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('resets the wait time if called again', async () => {
		const fn = jest.fn();
		const debounced = debounce(fn, 100);

		debounced();
		await new Promise((res) => setTimeout(res, 50));
		debounced();
		await new Promise((res) => setTimeout(res, 50));
		expect(fn).not.toHaveBeenCalled();

		await new Promise((res) => setTimeout(res, 60));
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('calls function immediately if immediate=true', async () => {
		const fn = jest.fn();
		const debounced = debounce(fn, 100, true);
		debounced();

		expect(fn).toHaveBeenCalledTimes(1);

		// Should not call again until the debounce window expires
		await new Promise((res) => setTimeout(res, 150));
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('does not call again if called multiple times immediately with immediate=true', async () => {
		const fn = jest.fn();
		const debounced = debounce(fn, 100, true);
		debounced();
		debounced();
		debounced();

		expect(fn).toHaveBeenCalledTimes(1);
		await new Promise((res) => setTimeout(res, 150));
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('respects the correct this context', async () => {
		const context = {
			value: 42,
			handler(this: any) {
				calledWithThis = this.value;
			},
		};

		let calledWithThis = 0;
		const debounced = debounce(context.handler, 100);

		debounced.call(context);
		await new Promise((res) => setTimeout(res, 120));

		expect(calledWithThis).toBe(42);
	});

	it('passes arguments correctly to the function', async () => {
		const fn = jest.fn();
		const debounced = debounce(fn, 100);
		const testArg = { id: 1, name: 'test' };

		debounced(testArg);
		await new Promise((res) => setTimeout(res, 120));

		expect(fn).toHaveBeenCalledWith(testArg);
	});

	it('forwards multiple arguments to the wrapped function', async () => {
		const fn = jest.fn();
		const debounced = debounce(fn, 100);

		debounced('a', 2, true);
		await new Promise((res) => setTimeout(res, 120));

		expect(fn).toHaveBeenCalledWith('a', 2, true);
	});

	it('allows multiple debounce cycles with immediate=true', async () => {
		const fn = jest.fn();
		const debounced = debounce(fn, 100, true);

		// First cycle
		debounced();
		expect(fn).toHaveBeenCalledTimes(1);

		// Wait for debounce window to expire
		await new Promise((res) => setTimeout(res, 120));

		// Second cycle - should call immediately again
		debounced();
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it('can debounce after the debounce window has completed', async () => {
		const fn = jest.fn();
		const debounced = debounce(fn, 100);

		// First debounce
		debounced();
		await new Promise((res) => setTimeout(res, 120));
		expect(fn).toHaveBeenCalledTimes(1);

		// Second debounce
		debounced();
		await new Promise((res) => setTimeout(res, 120));
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it('handles zero wait time', async () => {
		const fn = jest.fn();
		const debounced = debounce(fn, 0);
		debounced();

		// Even with 0ms wait, should be async
		expect(fn).not.toHaveBeenCalled();
		await new Promise((res) => setTimeout(res, 10));
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('cancels previous timeout when called multiple times', async () => {
		const fn = jest.fn();
		const debounced = debounce(fn, 200);

		debounced();
		await new Promise((res) => setTimeout(res, 100));
		debounced();
		await new Promise((res) => setTimeout(res, 100));
		debounced();

		// Still should not have been called
		expect(fn).not.toHaveBeenCalled();

		await new Promise((res) => setTimeout(res, 220));
		// Called exactly once, not three times
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('immediate=false waits even after first call', async () => {
		const fn = jest.fn();
		const debounced = debounce(fn, 100, false);

		debounced();
		expect(fn).not.toHaveBeenCalled();

		await new Promise((res) => setTimeout(res, 50));
		expect(fn).not.toHaveBeenCalled();

		await new Promise((res) => setTimeout(res, 60));
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('preserves this context and argument across immediate calls', async () => {
		let capturedThis: any;
		let capturedArg: any;
		const fn = jest.fn(function (this: any, arg: any) {
			capturedThis = this;
			capturedArg = arg;
		});

		const debounced = debounce(fn, 100, true);
		const context = { id: 'ctx' };
		const argument = { id: 'arg' };

		debounced.call(context, argument);

		expect(capturedThis).toBe(context);
		expect(capturedArg).toBe(argument);
	});

	it('only calls function once per debounce cycle with immediate=true', async () => {
		const fn = jest.fn();
		const debounced = debounce(fn, 100, true);

		debounced();
		debounced();
		debounced();

		expect(fn).toHaveBeenCalledTimes(1);

		await new Promise((res) => setTimeout(res, 120));
		// Should still be 1 - no deferred call with immediate=true
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('uses most recent call in large batch of calls', async () => {
		const fn = jest.fn();
		const debounced = debounce(fn, 50);

		for (let i = 0; i < 10; i++) {
			debounced(i);
		}

		expect(fn).not.toHaveBeenCalled();
		await new Promise((res) => setTimeout(res, 80));

		// Should only call once with the last argument
		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith(9);
	});

	it('immediate=true fires with the first call argument, not subsequent ones', async () => {
		const fn = jest.fn();
		const debounced = debounce(fn, 100, true);

		debounced('first');
		debounced('second');
		debounced('third');

		// Should call immediately with only the first argument
		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith('first');

		// After the debounce window, there should be no deferred call
		await new Promise((res) => setTimeout(res, 120));
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('immediate=true extends window on each call, preventing re-trigger until fully quiet', async () => {
		const fn = jest.fn();
		const debounced = debounce(fn, 100, true);

		// First call fires immediately
		debounced();
		expect(fn).toHaveBeenCalledTimes(1);

		// Rapid spaced calls keep resetting the window
		await new Promise((res) => setTimeout(res, 60));
		debounced();
		await new Promise((res) => setTimeout(res, 60));
		debounced();

		// Only 60ms since last call — still inside the 100ms window
		expect(fn).toHaveBeenCalledTimes(1);

		// Wait for the window to fully expire after the last call
		await new Promise((res) => setTimeout(res, 120));
		// Timer expired but should not have triggered a deferred call
		expect(fn).toHaveBeenCalledTimes(1);

		// A new call should now fire immediately again
		debounced();
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it('always returns undefined regardless of the wrapped function return value', async () => {
		const debounced = debounce(() => 42, 100);

		expect(debounced()).toBeUndefined();

		// After the debounce period, calls should still return undefined
		await new Promise((res) => setTimeout(res, 150));
		expect(debounced()).toBeUndefined();
	});

	it('immediate=true with wait=0 re-arms after the timeout expires', async () => {
		const fn = jest.fn();
		const debounced = debounce(fn, 0, true);

		debounced();
		expect(fn).toHaveBeenCalledTimes(1);

		// Wait for the 0ms timeout to fire and clear timeoutId
		await new Promise((res) => setTimeout(res, 10));

		// Window has elapsed, so next call fires immediately again
		debounced();
		expect(fn).toHaveBeenCalledTimes(2);
	});
});
