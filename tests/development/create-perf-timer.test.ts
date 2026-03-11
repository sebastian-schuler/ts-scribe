import { describe, expect, it, jest, spyOn } from 'bun:test';
import { createPerfTimer } from '../../src/index.js';

describe('createPerfTimer', () => {
	// ─── Core behaviour ───────────────────────────────────────────────────────

	it('should return an object with lap and stop methods', () => {
		const timer = createPerfTimer();
		expect(typeof timer.lap).toBe('function');
		expect(typeof timer.stop).toBe('function');
	});

	it('should record a lap with the correct label', () => {
		const timer = createPerfTimer();
		const lap = timer.lap('step1');
		expect(lap.label).toBe('step1');
	});

	it('should record non-negative durationMs for a lap', () => {
		const timer = createPerfTimer();
		const lap = timer.lap('step1');
		expect(lap.durationMs).toBeGreaterThanOrEqual(0);
	});

	it('should record non-negative elapsedMs for a lap', () => {
		const timer = createPerfTimer();
		const lap = timer.lap('step1');
		expect(lap.elapsedMs).toBeGreaterThanOrEqual(0);
	});

	it('should accumulate laps in order', () => {
		const timer = createPerfTimer();
		timer.lap('a');
		timer.lap('b');
		timer.lap('c');
		const { laps } = timer.stop();
		expect(laps).toHaveLength(3);
		expect(laps[0]!.label).toBe('a');
		expect(laps[1]!.label).toBe('b');
		expect(laps[2]!.label).toBe('c');
	});

	it('should return the lap entry from lap()', () => {
		const timer = createPerfTimer();
		const lap = timer.lap('x');
		const { laps } = timer.stop();
		expect(lap).toEqual(laps[0]);
	});

	it('elapsedMs should be >= durationMs for all laps after the first', () => {
		const timer = createPerfTimer();
		timer.lap('first');
		timer.lap('second');
		const { laps } = timer.stop();
		expect(laps[1]!.elapsedMs).toBeGreaterThanOrEqual(laps[1]!.durationMs);
	});

	it('elapsedMs should be monotonically increasing across laps', () => {
		const timer = createPerfTimer();
		timer.lap('a');
		timer.lap('b');
		timer.lap('c');
		const { laps } = timer.stop();
		expect(laps[1]!.elapsedMs).toBeGreaterThanOrEqual(laps[0]!.elapsedMs);
		expect(laps[2]!.elapsedMs).toBeGreaterThanOrEqual(laps[1]!.elapsedMs);
	});

	it('durationMs of each lap should not exceed elapsedMs', () => {
		const timer = createPerfTimer();
		timer.lap('a');
		timer.lap('b');
		const { laps } = timer.stop();
		for (const lap of laps) {
			expect(lap.durationMs).toBeLessThanOrEqual(lap.elapsedMs + 1); // +1 for float precision
		}
	});

	it('should return non-negative totalMs from stop()', () => {
		const timer = createPerfTimer();
		timer.lap('step');
		const { totalMs } = timer.stop();
		expect(totalMs).toBeGreaterThanOrEqual(0);
	});

	it('totalMs should be >= last lap elapsedMs', () => {
		const timer = createPerfTimer();
		timer.lap('a');
		timer.lap('b');
		const { laps, totalMs } = timer.stop();
		expect(totalMs).toBeGreaterThanOrEqual(laps.at(-1)!.elapsedMs);
	});

	it('laps in result should be a snapshot copy, not mutated by later laps', () => {
		const timer = createPerfTimer();
		timer.lap('a');
		const { laps: snapshot } = timer.stop();
		timer.lap('b');
		expect(snapshot).toHaveLength(1);
	});

	it('should work with zero laps — stop() returns empty laps and non-negative totalMs', () => {
		const timer = createPerfTimer();
		const { laps, totalMs } = timer.stop();
		expect(laps).toHaveLength(0);
		expect(totalMs).toBeGreaterThanOrEqual(0);
	});

	it('should allow stop() to be called multiple times', () => {
		const timer = createPerfTimer();
		timer.lap('a');
		const first = timer.stop();
		const second = timer.stop();
		expect(first.laps).toHaveLength(1);
		expect(second.laps).toHaveLength(1);
		expect(second.totalMs).toBeGreaterThanOrEqual(first.totalMs);
	});

	it('should allow lap() to be called after stop()', () => {
		const timer = createPerfTimer();
		timer.lap('a');
		timer.stop();
		const lap = timer.lap('b');
		expect(lap.label).toBe('b');
		expect(lap.durationMs).toBeGreaterThanOrEqual(0);
	});

	it('should handle a very large number of laps without error', () => {
		const timer = createPerfTimer();
		for (let i = 0; i < 1000; i++) timer.lap(`step-${i}`);
		const { laps } = timer.stop();
		expect(laps).toHaveLength(1000);
	});

	// ─── log option ───────────────────────────────────────────────────────────

	it('should not log anything by default', () => {
		const spy = spyOn(console, 'log').mockImplementation(() => {});
		const timer = createPerfTimer();
		timer.lap('a');
		timer.stop();
		expect(spy).not.toHaveBeenCalled();
		spy.mockRestore();
	});

	it('log:true should log once per lap', () => {
		const spy = spyOn(console, 'log').mockImplementation(() => {});
		const timer = createPerfTimer({ log: true });
		timer.lap('fetch');
		timer.lap('process');
		expect(spy).toHaveBeenCalledTimes(2);
		spy.mockRestore();
	});

	it('log:true should log once on stop', () => {
		const spy = spyOn(console, 'log').mockImplementation(() => {});
		const timer = createPerfTimer({ log: true });
		timer.stop();
		expect(spy).toHaveBeenCalledTimes(1);
		spy.mockRestore();
	});

	it('log:true should include the lap label in the lap log message', () => {
		const spy = spyOn(console, 'log').mockImplementation(() => {});
		const timer = createPerfTimer({ log: true });
		timer.lap('my-step');
		const message = spy.mock.calls[0]?.[0] as string;
		expect(message).toContain('my-step');
		spy.mockRestore();
	});

	it('log:true stop message should include "stop" and "total"', () => {
		const spy = spyOn(console, 'log').mockImplementation(() => {});
		const timer = createPerfTimer({ log: true });
		timer.stop();
		const message = spy.mock.calls[0]?.[0] as string;
		expect(message).toContain('stop');
		expect(message).toContain('total');
		spy.mockRestore();
	});

	it('log:true stop message should include the number of laps', () => {
		const spy = spyOn(console, 'log').mockImplementation(() => {});
		const timer = createPerfTimer({ log: true });
		timer.lap('a');
		timer.lap('b');
		timer.stop();
		const stopMessage = spy.mock.calls[2]?.[0] as string;
		expect(stopMessage).toContain('2 laps');
		spy.mockRestore();
	});

	// ─── label option ─────────────────────────────────────────────────────────

	it('label option should appear in lap log messages', () => {
		const spy = spyOn(console, 'log').mockImplementation(() => {});
		const timer = createPerfTimer({ label: 'myPipeline', log: true });
		timer.lap('step');
		const message = spy.mock.calls[0]?.[0] as string;
		expect(message).toContain('myPipeline');
		spy.mockRestore();
	});

	it('label option should appear in stop log messages', () => {
		const spy = spyOn(console, 'log').mockImplementation(() => {});
		const timer = createPerfTimer({ label: 'myPipeline', log: true });
		timer.stop();
		const message = spy.mock.calls[0]?.[0] as string;
		expect(message).toContain('myPipeline');
		spy.mockRestore();
	});

	it('when label is omitted, log messages should contain the default prefix', () => {
		const spy = spyOn(console, 'log').mockImplementation(() => {});
		const timer = createPerfTimer({ log: true });
		timer.lap('step');
		const message = spy.mock.calls[0]?.[0] as string;
		expect(message).toContain('createPerfTimer');
		spy.mockRestore();
	});

	it('label does not affect timing or returned data', () => {
		const timer = createPerfTimer({ label: 'X' });
		const lap = timer.lap('step');
		expect(lap.label).toBe('step');
		expect(lap.durationMs).toBeGreaterThanOrEqual(0);
	});

	// ─── onLap option ─────────────────────────────────────────────────────────

	it('onLap should be called once per lap', () => {
		const onLap = jest.fn();
		const timer = createPerfTimer({ onLap });
		timer.lap('a');
		timer.lap('b');
		timer.lap('c');
		expect(onLap).toHaveBeenCalledTimes(3);
	});

	it('onLap should receive the correct PerfTimerLap object', () => {
		const received: Array<{ label: string; durationMs: number; elapsedMs: number }> = [];
		const timer = createPerfTimer({
			onLap(lap) {
				received.push({ label: lap.label, durationMs: lap.durationMs, elapsedMs: lap.elapsedMs });
			},
		});
		timer.lap('alpha');
		timer.lap('beta');
		expect(received[0]!.label).toBe('alpha');
		expect(received[1]!.label).toBe('beta');
		expect(received[0]!.durationMs).toBeGreaterThanOrEqual(0);
		expect(received[1]!.elapsedMs).toBeGreaterThanOrEqual(received[0]!.elapsedMs);
	});

	it('onLap should receive the same object that lap() returns', () => {
		let captured: unknown;
		const timer = createPerfTimer({ onLap: (lap) => { captured = lap; } });
		const returned = timer.lap('step');
		expect(captured).toEqual(returned);
	});

	it('onLap should not be called by stop()', () => {
		const onLap = jest.fn();
		const timer = createPerfTimer({ onLap });
		timer.stop();
		expect(onLap).not.toHaveBeenCalled();
	});

	it('onLap throwing should not propagate to the caller', () => {
		const timer = createPerfTimer({
			onLap() {
				throw new Error('onLap exploded');
			},
		});
		expect(() => timer.lap('step')).not.toThrow();
	});

	it('onLap throwing should not prevent the lap entry from being returned', () => {
		const timer = createPerfTimer({
			onLap() {
				throw new Error('onLap exploded');
			},
		});
		const lap = timer.lap('step');
		expect(lap.label).toBe('step');
	});

	it('onLap throwing should not prevent the lap from being recorded in stop()', () => {
		const timer = createPerfTimer({
			onLap() {
				throw new Error('onLap exploded');
			},
		});
		timer.lap('step');
		const { laps } = timer.stop();
		expect(laps).toHaveLength(1);
		expect(laps[0]!.label).toBe('step');
	});

	it('onLap throwing should not prevent subsequent laps from working', () => {
		let calls = 0;
		const timer = createPerfTimer({
			onLap() {
				calls++;
				throw new Error('boom');
			},
		});
		timer.lap('a');
		timer.lap('b');
		expect(calls).toBe(2);
	});

	// ─── onStop option ────────────────────────────────────────────────────────

	it('onStop should be called when stop() is invoked', () => {
		const onStop = jest.fn();
		const timer = createPerfTimer({ onStop });
		timer.stop();
		expect(onStop).toHaveBeenCalledTimes(1);
	});

	it('onStop should receive a PerfTimerResult with all recorded laps', () => {
		let captured: { laps: Array<{ label: string }>; totalMs: number } | undefined;
		const timer = createPerfTimer({
			onStop(result) {
				captured = result;
			},
		});
		timer.lap('x');
		timer.lap('y');
		timer.stop();
		expect(captured!.laps).toHaveLength(2);
		expect(captured!.laps[0]!.label).toBe('x');
		expect(captured!.totalMs).toBeGreaterThanOrEqual(0);
	});

	it('onStop result should be the same snapshot that stop() returns', () => {
		let captured: unknown;
		const timer = createPerfTimer({ onStop: (r) => { captured = r; } });
		timer.lap('step');
		const returned = timer.stop();
		expect(captured).toEqual(returned);
	});

	it('onStop should be called each time stop() is called', () => {
		const onStop = jest.fn();
		const timer = createPerfTimer({ onStop });
		timer.stop();
		timer.stop();
		expect(onStop).toHaveBeenCalledTimes(2);
	});

	it('onStop should not be called by lap()', () => {
		const onStop = jest.fn();
		const timer = createPerfTimer({ onStop });
		timer.lap('a');
		expect(onStop).not.toHaveBeenCalled();
	});

	it('onStop throwing should not propagate to the caller', () => {
		const timer = createPerfTimer({
			onStop() {
				throw new Error('onStop exploded');
			},
		});
		expect(() => timer.stop()).not.toThrow();
	});

	it('onStop throwing should not prevent stop() from returning the result', () => {
		const timer = createPerfTimer({
			onStop() {
				throw new Error('onStop exploded');
			},
		});
		timer.lap('step');
		const result = timer.stop();
		expect(result.laps).toHaveLength(1);
		expect(result.totalMs).toBeGreaterThanOrEqual(0);
	});

	it('onStop result snapshot should not be mutated by laps added after stop()', () => {
		let captured: { laps: unknown[] } | undefined;
		const timer = createPerfTimer({ onStop: (r) => { captured = r; } });
		timer.lap('a');
		timer.stop();
		timer.lap('b');
		expect(captured!.laps).toHaveLength(1);
	});

	// ─── Combined options ──────────────────────────────────────────────────────

	it('log and onLap should both fire on each lap', () => {
		const spy = spyOn(console, 'log').mockImplementation(() => {});
		const onLap = jest.fn();
		const timer = createPerfTimer({ log: true, onLap });
		timer.lap('step');
		expect(spy).toHaveBeenCalledTimes(1);
		expect(onLap).toHaveBeenCalledTimes(1);
		spy.mockRestore();
	});

	it('log and onStop should both fire on stop()', () => {
		const spy = spyOn(console, 'log').mockImplementation(() => {});
		const onStop = jest.fn();
		const timer = createPerfTimer({ log: true, onStop });
		timer.stop();
		expect(spy).toHaveBeenCalledTimes(1);
		expect(onStop).toHaveBeenCalledTimes(1);
		spy.mockRestore();
	});

	it('all four options together should work correctly', () => {
		const spy = spyOn(console, 'log').mockImplementation(() => {});
		const lapsReceived: string[] = [];
		let stopResult: { totalMs: number; laps: unknown[] } | undefined;

		const timer = createPerfTimer({
			label: 'full',
			log: true,
			onLap: (lap) => lapsReceived.push(lap.label),
			onStop: (r) => { stopResult = r; },
		});

		timer.lap('one');
		timer.lap('two');
		timer.stop();

		expect(lapsReceived).toEqual(['one', 'two']);
		expect(stopResult!.laps).toHaveLength(2);
		// 2 lap logs + 1 stop log
		expect(spy).toHaveBeenCalledTimes(3);
		const lapLog = spy.mock.calls[0]?.[0] as string;
		expect(lapLog).toContain('full');
		spy.mockRestore();
	});

	it('onLap throwing should not prevent log output from being printed', () => {
		const spy = spyOn(console, 'log').mockImplementation(() => {});
		const timer = createPerfTimer({
			log: true,
			onLap() { throw new Error('boom'); },
		});
		timer.lap('step');
		expect(spy).toHaveBeenCalledTimes(1);
		spy.mockRestore();
	});

	it('onStop throwing should not prevent log output from being printed', () => {
		const spy = spyOn(console, 'log').mockImplementation(() => {});
		const timer = createPerfTimer({
			log: true,
			onStop() { throw new Error('boom'); },
		});
		timer.stop();
		expect(spy).toHaveBeenCalledTimes(1);
		spy.mockRestore();
	});

	it('empty options object should behave the same as no options', () => {
		const spy = spyOn(console, 'log').mockImplementation(() => {});
		const timer = createPerfTimer({});
		timer.lap('a');
		timer.stop();
		expect(spy).not.toHaveBeenCalled();
		spy.mockRestore();
	});
});
