import { describe, expect, it, jest, spyOn } from 'bun:test';
import { traceFunction } from '../../src/index.js';

describe('traceFunction', () => {
	it('should return the correct result for a synchronous function', () => {
		const traced = traceFunction((x: number) => x * 2);
		expect(traced(5)).toBe(10);
	});

	it('should return the correct result for an asynchronous function', async () => {
		const traced = traceFunction(async (x: number) => x * 2);
		expect(await traced(5)).toBe(10);
	});

	it('should record args and result for a synchronous call', () => {
		const traced = traceFunction((a: number, b: number) => a + b);

		traced(3, 4);

		expect(traced.calls).toHaveLength(1);
		expect(traced.calls[0]).toMatchObject({
			args: [3, 4],
			result: 7,
			threw: false,
			error: undefined,
			callIndex: 0,
		});
	});

	it('should record args and result for an asynchronous call', async () => {
		const traced = traceFunction(async (x: string) => x.toUpperCase());

		await traced('hello');

		expect(traced.calls).toHaveLength(1);
		expect(traced.calls[0]).toMatchObject({
			args: ['hello'],
			result: 'HELLO',
			threw: false,
			error: undefined,
			callIndex: 0,
		});
	});

	it('should record threw: true and re-throw for a synchronous error', () => {
		const error = new Error('sync boom');
		const traced = traceFunction(() => {
			throw error;
		});

		expect(() => traced()).toThrow('sync boom');
		expect(traced.calls).toHaveLength(1);
		expect(traced.calls[0]).toMatchObject({ threw: true, error, result: undefined });
	});

	it('should record threw: true and re-reject for an async rejection', async () => {
		const error = new Error('async boom');
		const traced = traceFunction(async () => {
			throw error;
		});

		await expect(traced()).rejects.toThrow('async boom');
		expect(traced.calls).toHaveLength(1);
		expect(traced.calls[0]).toMatchObject({ threw: true, error, result: undefined });
	});

	it('should accumulate calls across multiple invocations', () => {
		const traced = traceFunction((x: number) => x);

		traced(1);
		traced(2);
		traced(3);

		expect(traced.calls).toHaveLength(3);
		expect(traced.calls[0].result).toBe(1);
		expect(traced.calls[1].result).toBe(2);
		expect(traced.calls[2].result).toBe(3);
	});

	it('should assign callIndex in invocation order', async () => {
		const traced = traceFunction(async (x: number) => x);

		await Promise.all([traced(0), traced(1), traced(2)]);

		const byIndex = [...traced.calls].sort((a, b) => a.callIndex - b.callIndex);
		expect(byIndex[0].callIndex).toBe(0);
		expect(byIndex[1].callIndex).toBe(1);
		expect(byIndex[2].callIndex).toBe(2);
	});

	it('should record non-negative durationMs', () => {
		const traced = traceFunction(() => 42);
		traced();
		expect(traced.calls[0]!.durationMs).toBeGreaterThanOrEqual(0);
	});

	it('should record non-negative durationMs for async calls', async () => {
		const traced = traceFunction(async () => 42);
		await traced();
		expect(traced.calls[0]!.durationMs).toBeGreaterThanOrEqual(0);
	});

	it('should clear all recorded calls', () => {
		const traced = traceFunction((x: number) => x);

		traced(1);
		traced(2);
		traced.clear();

		expect(traced.calls).toHaveLength(0);
	});

	it('should keep callIndex monotonic across clears (callIndex is persistent)', () => {
		const traced = traceFunction((x: number) => x);

		traced(1);
		traced.clear();
		traced(2);

		// callIndex is based on a monotonic counter, not calls.length
		expect(traced.calls[0]!.callIndex).toBe(1);
	});

	it('should invoke onCall with the correct info for each invocation', () => {
		const onCall = jest.fn();
		const traced = traceFunction((x: number) => x * 3, { onCall });

		traced(4);

		expect(onCall).toHaveBeenCalledTimes(1);
		expect(onCall).toHaveBeenCalledWith(
			expect.objectContaining({ args: [4], result: 12, threw: false, callIndex: 0 }),
		);
	});

	it('should invoke onCall after async resolution', async () => {
		const onCall = jest.fn();
		const traced = traceFunction(async (x: number) => x * 3, { onCall });

		await traced(4);

		expect(onCall).toHaveBeenCalledTimes(1);
		expect(onCall).toHaveBeenCalledWith(expect.objectContaining({ result: 12, threw: false }));
	});

	it('should invoke onCall when the function throws', () => {
		const onCall = jest.fn();
		const error = new Error('oops');
		const traced = traceFunction(
			() => {
				throw error;
			},
			{ onCall },
		);

		expect(() => traced()).toThrow();
		expect(onCall).toHaveBeenCalledWith(expect.objectContaining({ threw: true, error }));
	});

	it('should log a summary when log: true (success, sync)', () => {
		const spy = spyOn(console, 'log').mockImplementation(() => {});

		const traced = traceFunction((x: number) => x, { label: 'myFn', log: true });
		traced(42);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith(expect.stringContaining('myFn #0'));
		expect(spy).toHaveBeenCalledWith(expect.stringContaining('took'));

		spy.mockRestore();
	});

	it('should log an error summary when log: true and the function throws', () => {
		const spy = spyOn(console, 'log').mockImplementation(() => {});

		const traced = traceFunction(
			() => {
				throw new Error('bad');
			},
			{ label: 'myFn', log: true },
		);

		expect(() => traced()).toThrow();
		expect(spy).toHaveBeenCalledWith(expect.stringContaining('threw after'));
		expect(spy).toHaveBeenCalledWith(expect.stringContaining('bad'));

		spy.mockRestore();
	});

	it('should not log by default', () => {
		const spy = spyOn(console, 'log').mockImplementation(() => {});

		const traced = traceFunction((x: number) => x);
		traced(1);

		expect(spy).not.toHaveBeenCalled();

		spy.mockRestore();
	});

	it('should use "traceFunction" as the fallback prefix when no label is given', () => {
		const spy = spyOn(console, 'log').mockImplementation(() => {});

		const traced = traceFunction((x: number) => x, { log: true });
		traced(1);

		expect(spy).toHaveBeenCalledWith(expect.stringContaining('traceFunction #0'));

		spy.mockRestore();
	});

	it('should invoke both log and onCall when both are provided', () => {
		const spy = spyOn(console, 'log').mockImplementation(() => {});
		const onCall = jest.fn();

		const traced = traceFunction((x: number) => x, { log: true, onCall });
		traced(5);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(onCall).toHaveBeenCalledTimes(1);

		spy.mockRestore();
	});

	it('should pass through the return value unchanged for complex objects', () => {
		const obj = { a: 1, b: [2, 3] };
		const traced = traceFunction(() => obj);
		expect(traced()).toBe(obj);
	});

	it('should record undefined return value correctly', () => {
		const traced = traceFunction(() => undefined);
		traced();
		expect(traced.calls[0]).toMatchObject({ result: undefined, threw: false });
	});

	it('should record null return value correctly', () => {
		const traced = traceFunction(() => null);
		traced();
		expect(traced.calls[0]).toMatchObject({ result: null, threw: false });
	});

	it('should record durationMs even when the function throws', () => {
		const traced = traceFunction(() => {
			throw new Error('err');
		});
		expect(() => traced()).toThrow();
		expect(traced.calls[0]!.durationMs).toBeGreaterThanOrEqual(0);
	});

	it('should record durationMs even when an async function rejects', async () => {
		const traced = traceFunction(async () => {
			throw new Error('err');
		});
		await expect(traced()).rejects.toThrow();
		expect(traced.calls[0]!.durationMs).toBeGreaterThanOrEqual(0);
	});

	it('should record a non-Error thrown value', () => {
		const traced = traceFunction(() => {
			// eslint-disable-next-line @typescript-eslint/only-throw-error
			throw 'string error';
		});
		expect(() => traced()).toThrow();
		expect(traced.calls[0]).toMatchObject({ threw: true, error: 'string error' });
	});

	it('should record a non-Error async rejection value', async () => {
		const traced = traceFunction(async () => {
			// eslint-disable-next-line @typescript-eslint/only-throw-error
			throw { code: 42 };
		});
		await expect(traced()).rejects.toEqual({ code: 42 });
		expect(traced.calls[0]).toMatchObject({ threw: true, error: { code: 42 } });
	});

	it('should not propagate errors thrown by onCall to the caller', () => {
		const traced = traceFunction((x: number) => x, {
			onCall: () => {
				throw new Error('onCall exploded');
			},
		});
		expect(() => traced(1)).not.toThrow();
		expect(traced.calls).toHaveLength(1);
	});

	it('should still record the call and log when onCall throws', () => {
		const spy = spyOn(console, 'log').mockImplementation(() => {});
		const traced = traceFunction((x: number) => x, {
			log: true,
			onCall: () => {
				throw new Error('onCall exploded');
			},
		});

		traced(99);

		expect(traced.calls).toHaveLength(1);
		expect(spy).toHaveBeenCalledTimes(1);

		spy.mockRestore();
	});

	it('should still record in-flight async calls that settle after clear()', async () => {
		const traced = traceFunction(
			(ms: number) =>
				new Promise<number>((resolve) =>
					setTimeout(() => {
						resolve(ms);
					}, ms),
				),
		);

		const promise = traced(50);
		traced.clear();
		expect(traced.calls).toHaveLength(0);

		await promise;

		// the settled call is still recorded even though clear() was called
		expect(traced.calls).toHaveLength(1);
		expect(traced.calls[0]!.result).toBe(50);
	});

	it('should handle multiple consecutive clear() calls without error', () => {
		const traced = traceFunction((x: number) => x);
		traced(1);
		traced.clear();
		traced.clear();
		expect(traced.calls).toHaveLength(0);
	});
});
