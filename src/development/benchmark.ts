/* eslint-disable n/prefer-global/buffer */

import { safeJsonStringify } from '../core/safe-json-stringify.js';

/**
 * Information provided to {@link BenchmarkOptions.onBenchmarkComplete} when a benchmark finishes.
 *
 * @category Development
 */
export type BenchmarkInfo<T> = {
	/** Mean execution duration in milliseconds across all iterations. */
	durationMs: number;
	/** Minimum execution duration in milliseconds across all iterations. */
	minMs: number;
	/** Maximum execution duration in milliseconds across all iterations. */
	maxMs: number;
	/** Byte size of the JSON-serialized result from the final iteration. */
	resultByteSize: number;
	/** The label of the benchmark, if provided. */
	label?: string;
	/** The result returned by the final iteration of the benchmarked function. */
	result: T;
	/** The number of iterations that were run. */
	iterations: number;
};

/**
 * Options for the {@link benchmark} function.
 *
 * @category Development
 */
export type BenchmarkOptions<T> = {
	/**
	 * Optional label for the benchmark. Used in logged output and callback info.
	 *
	 * @example "My Benchmark"
	 */
	label?: string;

	/**
	 * Number of times to run the benchmarked function. Durations are averaged
	 * across all iterations, reducing noise from JIT warm-up and GC pauses.
	 *
	 * @default 1
	 */
	iterations?: number;

	/**
	 * When `true`, logs a summary to the console after the benchmark completes.
	 *
	 * @default false
	 */
	log?: boolean;

	/**
	 * Callback invoked when the benchmark is complete.
	 *
	 * @param info - An object containing details about the benchmark result.
	 */
	onBenchmarkComplete?: (info: BenchmarkInfo<T>) => void;
};

function buildInfo<T>(durations: number[], result: T, label: string | undefined): BenchmarkInfo<T> {
	const minMs = Math.min(...durations);
	const maxMs = Math.max(...durations);
	let sum = 0;
	for (const d of durations) sum += d;
	const durationMs = sum / durations.length;
	const resultByteSize = Buffer.byteLength(safeJsonStringify(result), 'utf8');
	return { durationMs, minMs, maxMs, resultByteSize, label, result, iterations: durations.length };
}

function logInfo<T>(info: BenchmarkInfo<T>): void {
	const prefix = info.label ?? 'benchmark';
	if (info.iterations > 1) {
		console.log(
			`${prefix} | ${info.iterations} iterations | mean ${info.durationMs.toFixed(2)}ms | min ${info.minMs.toFixed(2)}ms | max ${info.maxMs.toFixed(2)}ms | ${info.resultByteSize} bytes`,
		);
	} else {
		console.log(`${prefix} | took ${info.durationMs.toFixed(2)}ms | ${info.resultByteSize} bytes`);
	}
}

/**
 * Benchmarks an async function, measuring execution time and the byte size of its result.
 *
 * Use `iterations` to average results across multiple runs, reducing noise from JIT warm-up
 * and GC pauses. Set `log: true` for a console summary or supply {@link BenchmarkOptions.onBenchmarkComplete}
 * for programmatic access to the {@link BenchmarkInfo}.
 *
 * @category Development
 * @param fn - The async function to benchmark.
 * @param options - Configuration options for the benchmark.
 * @returns A Promise resolving to the result of the final iteration.
 * @throws Propagates any rejection thrown by `fn`.
 *
 * @example
 * const data = await benchmark(async () => fetchData(), {
 *   label: 'fetchData',
 *   iterations: 10,
 *   log: true,
 * });
 */
export function benchmark<T>(fn: () => Promise<T>, options?: BenchmarkOptions<T>): Promise<T>;
/**
 * Benchmarks a synchronous function, measuring execution time and the byte size of its result.
 *
 * Use `iterations` to average results across multiple runs, reducing noise from JIT warm-up
 * and GC pauses. Set `log: true` for a console summary or supply {@link BenchmarkOptions.onBenchmarkComplete}
 * for programmatic access to the {@link BenchmarkInfo}.
 *
 * @category Development
 * @param fn - The synchronous function to benchmark.
 * @param options - Configuration options for the benchmark.
 * @returns The result of the final iteration.
 * @throws Propagates any error thrown by `fn`.
 *
 * @example
 * const result = benchmark(() => processData(input), {
 *   label: 'processData',
 *   iterations: 1000,
 *   log: true,
 * });
 */
export function benchmark<T>(fn: () => T, options?: BenchmarkOptions<T>): T;
export function benchmark<T>(fn: () => T | Promise<T>, options: BenchmarkOptions<T> = {}): Promise<T> | T {
	const { onBenchmarkComplete, label, log = false, iterations = 1 } = options;
	const count = Math.max(1, iterations);

	function finish(durations: number[], result: T): void {
		const info = buildInfo(durations, result, label);
		if (onBenchmarkComplete) {
			onBenchmarkComplete(info);
		}

		if (log) {
			logInfo(info);
		}
	}

	const firstStart = performance.now();
	const firstCall = fn();

	if (firstCall instanceof Promise) {
		return (async (): Promise<T> => {
			const durations: number[] = [];
			let lastResult = await firstCall;
			durations.push(performance.now() - firstStart);

			for (let i = 1; i < count; i++) {
				const start = performance.now();
				// eslint-disable-next-line no-await-in-loop
				lastResult = await (fn() as Promise<T>);
				durations.push(performance.now() - start);
			}

			finish(durations, lastResult);
			return lastResult;
		})();
	}

	const durations: number[] = [performance.now() - firstStart];
	let lastResult = firstCall;

	for (let i = 1; i < count; i++) {
		const start = performance.now();
		lastResult = fn() as T;
		durations.push(performance.now() - start);
	}

	finish(durations, lastResult);
	return lastResult;
}
