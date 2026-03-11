/**
 * A single recorded segment produced by {@link PerfTimer.lap}.
 *
 * @category Development
 */
export type PerfTimerLap = {
	/** Label passed to {@link PerfTimer.lap}. */
	label: string;
	/** Duration of this segment in milliseconds (time since the previous lap or start). */
	durationMs: number;
	/** Elapsed time in milliseconds from the timer's start to the end of this lap. */
	elapsedMs: number;
};

/**
 * Result returned by {@link PerfTimer.stop}.
 *
 * @category Development
 */
export type PerfTimerResult = {
	/** All recorded laps in the order they were captured. */
	laps: PerfTimerLap[];
	/** Total elapsed time in milliseconds from start to {@link PerfTimer.stop}. */
	totalMs: number;
};

/**
 * A running performance timer created by {@link createPerfTimer}.
 *
 * @category Development
 */
export type PerfTimer = {
	/**
	 * Records a lap, measuring the time since the previous lap (or the timer's start).
	 *
	 * @param label - A descriptive name for this segment (e.g. `'db query'`, `'render'`).
	 * @returns The {@link PerfTimerLap} that was just recorded.
	 */
	lap(label: string): PerfTimerLap;

	/**
	 * Stops the timer and returns all recorded laps along with the total elapsed time.
	 * After calling `stop()`, further calls to {@link PerfTimer.lap} continue from the
	 * last lap mark, not the stop point.
	 *
	 * @returns A {@link PerfTimerResult} containing all laps and the total duration.
	 */
	stop(): PerfTimerResult;
};

/**
 * Options accepted by {@link createPerfTimer}.
 *
 * @category Development
 */
export type CreatePerfTimerOptions = {
	/**
	 * A label prepended to every console message when `log` is `true`.
	 * Defaults to `'createPerfTimer'`.
	 */
	label?: string;

	/**
	 * When `true`, each {@link PerfTimer.lap} and {@link PerfTimer.stop} call prints a
	 * formatted line to `console.log`. Defaults to `false`.
	 */
	log?: boolean;

	/**
	 * Called after each {@link PerfTimer.lap} with the {@link PerfTimerLap} that was just
	 * recorded. Errors thrown by this callback are silently swallowed so they never
	 * propagate to the caller.
	 */
	onLap?: (lap: PerfTimerLap) => void;

	/**
	 * Called each time {@link PerfTimer.stop} is invoked with the {@link PerfTimerResult}
	 * snapshot. Errors thrown by this callback are silently swallowed so they never
	 * propagate to the caller.
	 */
	onStop?: (result: PerfTimerResult) => void;
};

/**
 * Creates a performance timer for measuring labelled segments of code.
 *
 * Call `lap(label)` after each step to record its duration relative to the previous lap
 * (or the start). Call `stop()` to finalise and retrieve all laps with their durations.
 *
 * Useful for profiling multi-step pipelines where `benchmark` is too coarse — it gives
 * you per-segment timings without requiring separate `performance.now()` calls everywhere.
 *
 * @category Development
 * @param options - Optional {@link CreatePerfTimerOptions} to configure logging and callbacks.
 * @returns A {@link PerfTimer} with `lap()` and `stop()` methods.
 *
 * @example
 * const timer = createPerfTimer();
 *
 * await fetchData();
 * timer.lap('fetch');
 *
 * await processData();
 * timer.lap('process');
 *
 * const { laps, totalMs } = timer.stop();
 * // laps: [{ label: 'fetch', durationMs: 42.1, elapsedMs: 42.1 },
 * //         { label: 'process', durationMs: 18.3, elapsedMs: 60.4 }]
 * // totalMs: 60.4
 *
 * @example
 * // Log each lap and get a stop callback
 * const timer = createPerfTimer({
 *   label: 'pipeline',
 *   log: true,
 *   onLap: (lap) => metrics.record(lap.label, lap.durationMs),
 *   onStop: (result) => metrics.record('total', result.totalMs),
 * });
 *
 * await fetchData();
 * timer.lap('fetch');   // logs: pipeline | fetch | 42.10ms (elapsed: 42.10ms)
 *
 * await processData();
 * timer.lap('process'); // logs: pipeline | process | 18.30ms (elapsed: 60.40ms)
 *
 * timer.stop();         // logs: pipeline | stop | total: 60.41ms | 2 laps
 */
export function createPerfTimer(options: CreatePerfTimerOptions = {}): PerfTimer {
	const { label, log = false, onLap, onStop } = options;
	const prefix = label ?? 'createPerfTimer';
	const start = performance.now();
	const laps: PerfTimerLap[] = [];
	let lastMark = start;

	return {
		lap(lapLabel: string): PerfTimerLap {
			const now = performance.now();
			const durationMs = now - lastMark;
			const elapsedMs = now - start;
			lastMark = now;
			const entry: PerfTimerLap = { label: lapLabel, durationMs, elapsedMs };
			laps.push(entry);

			if (onLap) {
				try {
					onLap(entry);
				} catch {}
			}

			if (log) {
				console.log(
					`${prefix} | ${lapLabel} | ${durationMs.toFixed(2)}ms (elapsed: ${elapsedMs.toFixed(2)}ms)`,
				);
			}

			return entry;
		},

		stop(): PerfTimerResult {
			const totalMs = performance.now() - start;
			const result: PerfTimerResult = { laps: [...laps], totalMs };

			if (onStop) {
				try {
					onStop(result);
				} catch {}
			}

			if (log) {
				console.log(`${prefix} | stop | total: ${totalMs.toFixed(2)}ms | ${laps.length} laps`);
			}

			return result;
		},
	};
}
