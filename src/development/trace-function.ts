import { safeJsonStringify } from '../core/safe-json-stringify.js';

/**
 * Information recorded for a single invocation of a traced function.
 * Passed to {@link TraceOptions.onCall} after each call settles.
 *
 * @category Development
 */
export type TraceCallInfo<Args extends unknown[], Return> = {
	/** Arguments passed to this invocation. */
	args: Args;
	/**
	 * Value returned (or resolved) by this invocation.
	 * `undefined` when {@link TraceCallInfo.threw} is `true`.
	 */
	result: Awaited<Return> | undefined;
	/** Error thrown or rejection reason. `undefined` when {@link TraceCallInfo.threw} is `false`. */
	error: unknown;
	/** `true` if this invocation threw synchronously or the returned Promise rejected. */
	threw: boolean;
	/**
	 * Wall time in milliseconds from invocation to settlement.
	 * For async functions this covers the full await time.
	 */
	durationMs: number;
	/**
	 * Zero-based index reflecting *invocation* order, not settlement order.
	 * For concurrent async calls, entries in {@link TracedFunction.calls} may be appended
	 * in settlement order — use `callIndex` to restore invocation order.
	 * Not reset when {@link TracedFunction.clear} is called.
	 */
	callIndex: number;
};

/**
 * Options for the {@link traceFunction} wrapper.
 *
 * @category Development
 */
export type TraceOptions<Args extends unknown[], Return> = {
	/**
	 * Optional label prepended to each log line.
	 *
	 * @example "fetchUser"
	 */
	label?: string;

	/**
	 * When `true`, logs a one-line summary to the console after each call settles.
	 *
	 * @default false
	 */
	log?: boolean;

	/**
	 * Callback invoked after each call settles (including async resolution and rejection).
	 * Receives the full {@link TraceCallInfo} for that invocation.
	 * Errors thrown by this callback are silently swallowed and do not affect the caller.
	 *
	 * @param info - Details about the completed invocation.
	 */
	onCall?: (info: TraceCallInfo<Args, Return>) => void;
};

/**
 * A wrapped function that behaves identically to the original but records every invocation.
 * Created by {@link traceFunction}.
 *
 * @category Development
 */
export type TracedFunction<Args extends unknown[], Return> = {
	/** Invoke the original function and record the call. */
	(...args: Args): Return;

	/**
	 * All recorded call entries, appended in settlement order after each call completes.
	 * For concurrent async calls use {@link TraceCallInfo.callIndex} to recover invocation order.
	 *
	 * **Note:** async calls still in-flight when {@link TracedFunction.clear} is called will
	 * still append their entry here once they settle.
	 */
	readonly calls: Array<TraceCallInfo<Args, Return>>;

	/**
	 * Clears all entries from {@link TracedFunction.calls}.
	 * Async calls already in-flight will still append their entry once they settle.
	 * {@link TraceCallInfo.callIndex} is **not** reset.
	 */
	clear(): void;
};

function formatLog<Args extends unknown[], Return>(info: TraceCallInfo<Args, Return>, label = 'traceFunction'): string {
	const args = safeJsonStringify(info.args);
	if (info.threw) {
		const message = info.error instanceof Error ? info.error.message : safeJsonStringify(info.error);
		return `${label} #${info.callIndex} | threw after ${info.durationMs.toFixed(2)}ms | args: ${args} | error: ${message}`;
	}

	return `${label} #${info.callIndex} | took ${info.durationMs.toFixed(2)}ms | args: ${args} | result: ${safeJsonStringify(info.result)}`;
}

/**
 * Wraps a function to record every invocation — arguments, return value (or error), and duration.
 *
 * Works with both synchronous and asynchronous functions. For async functions the
 * {@link TraceCallInfo} entry is appended after the Promise settles, and the wrapper
 * transparently propagates the resolved value or rejection. Logging is opt-in via `log: true`.
 * Errors from {@link TraceOptions.onCall} are silently isolated and never reach the caller.
 *
 * @category Development
 * @param fn - The function to trace. Can be synchronous or asynchronous.
 * @param options - Configuration options for the tracer.
 * @returns A {@link TracedFunction} with the same signature as `fn`, plus a `calls` array and `clear()`.
 * @throws Propagates any error or rejection thrown by `fn`.
 *
 * @example
 * const traced = traceFunction(fetchUser, { label: 'fetchUser', log: true });
 *
 * await traced('user-1');
 * await traced('user-2');
 *
 * console.log(traced.calls.length);        // 2
 * console.log(traced.calls[0].durationMs); // e.g. 42.3
 * console.log(traced.calls[0].result);     // resolved value
 *
 * traced.clear(); // reset call history
 *
 * @example
 * // Flag slow calls via onCall
 * const traced = traceFunction(computeHash, {
 *   onCall: (info) => {
 *     if (info.durationMs > 100) console.warn('slow call', info.args);
 *   },
 * });
 */
export function traceFunction<Args extends unknown[], Return>(
	fn: (...args: Args) => Return,
	options: TraceOptions<Args, Return> = {},
): TracedFunction<Args, Return> {
	const { label, log = false, onCall } = options;
	const calls: Array<TraceCallInfo<Args, Return>> = [];
	let callCount = 0;

	function record(info: TraceCallInfo<Args, Return>): void {
		calls.push(info);
		if (onCall) {
			try {
				onCall(info);
			} catch {
				// Errors from onCall must not propagate to the caller of the traced function
			}
		}

		if (log) {
			console.log(formatLog(info, label));
		}
	}

	const traced = function (...args: Args): Return {
		const callIndex = callCount++;
		const start = performance.now();
		let rawResult: Return;

		try {
			rawResult = fn(...args);
		} catch (error) {
			const durationMs = performance.now() - start;
			record({ args, result: undefined, error, threw: true, durationMs, callIndex });
			throw error;
		}

		if (rawResult instanceof Promise) {
			return (async (): Promise<Awaited<Return>> => {
				try {
					const resolved = await rawResult;
					const durationMs = performance.now() - start;
					record({
						args,
						result: resolved as Awaited<Return>,
						error: undefined,
						threw: false,
						durationMs,
						callIndex,
					});
					return resolved as Awaited<Return>;
				} catch (error) {
					const durationMs = performance.now() - start;
					record({ args, result: undefined, error, threw: true, durationMs, callIndex });
					throw error;
				}
			})() as Return;
		}

		const durationMs = performance.now() - start;
		record({ args, result: rawResult as Awaited<Return>, error: undefined, threw: false, durationMs, callIndex });
		return rawResult;
	} as TracedFunction<Args, Return>;

	Object.assign(traced, {
		calls,
		clear() {
			calls.length = 0;
		},
	});

	return traced;
}
