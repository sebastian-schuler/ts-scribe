import { describe, expect, it, jest } from 'bun:test';
import { debounce } from '../../src/async/index.js';

describe('debounce', () => {
	it('calls the function after the wait time', async () => {
		const fn = jest.fn();
		const debounced = debounce(100, fn);
		debounced.call(null, null);

		expect(fn).not.toHaveBeenCalled();

		await new Promise((res) => setTimeout(res, 150));
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('resets the wait time if called again', async () => {
		const fn = jest.fn();
		const debounced = debounce(100, fn);

		debounced.call(null, null);
		await new Promise((res) => setTimeout(res, 50));
		debounced.call(null, null);
		await new Promise((res) => setTimeout(res, 50));
		expect(fn).not.toHaveBeenCalled();

		await new Promise((res) => setTimeout(res, 60));
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('calls function immediately if immediate=true', async () => {
		const fn = jest.fn();
		const debounced = debounce(100, fn, true);
		debounced.call(null, null);

		expect(fn).toHaveBeenCalledTimes(1);

		// Should not call again until the debounce window expires
		await new Promise((res) => setTimeout(res, 150));
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('does not call again if called multiple times immediately with immediate=true', async () => {
		const fn = jest.fn();
		const debounced = debounce(100, fn, true);
		debounced.call(null, null);
		debounced.call(null, null);
		debounced.call(null, null);

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
		const debounced = debounce(100, context.handler);

		debounced.call(context, context);
		await new Promise((res) => setTimeout(res, 120));

		expect(calledWithThis).toBe(42);
	});

	it('passes arguments correctly to the function', async () => {
		const fn = jest.fn();
		const debounced = debounce(100, fn);
		const testArg = { id: 1, name: 'test' };

		debounced.call(null, testArg);
		await new Promise((res) => setTimeout(res, 120));

		expect(fn).toHaveBeenCalledWith(testArg);
	});

	it('allows multiple debounce cycles with immediate=true', async () => {
		const fn = jest.fn();
		const debounced = debounce(100, fn, true);

		// First cycle
		debounced.call(null, null);
		expect(fn).toHaveBeenCalledTimes(1);

		// Wait for debounce window to expire
		await new Promise((res) => setTimeout(res, 120));

		// Second cycle - should call immediately again
		debounced.call(null, null);
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it('can debounce after the debounce window has completed', async () => {
		const fn = jest.fn();
		const debounced = debounce(100, fn);

		// First debounce
		debounced.call(null, null);
		await new Promise((res) => setTimeout(res, 120));
		expect(fn).toHaveBeenCalledTimes(1);

		// Second debounce
		debounced.call(null, null);
		await new Promise((res) => setTimeout(res, 120));
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it('handles zero wait time', async () => {
		const fn = jest.fn();
		const debounced = debounce(0, fn);
		debounced.call(null, null);

		// Even with 0ms wait, should be async
		expect(fn).not.toHaveBeenCalled();
		await new Promise((res) => setTimeout(res, 10));
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('cancels previous timeout when called multiple times', async () => {
		const fn = jest.fn();
		const debounced = debounce(200, fn);

		debounced.call(null, null);
		await new Promise((res) => setTimeout(res, 100));
		debounced.call(null, null);
		await new Promise((res) => setTimeout(res, 100));
		debounced.call(null, null);

		// Still should not have been called
		expect(fn).not.toHaveBeenCalled();

		await new Promise((res) => setTimeout(res, 220));
		// Called exactly once, not three times
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('immediate=false waits even after first call', async () => {
		const fn = jest.fn();
		const debounced = debounce(100, fn, false);

		debounced.call(null, null);
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

		const debounced = debounce(100, fn, true);
		const context = { id: 'ctx' };
		const argument = { id: 'arg' };

		debounced.call(context, argument);

		expect(capturedThis).toBe(context);
		expect(capturedArg).toBe(argument);
	});

	it('only calls function once per debounce cycle with immediate=true', async () => {
		const fn = jest.fn();
		const debounced = debounce(100, fn, true);

		debounced.call(null, null);
		debounced.call(null, null);
		debounced.call(null, null);

		expect(fn).toHaveBeenCalledTimes(1);

		await new Promise((res) => setTimeout(res, 120));
		// Should still be 1 - no deferred call with immediate=true
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('uses most recent call in large batch of calls', async () => {
		const fn = jest.fn();
		const debounced = debounce(50, fn);

		const args = [];
		for (let i = 0; i < 10; i++) {
			debounced.call(null, i);
			args.push(i);
		}

		expect(fn).not.toHaveBeenCalled();
		await new Promise((res) => setTimeout(res, 80));

		// Should only call once with the last argument
		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith(9);
	});
});
