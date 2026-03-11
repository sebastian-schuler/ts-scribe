import { describe, expect, it, jest, spyOn } from 'bun:test';
import { benchmark } from '../../src/index.js';

describe('benchmark', () => {
	it('should handle synchronous functions and return the correct result', () => {
		const result = benchmark(() => 42);
		expect(result).toBe(42);
	});

	it('should handle asynchronous functions and return the correct result', async () => {
		const result = await benchmark(async () => new Promise<number>((resolve) => setTimeout(() => resolve(42), 50)));
		expect(result).toBe(42);
	});

	it('should log a single-iteration summary when log: true (sync)', () => {
		const spyConsoleLog = spyOn(console, 'log').mockImplementation(() => {});

		benchmark(() => 42, { label: 'TestSync', log: true });

		expect(spyConsoleLog).toHaveBeenCalledTimes(1);
		expect(spyConsoleLog).toHaveBeenCalledWith(expect.stringContaining('TestSync | took'));
		expect(spyConsoleLog).toHaveBeenCalledWith(expect.stringContaining('bytes'));

		spyConsoleLog.mockRestore();
	});

	it('should log a single-iteration summary when log: true (async)', async () => {
		const spyConsoleLog = spyOn(console, 'log').mockImplementation(() => {});

		await benchmark(async () => 42, { label: 'TestAsync', log: true });

		expect(spyConsoleLog).toHaveBeenCalledTimes(1);
		expect(spyConsoleLog).toHaveBeenCalledWith(expect.stringContaining('TestAsync | took'));
		expect(spyConsoleLog).toHaveBeenCalledWith(expect.stringContaining('bytes'));

		spyConsoleLog.mockRestore();
	});

	it('should not log by default when no log option or callback is provided', () => {
		const spyConsoleLog = spyOn(console, 'log').mockImplementation(() => {});

		benchmark(() => 42, { label: 'ShouldNotLog' });

		expect(spyConsoleLog).not.toHaveBeenCalled();

		spyConsoleLog.mockRestore();
	});

	it('should call onBenchmarkComplete with correct parameters for synchronous functions', () => {
		const onBenchmarkComplete = jest.fn();

		const result = benchmark(() => 42, { onBenchmarkComplete, label: 'TestSyncCallback' });

		expect(result).toBe(42);
		expect(onBenchmarkComplete).toHaveBeenCalledWith(
			expect.objectContaining({
				durationMs: expect.any(Number),
				minMs: expect.any(Number),
				maxMs: expect.any(Number),
				resultByteSize: expect.any(Number),
				label: 'TestSyncCallback',
				result: 42,
				iterations: 1,
			}),
		);
	});

	it('should call onBenchmarkComplete with correct parameters for asynchronous functions', async () => {
		const onBenchmarkComplete = jest.fn();

		const result = await benchmark(
			async () => new Promise<number>((resolve) => setTimeout(() => resolve(42), 50)),
			{ onBenchmarkComplete, label: 'TestAsyncCallback' },
		);

		expect(result).toBe(42);
		expect(onBenchmarkComplete).toHaveBeenCalledWith(
			expect.objectContaining({
				durationMs: expect.any(Number),
				minMs: expect.any(Number),
				maxMs: expect.any(Number),
				resultByteSize: expect.any(Number),
				label: 'TestAsyncCallback',
				result: 42,
				iterations: 1,
			}),
		);
	});

	it('should run the function the specified number of iterations (sync)', () => {
		let callCount = 0;
		const onBenchmarkComplete = jest.fn();

		benchmark(() => ++callCount, { iterations: 5, onBenchmarkComplete });

		expect(callCount).toBe(5);
		expect(onBenchmarkComplete).toHaveBeenCalledWith(
			expect.objectContaining({
				iterations: 5,
				durationMs: expect.any(Number),
				minMs: expect.any(Number),
				maxMs: expect.any(Number),
			}),
		);
	});

	it('should run the function the specified number of iterations (async)', async () => {
		let callCount = 0;
		const onBenchmarkComplete = jest.fn();

		await benchmark(async () => ++callCount, { iterations: 3, onBenchmarkComplete });

		expect(callCount).toBe(3);
		expect(onBenchmarkComplete).toHaveBeenCalledWith(
			expect.objectContaining({ iterations: 3 }),
		);
	});

	it('should log multi-iteration summary format when iterations > 1', () => {
		const spyConsoleLog = spyOn(console, 'log').mockImplementation(() => {});

		benchmark(() => 42, { label: 'Multi', iterations: 5, log: true });

		expect(spyConsoleLog).toHaveBeenCalledTimes(1);
		expect(spyConsoleLog).toHaveBeenCalledWith(expect.stringContaining('5 iterations'));
		expect(spyConsoleLog).toHaveBeenCalledWith(expect.stringContaining('mean'));
		expect(spyConsoleLog).toHaveBeenCalledWith(expect.stringContaining('min'));
		expect(spyConsoleLog).toHaveBeenCalledWith(expect.stringContaining('max'));

		spyConsoleLog.mockRestore();
	});

	it('should use "benchmark" as fallback prefix when label is not provided', () => {
		const spyConsoleLog = spyOn(console, 'log').mockImplementation(() => {});

		benchmark(() => 42, { log: true });

		expect(spyConsoleLog).toHaveBeenCalledWith(expect.stringContaining('benchmark | took'));

		spyConsoleLog.mockRestore();
	});

	it('should clamp iterations to a minimum of 1', () => {
		const onBenchmarkComplete = jest.fn();

		benchmark(() => 42, { iterations: 0, onBenchmarkComplete });

		expect(onBenchmarkComplete).toHaveBeenCalledWith(expect.objectContaining({ iterations: 1 }));
	});

	it('should correctly calculate resultByteSize for different data types', () => {
		const onBenchmarkComplete = jest.fn();

		benchmark(() => ({ key: 'value' }), { onBenchmarkComplete });

		expect(onBenchmarkComplete).toHaveBeenCalledWith(
			expect.objectContaining({ resultByteSize: expect.any(Number) }),
		);
	});

	it('should correctly calculate resultByteSize for large return data', () => {
		const onBenchmarkComplete = jest.fn();

		benchmark(() => ({ largeData: 'a'.repeat(1_000_000) }), { onBenchmarkComplete });

		const [call] = onBenchmarkComplete.mock.calls;
		expect(call[0].resultByteSize).toBeGreaterThan(1_000_000);
	});

	it('should return the result of the final iteration when using multiple iterations', () => {
		let counter = 0;
		const result = benchmark(() => ++counter, { iterations: 3 });
		expect(result).toBe(3);
	});

	it('should propagate errors thrown by synchronous functions', () => {
		const error = new Error('sync failure');
		expect(() => benchmark(() => { throw error; })).toThrow('sync failure');
	});

	it('should propagate rejections from asynchronous functions', async () => {
		const error = new Error('async failure');
		await expect(benchmark(async () => { throw error; })).rejects.toThrow('async failure');
	});

	it('should satisfy minMs <= durationMs <= maxMs across multiple iterations', () => {
		const onBenchmarkComplete = jest.fn();

		benchmark(() => 42, { iterations: 10, onBenchmarkComplete });

		const [call] = onBenchmarkComplete.mock.calls;
		const { minMs, durationMs, maxMs } = call[0] as { minMs: number; durationMs: number; maxMs: number };
		expect(minMs).toBeGreaterThanOrEqual(0);
		expect(durationMs).toBeGreaterThanOrEqual(minMs);
		expect(maxMs).toBeGreaterThanOrEqual(durationMs);
	});

	it('should call onBenchmarkComplete exactly once regardless of iteration count', () => {
		const onBenchmarkComplete = jest.fn();

		benchmark(() => 42, { iterations: 20, onBenchmarkComplete });

		expect(onBenchmarkComplete).toHaveBeenCalledTimes(1);
	});

	it('should call onBenchmarkComplete exactly once for async regardless of iteration count', async () => {
		const onBenchmarkComplete = jest.fn();

		await benchmark(async () => 42, { iterations: 5, onBenchmarkComplete });

		expect(onBenchmarkComplete).toHaveBeenCalledTimes(1);
	});

	it('should invoke both log and onBenchmarkComplete when both are provided', () => {
		const spyConsoleLog = spyOn(console, 'log').mockImplementation(() => {});
		const onBenchmarkComplete = jest.fn();

		benchmark(() => 42, { log: true, onBenchmarkComplete });

		expect(spyConsoleLog).toHaveBeenCalledTimes(1);
		expect(onBenchmarkComplete).toHaveBeenCalledTimes(1);

		spyConsoleLog.mockRestore();
	});

	it('should clamp negative iterations to a minimum of 1', () => {
		const onBenchmarkComplete = jest.fn();

		benchmark(() => 42, { iterations: -5, onBenchmarkComplete });

		expect(onBenchmarkComplete).toHaveBeenCalledWith(expect.objectContaining({ iterations: 1 }));
	});

	it('should log multi-iteration summary format when iterations > 1 (async)', async () => {
		const spyConsoleLog = spyOn(console, 'log').mockImplementation(() => {});

		await benchmark(async () => 42, { label: 'AsyncMulti', iterations: 3, log: true });

		expect(spyConsoleLog).toHaveBeenCalledTimes(1);
		expect(spyConsoleLog).toHaveBeenCalledWith(expect.stringContaining('3 iterations'));
		expect(spyConsoleLog).toHaveBeenCalledWith(expect.stringContaining('mean'));

		spyConsoleLog.mockRestore();
	});

	it('should report non-negative durationMs for synchronous functions', () => {
		const onBenchmarkComplete = jest.fn();

		benchmark(() => 42, { onBenchmarkComplete });

		const [call] = onBenchmarkComplete.mock.calls;
		expect(call[0].durationMs).toBeGreaterThanOrEqual(0);
	});

	it('should report non-negative durationMs for asynchronous functions', async () => {
		const onBenchmarkComplete = jest.fn();

		await benchmark(async () => 42, { onBenchmarkComplete });

		const [call] = onBenchmarkComplete.mock.calls;
		expect(call[0].durationMs).toBeGreaterThanOrEqual(0);
	});
});
